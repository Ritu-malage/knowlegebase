# Overview
Welcome to my central repository for notes and resources.

This repository contains structured notes across multiple technical domains that I am currently learning and working on. The goal is to organize concepts, tools, workflows, and practical knowledge in a clear and systematic manner. The content is continuously updated as I deepen my understanding and expand into new areas.

# Table of Contents
|No.|Topic|Sub Topics
|---|---|---|
|1|[AI-ML](./AI_ML/README.md)| [MLFlow](./AI_ML/mlflow/README.md) `<br />` [LangGraph](./AI_ML/genAI/langgraph/README.md)|

# Purpose
- Consolidate learning in one place
- Maintain structured and organized notes
- Create a long-term knowledge reference

## Docusaurus Execution Steps

### 1) Local setup
From the repo root:

```bash
cd site
npm install
```

### 2) Run locally (dev server)

```bash
cd site
npm start
```

This starts the local Docusaurus server for preview.

### 3) Build docs (includes notebook rendering)

```bash
cd site
npm run build
```

What this build does:
- Syncs markdown notes into `site/docs` (`docs:sync:markdown`)
- Renders `.ipynb` notebooks into Docusaurus markdown using Quarto (`docs:render:notebooks`)
- Builds the static site into `site/build`

### 4) GitHub Pages deployment

- Workflow file: `.github/workflows/deploy.yml`
- Trigger: push to `main` branch (or manual run via GitHub Actions)
- Deploy target: `gh-pages` branch
- Published URL: `https://ritumalage.github.io/knowlegebase/`

### 5) First-time Pages setup (GitHub UI)

In your repository settings:
- Go to **Settings -> Pages**
- Set **Source** to **Deploy from a branch**
- Select branch **`gh-pages`** and folder **`/ (root)`**


> NOTE: This repository is maintained as a personal knowledge base and will continue to evolve as I learn and explore new areas.