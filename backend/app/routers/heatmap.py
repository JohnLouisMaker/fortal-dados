from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(prefix="/heatmap", tags=["heatmap"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
HEATMAP_PATH = DATA_DIR / "03_output" / "result_heatmap.csv"
COLUMNS_REQUIRED = ["lat", "lng", "quantidade_lentidao"]


class HeatmapPayload(BaseModel):
    total: int
    count: int
    columns: list[str]
    data: list[list[Any]]


_df: pd.DataFrame | None = None
_PRECOMPUTED_SAMPLES: dict[int, HeatmapPayload] = {}


def load_heatmap_data() -> bool:
    global _df, _PRECOMPUTED_SAMPLES
    if not HEATMAP_PATH.exists():
        return False
    try:
        _df = pd.read_csv(
            HEATMAP_PATH,
            sep=None,
            engine="python",
            encoding="utf-8",
            usecols=COLUMNS_REQUIRED,
        )
        for n in [1_000, 5_000, 10_000, 25_000]:
            if n > len(_df):
                break
            sample = _df.sample(n=n, random_state=42)
            _PRECOMPUTED_SAMPLES[n] = HeatmapPayload(
                total=len(_df),
                count=n,
                columns=COLUMNS_REQUIRED,
                data=sample[COLUMNS_REQUIRED].values.tolist(),
            )
        _PRECOMPUTED_SAMPLES[-1] = HeatmapPayload(
            total=len(_df),
            count=len(_df),
            columns=COLUMNS_REQUIRED,
            data=_df[COLUMNS_REQUIRED].values.tolist(),
        )
        return True
    except Exception:
        return False


load_success = load_heatmap_data()


@router.get("")
async def listar_heatmap(
    amostra: int = Query(5_000, ge=100, le=50_000),
    completo: bool = Query(False),
) -> HeatmapPayload:
    if not load_success or _df is None:
        raise HTTPException(status_code=503)

    if completo:
        return _PRECOMPUTED_SAMPLES[-1]

    if cached := _PRECOMPUTED_SAMPLES.get(amostra):
        return cached

    limite = min(amostra, len(_df))
    sample = _df.sample(n=limite, random_state=42)
    return HeatmapPayload(
        total=len(_df),
        count=limite,
        columns=COLUMNS_REQUIRED,
        data=sample[COLUMNS_REQUIRED].values.tolist(),
    )
