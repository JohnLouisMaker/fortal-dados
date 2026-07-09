from app.model.chatModel import Chat
from app.services.bairro_service import buscar_bairro
from app.services.llm_service import enviar_para_llm
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/chat", tags=["chatbot"])


@router.post("")
async def chat(request: Chat):
    if not request.message:
        raise HTTPException(status_code=400, detail="message is required")

    bairro = buscar_bairro(request.message)
    response = enviar_para_llm(request.message, bairro)

    return {
        "status": "ok",
        "bairro_detectado": bairro,
        "response": response,
    }
