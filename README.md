
# Docusaurus Execution Steps

## 1. Local setup
From the repo root:

```bash
cd site
npm install
```

## 2. Run locally (dev server)

```bash
cd site
npm start
```

- This starts the local Docusaurus server for preview.

## 3. Build docs

```bash
cd site
npm run build
```

- What this build does:
    - Notebook rendering is disabled (no `.ipynb` -> `.md` conversion)
    - Builds the static site into `site/build`

## 4. GitHub Pages deployment

- Workflow file: `.github/workflows/deploy.yml`
- Trigger: push to `main` branch (or manual run via GitHub Actions)
- Deploy target: `gh-pages` branch
- Published URL: `https://ritumalage.github.io/knowlegebase/`

## 5. First-time Pages setup (GitHub UI)

In your repository settings:
- Go to **Settings -> Pages**
- Set **Source** to **Deploy from a branch**
- Select branch **`gh-pages`** and folder **`/ (root)`**




