# AI Genealogy Match & Storyteller

Ett full-stack projekt för att:

- importera släktdata (GEDCOM)
- matcha personer mot arkivkällor
- generera AI-berättelser om anor

## Nuvarande status

- Frontend-struktur ar uppsatt i [frontend](frontend)
- React + TypeScript + Vite ar konfigurerat
- Grundkomponenter, hooks och mockad API-layer finns pa plats

## Kom igang (Frontend)

Krav:

- Node.js 20+

Installera och starta:

```bash
cd frontend
npm install
npm run dev
```

Bygg for produktion:

```bash
cd frontend
npm run build
```

## Planerad arkitektur

- Frontend: React + TypeScript
- Backend: Node.js/TypeScript (API-gateway)
- ML-services: Python (matchning + storytelling)
- Databas: PostgreSQL

Se [Project.md](Project.md) for full teknisk specifikation (lokal arbetsfil).
