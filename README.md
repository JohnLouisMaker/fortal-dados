# Fortaleza em Dados

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

Plataforma de análise de mobilidade urbana de Fortaleza-CE, combinando mapas interativos com inteligência artificial conversacional sobre dados públicos de transporte.

> Projeto de portfólio full-stack — dados reais da ETUFOR/AMC processados em Python e visualizados em React com chatbot de IA integrado.

---

## Tecnologias

### Frontend
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build e dev server
- [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) — mapas interativos
- [leaflet.heat](https://github.com/Leaflet/Leaflet.heat) — camada de heatmap
- [PapaParse](https://www.papaparse.com/) — leitura de CSVs no browser
- [MapTiler](https://www.maptiler.com/) — tiles de mapa (estilo `dataviz`)
- [Tailwind CSS](https://tailwindcss.com/) — estilização

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) — API REST em Python
- [Pandas](https://pandas.pydata.org/) + [GeoPandas](https://geopandas.org/) — processamento de dados geoespaciais
- [Groq](https://groq.com/) (Llama 3) — chatbot de IA; [LangChain](https://www.langchain.com/) planejado para agente com múltiplas ferramentas e RAG
- [RapidFuzz](https://github.com/rapidfuzz/RapidFuzz) — fuzzy matching de nomes de bairros

### Dados
- Portal de Dados Abertos de Fortaleza — [dados.fortaleza.ce.gov.br](https://dados.fortaleza.ce.gov.br)
- OpenStreetMap / Overpass API — geometria dos bairros

---

## Arquitetura

```
┌──────────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│        Frontend          │  ───────────────────▶   │       API FastAPI        │
│   React + TypeScript     │                         │   (Python / Pydantic)    │
│   Leaflet + MapTiler     │  ◀───────────────────   │  bairros · paradas ·     │
│   ChatBox                │        JSON             │  heatmap · stats · chat  │
└──────────────────────────┘                         └────────────┬─────────────┘
                                                                   │
                                        ┌──────────────────────────┼──────────────────────────┐
                                        ▼                          ▼                          ▼
                                ┌───────────────┐        ┌───────────────────┐      ┌───────────────────┐
                                │ Dados locais  │        │  Groq / Llama 3   │      │ RapidFuzz (fuzzy  │
                                │ CSV + GeoJSON │        │  (chatbot de IA)  │      │ match de bairros) │
                                │ ETUFOR / OSM  │        └───────────────────┘      └───────────────────┘
                                └───────────────┘
```

Fluxo: o **Frontend** (React/Leaflet) consome a **API FastAPI**, que lê os dados
locais (CSV/GeoJSON da ETUFOR/OSM) e delega ao **Groq/Llama 3** as respostas do
chatbot. Quando a IA cita um bairro, ele é destacado no mapa.

---

## Dados processados

| Arquivo | Descrição | Registros |
|---|---|---|
| `bus_stops.csv` | Paradas de ônibus de Fortaleza | 4.784 paradas |
| `validation_grouped.csv` | Validações de bilhete por linha/hora | 1,17 milhão |
| `result_heatmap.csv` | Pontos de lentidão extraídos do GPS | 100.196 pontos |
| `fullmapfortaleza.geojson` | Polígonos dos 121 bairros (OSM) | 121 bairros |

---

## Funcionalidades

### Implementadas
- [x] Mapa interativo com tile MapTiler (estilo dataviz)
- [x] Camada de bairros (121 polígonos, bordas discretas)
- [x] Heatmap de lentidão com escala azul → laranja → vermelho
- [x] 4.784 paradas de ônibus (visíveis apenas com zoom ≥ 14)
- [x] Loading screen animada
- [x] Filtro de bounding box — descarta pontos fora de Fortaleza
- [x] Painel de filtros (toggle de camadas, seleção por bairro)
- [x] Backend FastAPI com endpoints de dados
- [x] Chatbot de IA (Groq/Llama 3) com memória por sessão
- [x] Integração mapa ↔ chatbot (bairro citado pela IA é destacado no mapa)

### Planejado
- [ ] Migração do chatbot para LangChain (agente com múltiplas ferramentas / Tools)
- [ ] RAG com documentos da ETUFOR (vector store)
- [ ] Deploy (frontend na Vercel, backend no Railway)

---

## API / Endpoints

Base URL padrão em desenvolvimento: `http://127.0.0.1:8000`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Health check da API |
| `GET` | `/bairros` | GeoJSON com os polígonos dos bairros |
| `GET` | `/bairros/nomes` | Lista de nomes de bairros disponíveis |
| `GET` | `/bairros/{nome}/stats` | Estatísticas do bairro (paradas e lentidão) |
| `GET` | `/paradas` | Paradas de ônibus (filtro opcional por bounding box: `lat_min`, `lat_max`, `lng_min`, `lng_max`) |
| `GET` | `/heatmap` | Pontos de lentidão (`amostra`, `completo`) |
| `POST` | `/chat` | Chatbot de IA — recebe `{ message, session_id }` e retorna resposta + `bairro_detectado` |

Documentação interativa (Swagger UI) disponível em `http://127.0.0.1:8000/docs`.

---

## Como rodar localmente

### Backend (FastAPI)

```bash
# a partir da raiz do repositório
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# variáveis de ambiente (backend/.env)
# GROQ_API_CHATBOT_KEY=coloque_sua_chave_groq_aqui

cd backend
uvicorn app.main:app --reload
```

A API sobe em `http://127.0.0.1:8000` (Swagger em `/docs`).

Crie um arquivo `backend/.env` com a chave da Groq:

```dotenv
# backend/.env
GROQ_API_CHATBOT_KEY=sua_chave_groq
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

O dev server sobe em `http://localhost:5173`.

Crie um arquivo `frontend/.env` com as variáveis usadas pelo frontend:

```dotenv
# frontend/.env
VITE_API_URL=http://127.0.0.1:8000
VITE_MAPTILER_KEY=sua_chave_maptiler
```

---

## Fonte dos dados

- **GPS e validações:** ETUFOR — Empresa de Transporte Urbano de Fortaleza
- **Paradas:** Portal Dados Abertos Fortaleza (2015)
- **Bairros:** OpenStreetMap via Overpass API (`admin_level=10`)

---

## Autor

**João Luis** — [@JohnLouisMaker](https://github.com/JohnLouisMaker)
