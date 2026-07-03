import json
import unicodedata
from pathlib import Path

import geopandas as gpd
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shapely.ops import orient
from shapely.validation import make_valid

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
GEO_PATH = DATA_DIR / "04_geo" / "fullmapfortaleza.geojson"
PARADAS_PATH = DATA_DIR / "01_raw" / "bus_stops.csv"
HEATMAP_PATH = DATA_DIR / "03_output" / "result_heatmap.csv"


_bairros_gdf: gpd.GeoDataFrame | None = None
_paradas_df: pd.DataFrame | None = None
_heatmap_df: pd.DataFrame | None = None


def _close_ring(coords: list) -> list:
    if not coords or len(coords) < 4:
        return coords
    if coords[0] != coords[-1]:
        coords = coords + [coords[0]]
    return coords


def _fix_geometry(geom_dict: dict) -> dict:
    if geom_dict["type"] == "Polygon":
        geom_dict["coordinates"] = [
            _close_ring(ring) for ring in geom_dict["coordinates"]
        ]
    elif geom_dict["type"] == "MultiPolygon":
        geom_dict["coordinates"] = [
            [_close_ring(ring) for ring in poly] for poly in geom_dict["coordinates"]
        ]
    return geom_dict


def _load_geojson() -> gpd.GeoDataFrame | None:
    try:
        with open(GEO_PATH, encoding="utf-8") as f:
            data = json.load(f)

        for feature in data.get("features", []):
            if feature.get("geometry"):
                feature["geometry"] = _fix_geometry(feature["geometry"])

        gdf = gpd.GeoDataFrame.from_features(data["features"], crs="EPSG:4326")
        gdf["geometry"] = gdf["geometry"].apply(
            lambda g: orient(g, sign=1.0) if g else g
        )

        invalid = ~gdf.geometry.is_valid
        if invalid.any():
            gdf.loc[invalid, "geometry"] = gdf.loc[invalid, "geometry"].apply(
                make_valid
            )

        return gdf
    except FileNotFoundError:
        return None


_bairros_gdf = _load_geojson()


_paradas_df = pd.read_csv(PARADAS_PATH) if PARADAS_PATH.exists() else pd.DataFrame()
_heatmap_df = (
    pd.read_csv(
        HEATMAP_PATH,
        sep=None,
        engine="python",
        usecols=["lat", "lng", "quantidade_lentidao"],
    )
    if HEATMAP_PATH.exists()
    else pd.DataFrame()
)


# Schemas
class ParadasStats(BaseModel):
    total: int


class LentidaoStats(BaseModel):
    pontos_registrados: int
    intensidade_total: float
    intensidade_media: float


class BairroStats(BaseModel):
    bairro: str
    paradas_onibus: ParadasStats
    lentidao: LentidaoStats


# Router
router = APIRouter(prefix="/bairros", tags=["stats"])


def _norm(texto: str) -> str:
    return (
        unicodedata.normalize("NFKD", texto)
        .encode("ascii", "ignore")
        .decode()
        .strip()
        .lower()
    )


def _pontos_dentro(df: pd.DataFrame, poligono) -> pd.DataFrame:
    if df.empty or poligono is None:
        return pd.DataFrame()

    gdf_points = gpd.GeoDataFrame(
        df, geometry=gpd.points_from_xy(df["lng"], df["lat"]), crs="EPSG:4326"
    )
    return df[gdf_points.within(poligono).values].copy()


@router.get("/{nome}/stats")
async def stats_bairro(nome: str) -> BairroStats:
    if _bairros_gdf is None:
        raise HTTPException(status_code=503, detail="GeoJSON não carregado")

    alvo = _norm(nome)
    match = _bairros_gdf[_bairros_gdf["name"].apply(lambda n: _norm(str(n)) == alvo)]

    if match.empty:
        match = _bairros_gdf[
            _bairros_gdf["name"].apply(lambda n: alvo in _norm(str(n)))
        ]

    if match.empty:
        raise HTTPException(status_code=404, detail=f"Bairro '{nome}' não encontrado")

    bairro = match.iloc[0]
    poligono = bairro.geometry

    paradas = _pontos_dentro(_paradas_df, poligono)
    lentidao = _pontos_dentro(_heatmap_df, poligono)

    col = "quantidade_lentidao"
    tem_col = col in lentidao.columns and not lentidao.empty

    return BairroStats(
        bairro=str(bairro["name"]),
        paradas_onibus=ParadasStats(total=len(paradas)),
        lentidao=LentidaoStats(
            pontos_registrados=len(lentidao),
            intensidade_total=float(lentidao[col].sum()) if tem_col else 0.0,
            intensidade_media=float(lentidao[col].mean())
            if tem_col and len(lentidao) > 0
            else 0.0,
        ),
    )
