from app.config.config import settings
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_groq import ChatGroq

llm = ChatGroq(
    api_key=settings.groq_api_chatbot_key,
    model="llama-3.1-8b-instant",
    temperature=0.7,
)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Você é um assistente virtual especialista em transporte público de Fortaleza (ETUFOR). Seja prestativo, use dados locais e responda de forma direta.",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{request}"),
    ]
)

parser = StrOutputParser()
chain = prompt | llm | parser


store = {}


def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="request",
    history_messages_key="history",
)
