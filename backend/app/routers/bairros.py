import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

CURRENT_PATH = Path(__file__).resolve()
ROOT_PATH = CURRENT_PATH.parent.parent.parent
DATA_DIR = ROOT_PATH / "data"
GEOJSON_PATH = DATA_DIR / "04_geo" / "fullmapfortaleza.geojson"

try:
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        _bairros_geojson = json.load(f)
    _nomes = sorted(
        {
            feat["properties"].get("name", "")
            for feat in _bairros_geojson["features"]
            if feat["properties"].get("name")
        }
    )
except FileNotFoundError:
    _bairros_geojson = None
    _nomes = []

router = APIRouter(prefix="/bairros", tags=["bairros"])


@router.get("")
async def listar_bairros():
    if _bairros_geojson is None:
        raise HTTPException(
            status_code=503,
            detail=f"Arquivo GeoJSON não encontrado em: {GEOJSON_PATH}",
        )
    return _bairros_geojson


@router.get("/nomes")
async def listar_nomes():
    if not _nomes:
        raise HTTPException(status_code=503, detail="Dados de bairros indisponíveis.")
    return {"total": len(_nomes), "bairros": _nomes}
