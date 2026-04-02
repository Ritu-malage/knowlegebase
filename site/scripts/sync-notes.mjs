#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPT_DIR = __dirname; // site/scripts
const SITE_DIR = path.resolve(SCRIPT_DIR, '..');
const REPO_ROOT = path.resolve(SITE_DIR, '..');
const DOCS_ROOT = path.join(SITE_DIR, 'docs');
const GITHUB_REPO_BASE_URL = 'https://github.com/Ritu-malage/knowlegebase';
const GITHUB_SOURCE_BRANCH = 'main';
const NOTEBOOK_GITHUB_PREVIEW_PATHS = new Set([
  'site/docs/AI_ML/langgraph/practicals/practice1.ipynb',
]);

function isMarkdownFile(filePath) {
  return filePath.endsWith('.md');
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile() && isMarkdownFile(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function normalizeForGitHubUrl(filePath) {
  return filePath.split(path.sep).join('/');
}

function getGitHubBlobUrl(absolutePath) {
  const relativePath = path.relative(REPO_ROOT, absolutePath);
  if (relativePath.startsWith('..')) {
    return null;
  }

  return `${GITHUB_REPO_BASE_URL}/blob/${GITHUB_SOURCE_BRANCH}/${normalizeForGitHubUrl(relativePath)}`;
}

function shouldUseGitHubNotebookPreview(absolutePath) {
  const relativePath = path.relative(REPO_ROOT, absolutePath);
  if (relativePath.startsWith('..')) {
    return false;
  }

  return NOTEBOOK_GITHUB_PREVIEW_PATHS.has(normalizeForGitHubUrl(relativePath));
}

function rewriteIpynbLinksToGitHub(markdown, sourcePath) {
  // Rewrite relative notebook links so they open the source notebook on GitHub.
  return markdown.replace(/\]\(([^)]+?)\.ipynb(\#[^)]+)?\)/g, (_match, dest, anchor) => {
    if (dest.includes('://') || dest.startsWith('/')) {
      return _match;
    }

    const fixedAnchor = anchor ?? '';
    const notebookPath = path.resolve(path.dirname(sourcePath), `${dest}.ipynb`);
    if (!shouldUseGitHubNotebookPreview(notebookPath)) {
      return _match;
    }
    const githubUrl = getGitHubBlobUrl(notebookPath);

    if (!githubUrl) {
      return _match;
    }

    return `](${githubUrl}${fixedAnchor})`;
  });
}

function rewritePyLinksToMd(markdown) {
  // Rewrite markdown links to Python files so they point to generated docs pages.
  return markdown.replace(/\]\(([^)]+?)\.py(\#[^)]+)?\)/g, (_match, dest, anchor) => {
    const fixedAnchor = anchor ?? '';
    let fixedDest = dest;
    if (!fixedDest.includes('://')) {
      fixedDest = fixedDest.replace(/\/{2,}/g, '/');
    }
    return `](${fixedDest}.md${fixedAnchor})`;
  });
}

function collectRelativePyLinks(markdown) {
  const links = [];
  const pyLinkRegex = /\]\(([^)]+?)\.py(?:\#[^)]+)?\)/g;
  let match;

  while ((match = pyLinkRegex.exec(markdown)) !== null) {
    const dest = match[1];
    if (dest.includes('://') || dest.startsWith('/')) {
      continue;
    }
    links.push(`${dest}.py`);
  }

  return links;
}

function getFence(sourceText) {
  // Pick a fence longer than any backtick run in the source.
  const matches = sourceText.match(/`+/g) ?? [];
  const maxRun = matches.reduce((max, run) => Math.max(max, run.length), 0);
  return '`'.repeat(Math.max(3, maxRun + 1));
}

async function writePythonSourcePage({pythonSourcePath, destinationPath}) {
  const sourceText = await fs.readFile(pythonSourcePath, 'utf8');
  const fence = getFence(sourceText);
  const page = `${fence}python\n${sourceText}${sourceText.endsWith('\n') ? '' : '\n'}${fence}\n`;
  await ensureParentDir(destinationPath);
  await fs.writeFile(destinationPath, page, 'utf8');
}

async function ensureParentDir(filePath) {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
}

async function copyAndRewrite({sourcePath, destinationPath}) {
  let content = await fs.readFile(sourcePath, 'utf8');
  const pyLinks = collectRelativePyLinks(content);
  content = rewriteIpynbLinksToGitHub(content, sourcePath);
  content = rewritePyLinksToMd(content);

  await ensureParentDir(destinationPath);
  await fs.writeFile(destinationPath, content, 'utf8');

  return pyLinks;
}

async function main() {
  const sources = [
    {src: path.join(REPO_ROOT, 'AI_ML'), relDestRoot: 'AI_ML'},
    {src: path.join(REPO_ROOT, 'DevOps'), relDestRoot: 'DevOps'},
  ];

  // Root README becomes a landing page.
  const rootReadme = path.join(REPO_ROOT, 'README.md');
  const rootReadmeDest = path.join(DOCS_ROOT, 'index.md');

  const missing = [];
  for (const {src} of sources) {
    try {
      const stat = await fs.stat(src);
      if (!stat.isDirectory()) missing.push(src);
    } catch {
      missing.push(src);
    }
  }

  // We don't fail hard if one of the optional domains isn't present.
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`Sync: optional source directories missing: ${missing.join(', ')}`);
  }

  let filesSynced = 0;
  let pythonPagesGenerated = 0;
  const generatedPythonPages = new Set();

  if (await fs.stat(rootReadme).then(() => true).catch(() => false)) {
    const pyLinks = await copyAndRewrite({sourcePath: rootReadme, destinationPath: rootReadmeDest});
    filesSynced += 1;
    for (const pyLink of pyLinks) {
      const pythonSourcePath = path.resolve(path.dirname(rootReadme), pyLink);
      const destinationPath = path.resolve(
        path.dirname(rootReadmeDest),
        pyLink.replace(/\.py$/, '.md'),
      );
      const pageKey = path.normalize(destinationPath);
      if (generatedPythonPages.has(pageKey)) continue;

      if (await fs.stat(pythonSourcePath).then(() => true).catch(() => false)) {
        await writePythonSourcePage({pythonSourcePath, destinationPath});
        generatedPythonPages.add(pageKey);
        pythonPagesGenerated += 1;
      } else {
        // eslint-disable-next-line no-console
        console.log(`Sync: linked Python file not found (skipping): ${path.relative(REPO_ROOT, pythonSourcePath)}`);
      }
    }
    // eslint-disable-next-line no-console
    console.log(`Synced: ${path.relative(REPO_ROOT, rootReadme)} -> ${path.relative(REPO_ROOT, rootReadmeDest)}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Sync: root README not found at ${rootReadme} (skipping)`);
  }

  for (const {src, relDestRoot} of sources) {
    try {
      const stat = await fs.stat(src);
      if (!stat.isDirectory()) continue;
    } catch {
      continue;
    }

    const mdFiles = await walkFiles(src);
    for (const sourcePath of mdFiles) {
      const rel = path.relative(src, sourcePath);
      const destinationPath = path.join(DOCS_ROOT, relDestRoot, rel);
      const pyLinks = await copyAndRewrite({sourcePath, destinationPath});
      filesSynced += 1;

      for (const pyLink of pyLinks) {
        const pythonSourcePath = path.resolve(path.dirname(sourcePath), pyLink);
        const pyDestinationPath = path.resolve(
          path.dirname(destinationPath),
          pyLink.replace(/\.py$/, '.md'),
        );
        const pageKey = path.normalize(pyDestinationPath);
        if (generatedPythonPages.has(pageKey)) continue;

        if (await fs.stat(pythonSourcePath).then(() => true).catch(() => false)) {
          await writePythonSourcePage({pythonSourcePath, destinationPath: pyDestinationPath});
          generatedPythonPages.add(pageKey);
          pythonPagesGenerated += 1;
        } else {
          // eslint-disable-next-line no-console
          console.log(`Sync: linked Python file not found (skipping): ${path.relative(REPO_ROOT, pythonSourcePath)}`);
        }
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Sync: complete. ${filesSynced} markdown file(s) copied into ${path.relative(REPO_ROOT, DOCS_ROOT)}/`);
  // eslint-disable-next-line no-console
  console.log(`Sync: generated ${pythonPagesGenerated} Python source page(s).`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
