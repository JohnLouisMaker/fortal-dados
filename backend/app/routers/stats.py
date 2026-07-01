import unicodedata
from pathlib import Path

import geopandas as gpd
import pandas as pd
from fastapi import APIRouter, HTTPException

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"

try:
    _bairros_gdf = gpd.read_file(DATA_DIR / "04_geo" / "fullmapfortaleza.geojson")
    _bairros_gdf = _bairros_gdf.set_crs(epsg=4326, allow_override=True)
except Exception:
    _bairros_gdf = None

try:
    _paradas_df = pd.read_csv(DATA_DIR / "01_raw" / "bus_stops.csv")
except FileNotFoundError:
    _paradas_df = None

try:
    _heatmap_df = pd.read_csv(DATA_DIR / "03_output" / "result_heatmap.csv")
except FileNotFoundError:
    _heatmap_df = None

router = APIRouter(prefix="/bairros", tags=["stats"])


def _norm(texto: str) -> str:
    """Remove acentos e normaliza pra comparação de nomes de bairro."""
    return (
        unicodedata.normalize("NFKD", texto)
        .encode("ascii", "ignore")
        .decode()
        .strip()
        .lower()
    )


def _pontos_dentro(
    df: pd.DataFrame, poligono, lat_col="lat", lng_col="lng"
) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame()
    gdf = gpd.GeoDataFrame(
        df,
        geometry=gpd.points_from_xy(df[lng_col], df[lat_col]),
        crs="EPSG:4326",
    )
    return df[gdf.within(poligono).values]


@router.get("/{nome}/stats")
async def stats_bairro(nome: str):
    if _bairros_gdf is None:
        raise HTTPException(status_code=503, detail="GeoJSON de bairros indisponível.")

    alvo = _norm(nome)
    match = _bairros_gdf[_bairros_gdf["name"].apply(lambda n: _norm(str(n)) == alvo)]

    if match.empty:
        match = _bairros_gdf[
            _bairros_gdf["name"].apply(lambda n: alvo in _norm(str(n)))
        ]

    if match.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Bairro '{nome}' não encontrado. "
            "Use GET /bairros/nomes para ver a lista completa.",
        )

    bairro = match.iloc[0]
    poligono = bairro.geometry

    paradas = _pontos_dentro(_paradas_df, poligono)
    lentidao = _pontos_dentro(_heatmap_df, poligono)

    col_lentidao = (
        "quantidade_lentidao" if "quantidade_lentidao" in lentidao.columns else None
    )

    return {
        "bairro": bairro["name"],
        "paradas_onibus": {
            "total": len(paradas),
        },
        "lentidao": {
            "pontos_registrados": len(lentidao),
            "intensidade_total": (
                float(lentidao[col_lentidao].sum())
                if col_lentidao and not lentidao.empty
                else 0
            ),
            "intensidade_media": (
                float(lentidao[col_lentidao].mean())
                if col_lentidao and not lentidao.empty
                else 0
            ),
        },
    }
