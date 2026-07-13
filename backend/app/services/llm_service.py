from app.config.config import settings
from groq import Groq

client = Groq(api_key=settings.groq_api_chatbot_key)
HISTORY_CHAT = {}


def enviar_para_llm(
    request: str, neighborhood: str = None, session_id: str = ""
) -> str:

    system_prompt = (
        "Você é um assistente virtual especialista em transporte público de Fortaleza (ETUFOR). "
        "Seja prestativo, use dados locais e responda de forma direta."
    )

    if neighborhood:
        system_prompt += f" O usuário está perguntando especificamente sobre o bairro: {neighborhood}. Use essa informação de forma natural."

    if session_id not in HISTORY_CHAT:
        HISTORY_CHAT[session_id] = [{"role": "system", "content": system_prompt}]

    HISTORY_CHAT[session_id].append({"role": "user", "content": request})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=HISTORY_CHAT[session_id],
    )

    response_bot = response.choices[0].message.content

    HISTORY_CHAT[session_id].append({"role": "assistant", "content": response_bot})

    return response_bot
