# Fortaleza em Dados — Domain Context

## Project

Mapa interativo de dados de mobilidade urbana de Fortaleza/CE.

## Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript + Leaflet
- **Data**: ETUFOR (órgão de mobilidade de Fortaleza), OpenStreetMap (OSM)

## Key concepts

| Term | Meaning |
|------|---------|
| ETUFOR | Empresa de Transporte Urbano de Fortaleza — fonte de dados de transporte público |
| OSM | OpenStreetMap — fonte de dados geoespaciais abertos |
| Linha | Rota de transporte público |
| Parada | Ponto de ônibus / parada de transporte público |
| Corredor | Via exclusiva ou prioritária para transporte público |

## Conventions

- API responses are **Pydantic-validated** before returning.
- Frontend uses **Leaflet** for map rendering, not Google Maps.
- All domain logic lives in the **backend**; frontend is a thin visualization layer.