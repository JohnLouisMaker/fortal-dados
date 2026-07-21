from app.config.config import settings
from langchain_groq import ChatGroq

llm = ChatGroq(
    api_key=settings.groq_api_chatbot_key,
    model="llama-3.1-8b-instant",
    temperature=0.7,
)

res = llm.invoke("Qual capital do Brasil?")


print(res)
