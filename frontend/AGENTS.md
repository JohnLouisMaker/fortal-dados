# Frontend Agent – Fortaleza em Dados

## Contexto

App React para visualização de mobilidade urbana de Fortaleza-CE.

Stack: React 19, TypeScript, Vite, Leaflet + react-leaflet, leaflet.heat, PapaParse, MapTiler, Tailwind CSS.

## Estrutura

- `src/`: código da aplicação.
- `src/components/`: componentes.
- `src/pages/`: telas ou seções principais.
- `src/services/`: chamadas à API.
- `src/types/`: tipos TypeScript.
- `src/hooks/`: hooks customizados.
- `public/`: arquivos públicos.

Antes de editar, leia a estrutura real. Não crie pastas ou caminhos inventados.

## Comandos (Linux)

```bash
cd frontend
npm install
npm run dev
npm run build
```

Variáveis:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_MAPTILER_KEY=sua_chave_maptiler
```

Nunca coloque chaves privadas no frontend. `VITE_*` é público.

## API

Use `VITE_API_URL` como base. Preserve os endpoints:

- `GET /bairros`
- `GET /bairros/nomes`
- `GET /bairros/{nome}/stats`
- `GET /paradas`
- `GET /heatmap`
- `POST /chat`

Chat envia:

```ts
{
  message: string;
  session_id: string;
}
```

Resposta pode ter texto + `bairro_detectado`.

Trate: loading, erro de rede, resposta vazia, API indisponível e sessão do chatbot.

## Mapa

- Use Leaflet e `react-leaflet`.
- Preserve o mapa interativo e os controles existentes.
- Exiba as 4.784 paradas só com zoom ≥ 14.
- Preserve camada de bairros (121 polígonos) e heatmap azul → laranja → vermelho.
- Mantenha filtro de bounding box.
- Não renderize milhares de pontos desnecessariamente a cada atualização.
- Ao receber `bairro_detectado`, destaque o bairro correspondente.
- Não use coordenadas inventadas; valide lat/lng e GeoJSON.

## TypeScript e React

- Evite `any`; use interfaces existentes ou crie novas.
- Mantenha componentes pequenos e hooks corretos.
- Não mutile estado diretamente; dê `key` estável para listas.
- Centralize chamadas HTTP quando já houver camada de serviço.
- Preserve responsividade e acessibilidade.
- Não troque bibliotecas sem solicitação.

## UI e estilo

- Use Tailwind conforme os padrões existentes.
- Preserve loading screen, painel de filtros e ChatBox.
- Não remova funcionalidades para simplificar.
- Evite estilos inline quando houver classe Tailwind equivalente.
- Mantenha contraste, foco de teclado e labels.

## Workflow

1. Leia o componente e tipos relacionados.
2. Confirme o contrato da API.
3. Faça a menor mudança possível.
4. Rode `npm run build`.
5. Verifique o comportamento no mapa e no chat.
6. Informe arquivos alterados e validações executadas.

Não reformate arquivos inteiros nem refatore áreas não relacionadas à tarefa.
