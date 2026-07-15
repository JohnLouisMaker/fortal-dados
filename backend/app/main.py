from app.config.config import settings
from app.routers import bairros, chatbot, heatmap, paradas, stats
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Fortaleza em Dados API",
    description="API de mobilidade urbana de Fortaleza — dados da ETUFOR/AMC",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Routers
app.include_router(bairros.router)
app.include_router(paradas.router)
app.include_router(heatmap.router)
app.include_router(stats.router)
app.include_router(chatbot.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "projeto": "Fortaleza em Dados"}
