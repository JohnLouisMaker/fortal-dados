# Backend Agent – Fortaleza em Dados

## Contexto

API FastAPI (Python) para análise de mobilidade urbana de Fortaleza-CE.

Stack: FastAPI, Pydantic, Pandas/GeoPandas, RapidFuzz, Groq/Llama, CSV e GeoJSON locais.

## Estrutura

- `app/main.py`: app e rotas principais.
- `app/routers/`: endpoints por domínio.
- `app/services/`: regras de negócio e integrações.
- `app/models/`: modelos Pydantic.
- `app/data/`: CSVs e GeoJSON.
- `tests/`: testes.
- `.env`: variáveis locais; nunca versionar.

Antes de alterar, leia os arquivos reais. Não invente módulos ou caminhos.

## Comandos (Linux)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload
```

Docs: `http://127.0.0.1:8000/docs`

## Endpoints

Preserve os contratos atuais:

- `GET /`
- `GET /bairros`
- `GET /bairros/nomes`
- `GET /bairros/{nome}/stats`
- `GET /paradas`
- `GET /heatmap`
- `POST /chat`

`/chat` recebe:

```json
{ "message": "string", "session_id": "string" }
```

A resposta deve manter o campo de bairro detectado usado pelo frontend.

## Regras

- Use type hints e Pydantic para validar entradas.
- Preserve contratos de endpoints e formatos de resposta.
- Não carregue arquivos grandes repetidamente em cada requisição.
- Filtre coordenadas inválidas e pontos fora de Fortaleza.
- Use `RapidFuzz` para nomes de bairros com variações de escrita.
- Não exponha chaves, stack traces ou caminhos internos.
- Trate erros da Groq com resposta controlada.
- Não faça chamadas reais à Groq em testes.
- Não altere dados originais sem necessidade.

## Chatbot

- Responda só com base nos dados e no contexto disponíveis.
- Não invente estatísticas; diga quando não houver dados suficientes.
- Mantenha memória por `session_id` e detecção de bairros.
- LangChain e RAG são planejados; não implemente sem pedido explícito.

## Workflow

1. Entenda o endpoint/serviço afetado.
2. Leia os arquivos relacionados.
3. Faça a menor alteração possível.
4. Verifique imports, tipos e contrato JSON.
5. Informe arquivos alterados e validações executadas.

Não reformate arquivos inteiros nem faça refatorações fora do escopo.
