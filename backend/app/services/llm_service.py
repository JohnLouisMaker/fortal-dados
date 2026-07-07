from app.config.config import settings
from groq import Groq

client = Groq(api_key=settings.groq_api_chatbot_key)


def enviar_para_llm(request: str, neighborhood: str = None) -> str:

    system_prompt = (
        "Você é um assistente virtual especialista em transporte público de Fortaleza (ETUFOR). "
        "Seja prestativo, use dados locais e responda de forma direta."
    )

    if neighborhood:
        system_prompt += f" O usuário está perguntando especificamente sobre o bairro: {neighborhood}. Use essa informação de forma natural."

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request},
            {},
        ],
    )

    return response.choices[0].message.content
