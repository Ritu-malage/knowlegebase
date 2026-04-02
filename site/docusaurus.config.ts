import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import fs from 'fs';
import path from 'path';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Knowlegebase',
  tagline: 'Notes, notebooks, and practical guides',
  favicon: 'img/favicon.ico',

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
          sidebarItemsGenerator: async ({defaultSidebarItemsGenerator, ...args}) => {
            const items = await defaultSidebarItemsGenerator(args);
            const hiddenPrefix = 'AI_ML/mlflow/md_utils/';
            const siteRoot = __dirname;

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

            const tocDocIdsCache = new Map<string, string[]>();

            // Extract ordered local `.md` links from a README's Table of Contents.
            // Example TOC lines:
            // - [Introduction](./md_utils/introduction.md)
            const getTocDocIdsForReadmeDocId = (readmeDocId: string): string[] => {
              if (tocDocIdsCache.has(readmeDocId)) return tocDocIdsCache.get(readmeDocId)!;

              const readmeAbsPath = resolveAbsPathFromDocId(readmeDocId);
              if (!readmeAbsPath) {
                tocDocIdsCache.set(readmeDocId, []);
                return [];
              }

              let content: string;
              try {
                content = fs.readFileSync(readmeAbsPath, 'utf8');
              } catch {
                tocDocIdsCache.set(readmeDocId, []);
                return [];
              }

              const links: string[] = [];
              const linkRegex = /(\!\[[^\]]*\]|\[[^\]]*\])\(([^)]+)\)/g;
              let match: RegExpExecArray | null;
              while ((match = linkRegex.exec(content))) {
                const full = match[1] ?? '';
                const hrefRaw = (match[2] ?? '').trim();
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
                if (!hrefNoAnchor.toLowerCase().endsWith('.md')) continue;

                links.push(hrefNoAnchor);
              }

              const readmeDir = path.dirname(readmeAbsPath);
              const orderedDocIds: string[] = [];
              const seen = new Set<string>();

              for (const href of links) {
                const resolvedAbs = path.resolve(readmeDir, href);
                const docId = sourceAbsPathToDocId.get(resolvedAbs);
                if (!docId) continue;
                if (seen.has(docId)) continue;
                seen.add(docId);
                orderedDocIds.push(docId);
              }

              tocDocIdsCache.set(readmeDocId, orderedDocIds);
              return orderedDocIds;
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

              const tocDocIds = getTocDocIdsForReadmeDocId(readmeDocId);
              if (tocDocIds.length === 0) return categoryItem;

              const {docIdToItem, categoryLinkIdToItem} = collectSidebarNodesByTargetId(
                categoryItem.items ?? [],
              );

              const newItems: any[] = [];
              for (const docId of tocDocIds) {
                const docItem = docIdToItem.get(docId);
                if (docItem) {
                  // Docs not referenced by the TOC are intentionally dropped.
                  // Hidden docs can be overridden by TOC inclusion.
                  if (docItem.id.startsWith(hiddenPrefix)) {
                    newItems.push(docItem);
                  } else {
                    newItems.push(docItem);
                  }
                  continue;
                }

                const linkedCategoryItem = categoryLinkIdToItem.get(docId);
                if (linkedCategoryItem) {
                  newItems.push(processReadmeBackedCategory(linkedCategoryItem));
                }
              }

              return {...categoryItem, items: newItems};
            };

            const filterItems = (sidebarItems: any[]): any[] =>
              sidebarItems.flatMap((item) => {
                if (item?.type === 'doc') {
                  // Non-TOC fallback: keep existing hidden-doc behavior.
                  return item.id.startsWith(hiddenPrefix) ? [] : [item];
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
                  return processed.items.length > 0 ? [processed] : [];
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
      title: 'knowlegebase',
      logo: {
        alt: 'knowlegebase Logo',
        src: 'img/logo.svg',
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
