from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException, Query

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
PARADAS_PATH = DATA_DIR / "01_raw" / "bus_stops.csv"

try:
    _df = pd.read_csv(PARADAS_PATH)
except FileNotFoundError:
    _df = None

router = APIRouter(prefix="/paradas", tags=["paradas"])


@router.get("")
async def listar_paradas(
    lat_min: float | None = Query(None, description="Bounding box — lat mínima"),
    lat_max: float | None = Query(None, description="Bounding box — lat máxima"),
    lng_min: float | None = Query(None, description="Bounding box — lng mínima"),
    lng_max: float | None = Query(None, description="Bounding box — lng máxima"),
):
    if _df is None:
        raise HTTPException(
            status_code=503,
            detail=f"Arquivo não encontrado: {PARADAS_PATH}",
        )

    df = _df.copy()

    if None not in (lat_min, lat_max, lng_min, lng_max):
        df = df[
            (df["lat"] >= lat_min)
            & (df["lat"] <= lat_max)
            & (df["lng"] >= lng_min)
            & (df["lng"] <= lng_max)
        ]

    return {"total": len(df), "paradas": df.to_dict(orient="records")}
