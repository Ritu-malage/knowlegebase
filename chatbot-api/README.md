# Knowlegebase Chatbot API

This service powers the `/chat` page in Docusaurus.

## What it does

- Reads markdown content from `site/docs`
- Splits the docs into chunks
- Generates open-source embeddings through Ollama
- Stores sessions and messages in SQLite
- Answers questions with a local open-source chat model

## Default models

- Chat model: `qwen2.5:7b-instruct`
- Embedding model: `nomic-embed-text`

You can override both with environment variables:

```bash
export OLLAMA_CHAT_MODEL="qwen2.5:7b-instruct"
export OLLAMA_EMBED_MODEL="nomic-embed-text"
export OLLAMA_BASE_URL="http://localhost:11434"
```

## Run locally

1. Start Ollama and pull the models you want to use.
2. From the repo root, run:

```bash
cd chatbot-api
python server.py
```

The API listens on `http://localhost:8080`.

## Endpoints

- `GET /health`
- `GET /api/sessions?limit=20`
- `GET /api/sessions/{session_id}`
- `POST /api/chat`

## Docusaurus integration

Set the frontend API URL before starting the site:

```bash
export DOCUSAURUS_CHATBOT_API_URL="http://localhost:8080"
cd site
npm start
```

For deployment, point `DOCUSAURUS_CHATBOT_API_URL` to the hosted API domain.
