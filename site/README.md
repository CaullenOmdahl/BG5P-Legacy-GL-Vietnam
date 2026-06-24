# BG5P Legacy GL Website

Next.js site for `bg5.caphedigital.com`.

## Local Development

```bash
npm install
npm run dev -- -p 3011
```

## MiniMax Diagnostic Chatbot

The site includes a same-origin chatbot at `/api/chat`, a global `Ask BG5P` widget, and a homepage AI workbench entry point. The browser never receives the MiniMax key; the API route reads it from server environment variables.

The chat request can include:

- `locale`: `en` or `vi`
- `diagnosticMode`: `diagnose`, `decode-code`, `find-part`, or `find-manual`
- `intake`: symptom, flash code, starts/runs state, condition, and recent work
- `pageContext`: current site path and page title

The API may use internal RAG files for reasoning, but user-facing `sources` are restricted to public `https://bg5.caphedigital.com/...` links.

The server uses MiniMax's Anthropic-compatible Messages API at `/anthropic/v1/messages`, matching the recommended text integration path from MiniMax's docs index.

Required production variable:

```bash
MINIMAX_API_KEY=...
```

Optional variables are documented in `.env.example`:

```bash
MINIMAX_API_BASE=https://api.minimax.io
MINIMAX_MODEL=MiniMax-M2.7-highspeed
MINIMAX_MAX_TOKENS=1800
MINIMAX_TEMPERATURE=1
MINIMAX_TOP_P=0.95
```

The deployable chatbot knowledge lives in `chatbot-knowledge/`. Regenerate it after changing the GPT pack:

```bash
cd ..
python scripts/build_site_chatbot_knowledge.py
```

The Docker image copies `public/`, `chatbot-knowledge/`, the standalone Next server, and static assets into the runtime image.

## Build

```bash
npm run build
```
