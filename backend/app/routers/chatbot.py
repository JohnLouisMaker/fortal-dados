from app.model.chatModel import Chat
from fastapi import APIRouter, HTTPException

chatbot_router = APIRouter(prefix="/chat", tags=["chatbot"])


@chatbot_router.post("")
async def chat(request: Chat):
    if not request.message:
        raise HTTPException(status_code=400, detail="message is required")
    return {"status": "ok", "message": request.message}
