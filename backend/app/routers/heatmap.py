from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException, Query

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
HEATMAP_PATH = DATA_DIR / "03_output" / "result_heatmap.csv"

try:
    _df = pd.read_csv(HEATMAP_PATH)
except FileNotFoundError:
    _df = None

router = APIRouter(prefix="/heatmap", tags=["heatmap"])


@router.get("")
async def listar_heatmap(
    amostra: int | None = Query(
        None,
        ge=100,
        description="Retorna N pontos aleatórios em vez dos ~100k completos",
    ),
):
    if _df is None:
        raise HTTPException(
            status_code=503,
            detail=f"Arquivo não encontrado: {HEATMAP_PATH}",
        )

    df = _df
    if amostra is not None and amostra < len(df):
        df = df.sample(n=amostra, random_state=42)
        

    return {"total": len(df), "pontos": df.to_dict(orient="records")}
