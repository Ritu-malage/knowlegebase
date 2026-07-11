import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import fs from 'fs';
import path from 'path';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const siteRoot = __dirname;
const repoRoot = path.resolve(siteRoot, '..');
const githubSourceBranch = 'main';
const githubRepoBaseUrl = 'https://github.com/Ritu-malage/knowlegebase';
const notebookGitHubPreviewPaths = new Set([
  'site/docs/AI_ML/langgraph/practicals/practice1.ipynb',
]);

function normalizePathForUrl(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function toGitHubBlobUrl(absolutePath: string): string | null {
  const relativePath = path.relative(repoRoot, absolutePath);
  if (relativePath.startsWith('..')) {
    return null;
  }

  return `${githubRepoBaseUrl}/blob/${githubSourceBranch}/${normalizePathForUrl(relativePath)}`;
}

function shouldUseGitHubNotebookPreview(absolutePath: string): boolean {
  const relativePath = path.relative(repoRoot, absolutePath);
  if (relativePath.startsWith('..')) {
    return false;
  }

  return notebookGitHubPreviewPaths.has(normalizePathForUrl(relativePath));
}

function isLocalNotebookPath(href: string): boolean {
  return !href.startsWith('http://') && !href.startsWith('https://') && href.toLowerCase().endsWith('.ipynb');
}

function rewriteNotebookLinksToGitHub() {
  return (tree: any, file: {path?: string}) => {
    const currentFilePath = file?.path;
    if (!currentFilePath) {
      return;
    }

    const walk = (node: any) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      if (node.type === 'link' && typeof node.url === 'string' && isLocalNotebookPath(node.url)) {
        const [hrefWithoutHash, hash = ''] = node.url.split('#', 2);
        const notebookAbsPath = path.resolve(path.dirname(currentFilePath), hrefWithoutHash);
        if (!shouldUseGitHubNotebookPreview(notebookAbsPath)) {
          return;
        }
        const githubUrl = toGitHubBlobUrl(notebookAbsPath);
        if (githubUrl) {
          node.url = hash ? `${githubUrl}#${hash}` : githubUrl;
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child);
        }
      }
    };

    walk(tree);
  };
}

const config: Config = {
  title: 'Knowlegebase',
  tagline: 'Notes, notebooks, and practical guides',
  favicon: 'img/home-brain-bulb.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ritumalage.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/knowlegebase/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ritumalage', // Usually your GitHub org/user name.
  projectName: 'knowlegebase', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [rewriteNotebookLinksToGitHub],
          sidebarItemsGenerator: async ({defaultSidebarItemsGenerator, ...args}) => {
            const items = await defaultSidebarItemsGenerator(args);
            const isHiddenSidebarDocId = (docId: string): boolean =>
              docId.split('/').includes('md_utils');
            const normalizeSidebarLabel = (label: string): string =>
              label.toLowerCase().replace(/[\s_-]+/g, '');
            const hiddenCategoryLabels = new Set(['mdutils', 'practicals']);
            const isHiddenCategory = (item: any): boolean =>
              item?.type === 'category' &&
              hiddenCategoryLabels.has(normalizeSidebarLabel(String(item?.label ?? '')));

            const docById = new Map(args.docs.map((d: any) => [d.id, d]));
            const sourceAbsPathToDocId = new Map(
              args.docs.map((d: any) => {
                const source = String(d.source ?? '');
                const sourceWithoutAlias = source.replace(/^@site\//, '');
                const absPath = path.isAbsolute(sourceWithoutAlias)
                  ? sourceWithoutAlias
                  : path.join(siteRoot, sourceWithoutAlias);
                return [absPath, d.id];
              }),
            );

            const resolveAbsPathFromDocId = (docId: string): string | null => {
              const doc = docById.get(docId);
              if (!doc) return null;
              const source = String(doc.source ?? '');
              const sourceWithoutAlias = source.replace(/^@site\//, '');
              if (!sourceWithoutAlias) return null;
              return path.isAbsolute(sourceWithoutAlias)
                ? sourceWithoutAlias
                : path.join(siteRoot, sourceWithoutAlias);
            };

            const tocEntriesCache = new Map<string, Array<{label: string; href: string}>>();

            const getTocEntriesForReadmeDocId = (
              readmeDocId: string,
            ): Array<{label: string; href: string}> => {
              if (tocEntriesCache.has(readmeDocId)) return tocEntriesCache.get(readmeDocId)!;

              const readmeAbsPath = resolveAbsPathFromDocId(readmeDocId);
              if (!readmeAbsPath) {
                tocEntriesCache.set(readmeDocId, []);
                return [];
              }

              let content: string;
              try {
                content = fs.readFileSync(readmeAbsPath, 'utf8');
              } catch {
                tocEntriesCache.set(readmeDocId, []);
                return [];
              }

              const links: Array<{label: string; href: string}> = [];
              const linkRegex = /(\!\[[^\]]*\]|\[([^\]]*)\])\(([^)]+)\)/g;
              let match: RegExpExecArray | null;
              while ((match = linkRegex.exec(content))) {
                const full = match[1] ?? '';
                const label = (match[2] ?? '').trim();
                const hrefRaw = (match[3] ?? '').trim();
                // Skip image links (e.g. ![alt](...))
                if (full.startsWith('![')) continue;

                // Ignore anchors and query params (we only use filesystem paths).
                const hrefNoAnchor = hrefRaw.split('#')[0].trim();
                if (!hrefNoAnchor) continue;

                // Only keep local markdown files.
                if (
                  hrefNoAnchor.startsWith('http://') ||
                  hrefNoAnchor.startsWith('https://')
                ) {
                  continue;
                }
                if (
                  !hrefNoAnchor.toLowerCase().endsWith('.md') &&
                  !hrefNoAnchor.toLowerCase().endsWith('.ipynb')
                ) {
                  continue;
                }

                links.push({label, href: hrefNoAnchor});
              }

              const readmeDir = path.dirname(readmeAbsPath);
              const orderedEntries: Array<{label: string; href: string}> = [];
              const seen = new Set<string>();

              for (const entry of links) {
                const resolvedAbs = path.resolve(readmeDir, entry.href);
                const key = normalizePathForUrl(resolvedAbs);
                if (seen.has(key)) continue;
                seen.add(key);
                orderedEntries.push({...entry, href: resolvedAbs});
              }

              tocEntriesCache.set(readmeDocId, orderedEntries);
              return orderedEntries;
            };

            // Collect the subtree's sidebar nodes by:
            // - doc.id (type: 'doc')
            // - category.link.id (type: 'category' where category is linked to a doc, i.e. README/index)
            const collectSidebarNodesByTargetId = (sidebarItems: any[]) => {
              const docIdToItem = new Map<string, any>();
              const categoryLinkIdToItem = new Map<string, any>();

              const walk = (items: any[]) => {
                for (const item of items ?? []) {
                  if (item?.type === 'doc' && typeof item.id === 'string') {
                    docIdToItem.set(item.id, item);
                    continue;
                  }
                  if (item?.type === 'category') {
                    const linkId = item?.link?.type === 'doc' ? item.link.id : undefined;
                    if (typeof linkId === 'string') {
                      categoryLinkIdToItem.set(linkId, item);
                    }
                    if (Array.isArray(item.items)) walk(item.items);
                  }
                }
              };

              walk(sidebarItems);
              return {docIdToItem, categoryLinkIdToItem};
            };

            const processReadmeBackedCategory = (categoryItem: any): any => {
              const readmeDocId =
                categoryItem?.link?.type === 'doc' && typeof categoryItem.link.id === 'string'
                  ? categoryItem.link.id
                  : null;
              if (!readmeDocId) return categoryItem;

              const tocEntries = getTocEntriesForReadmeDocId(readmeDocId);
              if (tocEntries.length === 0) return categoryItem;

              const {docIdToItem, categoryLinkIdToItem} = collectSidebarNodesByTargetId(
                categoryItem.items ?? [],
              );

              const newItems: any[] = [];
              for (const entry of tocEntries) {
                const docId = sourceAbsPathToDocId.get(entry.href);
                const docItem = docIdToItem.get(docId);
                if (docItem) {
                  // Docs not referenced by the TOC are intentionally dropped.
                  // Hidden utility docs can still be surfaced when explicitly linked from README.
                  newItems.push(docItem);
                  continue;
                }

                const linkedCategoryItem = categoryLinkIdToItem.get(docId);
                if (linkedCategoryItem) {
                  newItems.push(processReadmeBackedCategory(linkedCategoryItem));
                  continue;
                }

                if (entry.href.toLowerCase().endsWith('.ipynb')) {
                  if (!shouldUseGitHubNotebookPreview(entry.href)) {
                    continue;
                  }
                  const githubUrl = toGitHubBlobUrl(entry.href);
                  if (githubUrl) {
                    newItems.push({
                      type: 'link',
                      label: entry.label,
                      href: githubUrl,
                    });
                  }
                }
              }

              return {
                ...categoryItem,
                items: sortSidebarItemsByReadmeOrder(newItems, readmeDocId),
              };
            };

            const sortSidebarItemsByReadmeOrder = (
              sidebarItems: any[],
              readmeDocId?: string | null,
            ): any[] => {
              if (!Array.isArray(sidebarItems) || sidebarItems.length === 0) {
                return sidebarItems ?? [];
              }

              const sortChildren = (items: any[]): any[] =>
                items.map((item) => {
                  if (item?.type !== 'category') {
                    return item;
                  }

                  const linkId = item?.link?.type === 'doc' ? item.link.id : undefined;
                  const childItems = sortChildren(item.items ?? []);
                  return linkId
                    ? {...item, items: sortSidebarItemsByReadmeOrder(childItems, linkId)}
                    : {...item, items: childItems};
                });

              if (!readmeDocId) {
                return sortChildren(sidebarItems);
              }

              const tocEntries = getTocEntriesForReadmeDocId(readmeDocId);
              if (tocEntries.length === 0) {
                return sortChildren(sidebarItems);
              }

              const orderByDocId = new Map<string, number>();
              const orderByAbsPath = new Map<string, number>();
              tocEntries.forEach((entry, index) => {
                const docId = sourceAbsPathToDocId.get(entry.href);
                if (docId) {
                  orderByDocId.set(docId, index);
                }
                orderByAbsPath.set(normalizePathForUrl(entry.href), index);
              });

              const getItemOrder = (item: any): number => {
                if (!item) return Number.MAX_SAFE_INTEGER;

                if (item?.type === 'doc' && typeof item.id === 'string') {
                  if (orderByDocId.has(item.id)) {
                    return orderByDocId.get(item.id)!;
                  }

                  const absPath = resolveAbsPathFromDocId(item.id);
                  if (absPath && orderByAbsPath.has(normalizePathForUrl(absPath))) {
                    return orderByAbsPath.get(normalizePathForUrl(absPath))!;
                  }
                }

                if (item?.type === 'category' && item?.link?.type === 'doc') {
                  const linkedId = item.link.id;
                  if (typeof linkedId === 'string' && orderByDocId.has(linkedId)) {
                    return orderByDocId.get(linkedId)!;
                  }

                  if (typeof linkedId === 'string') {
                    const absPath = resolveAbsPathFromDocId(linkedId);
                    if (absPath && orderByAbsPath.has(normalizePathForUrl(absPath))) {
                      return orderByAbsPath.get(normalizePathForUrl(absPath))!;
                    }
                  }
                }

                return Number.MAX_SAFE_INTEGER;
              };

              const sortedItems = [...sidebarItems].sort((a, b) => getItemOrder(a) - getItemOrder(b));
              return sortChildren(sortedItems);
            };

            const flattenHiddenCategories = (sidebarItems: any[]): any[] =>
              sidebarItems.flatMap((item) => {
                if (item?.type === 'category') {
                  const flattenedChildren = flattenHiddenCategories(item.items ?? []);
                  if (isHiddenCategory(item)) {
                    return flattenedChildren;
                  }
                  return [{...item, items: flattenedChildren}];
                }

                return item ? [item] : [];
              });

            const filterItems = (sidebarItems: any[]): any[] =>
              sidebarItems.flatMap((item) => {
                if (item?.type === 'doc') {
                  // Non-TOC fallback: keep existing hidden-doc behavior.
                  return isHiddenSidebarDocId(item.id) ? [] : [item];
                }

                if (item?.type === 'category') {
                  const linkId = item?.link?.type === 'doc' ? item.link.id : undefined;
                  const processed = linkId ? processReadmeBackedCategory(item) : item;

                  const children = processed.items ?? [];
                  if (!linkId) {
                    const filteredChildren = filterItems(children);
                    return filteredChildren.length > 0
                      ? [{...processed, items: filteredChildren}]
                      : [];
                  }

                  // For README/index categories, we already built `items` from the TOC.
                  const flattenedChildren = flattenHiddenCategories(children);
                  const sortedChildren = sortSidebarItemsByReadmeOrder(flattenedChildren, linkId);
                  return sortedChildren.length > 0
                    ? [{...processed, items: sortedChildren}]
                    : [];
                }

                return item ? [item] : [];
              });

            return filterItems(items);
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },

        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    // NAVIGATION BAR
    navbar: {
      title: 'Home',
      logo: {
        alt: 'knowlegebase Logo',
        src: 'img/home-brain-bulb.svg',
        width: 40,
        height: 40,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
       
      ],
    },
    // FOOTER SECTION 
    footer: {
      style: 'dark',
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: 'Tutorial',
        //       to: '/docs/intro',
        //     },
        //   ],
        // },
        // {
        //   title: 'GitHub',
        //   items: [
        //     {
        //       label: 'knowlegebase',
        //       href: 'https://github.com/Ritu-malage/knowlegebase',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ritu Malage.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
