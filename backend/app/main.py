from app.routers import bairros, heatmap, paradas, stats
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.config import settings
app = FastAPI(
    title="Fortaleza em Dados API",
    description="API de mobilidade urbana de Fortaleza — dados da ETUFOR/AMC",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Routers
app.include_router(bairros.router)
app.include_router(paradas.router)
app.include_router(heatmap.router)
app.include_router(stats.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "projeto": "Fortaleza em Dados"}


print(f"API rodando com sucesso! Chave do Groq API Chatbot: {settings.groq_api_chatbot_key}")
