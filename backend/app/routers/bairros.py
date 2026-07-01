from fastapi import APIRouter
from pathlib import Path
import json

CURRENT_PATH = Path(__file__).resolve()
ROOT_PATH = CURRENT_PATH.parent.parent
DATA_DOCS = ROOT_PATH / "data"
GEOJSON_PATH  = DATA_DOCS / "04_geo" / "fullmapfortaleza.geojson"

with open(GEOJSON_PATH, "r") as f:
    bairros = json.load(f)

bairro_router = APIRouter( prefix="/bairro", tags=["bairro"])


@bairro_router.get("/")
async def root():
    return {"message": "Hello World"}
