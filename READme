# Fortaleza em Dados

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

### Backend *(em desenvolvimento)*
- [FastAPI](https://fastapi.tiangolo.com/) — API REST em Python
- [Pandas](https://pandas.pydata.org/) + [GeoPandas](https://geopandas.org/) — processamento de dados
- [LangChain](https://www.langchain.com/) + [Groq](https://groq.com/) (Llama 3) — chatbot de IA

### Dados
- Portal de Dados Abertos de Fortaleza — [dados.fortaleza.ce.gov.br](https://dados.fortaleza.ce.gov.br)
- OpenStreetMap / Overpass API — geometria dos bairros

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

### Em desenvolvimento
- [ ] Painel de filtros (toggle de camadas, seleção por bairro)
- [ ] Backend FastAPI com endpoints de dados

### Planejado
- [ ] Chatbot de IA (LangChain + Groq/Llama 3)
- [ ] Integração mapa ↔ chatbot (bairro citado pela IA é destacado no mapa)
- [ ] Deploy (frontend na Vercel, backend no Railway)

---

## Fonte dos dados

- **GPS e validações:** ETUFOR — Empresa de Transporte Urbano de Fortaleza
- **Paradas:** Portal Dados Abertos Fortaleza (2015)
- **Bairros:** OpenStreetMap via Overpass API (`admin_level=10`)

---

## Autor

**João Luis** — [@JohnLouisMaker](https://github.com/JohnLouisMaker)