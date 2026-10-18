// Shared page shell for every generated page (platforms, docs, contribute),
// so the header, footer and <head> live in exactly one place.
import { readFileSync } from 'node:fs';

export const SITE = 'https://halloween.js.org';
export const REPO = 'https://github.com/rogulia/halloween.js';

export const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
);

export const SCRIPT_TAG = `<script src="https://cdn.jsdelivr.net/npm/halloween.js@${version}/dist/halloween.iife.js"></script>`;

export const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const escapeAttr = (value) => escapeHtml(value).replaceAll('"', '&quot;');

export const ICONS = {
  github:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
  npm: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>',
  theme:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-.5-.05-1-.14-1.47A5.5 5.5 0 0 1 13.47 3.14 9.1 9.1 0 0 0 12 3z"/></svg>',
};

const NAV = [
  { id: 'playground', label: 'Playground', href: '/#playground' },
  { id: 'platforms', label: 'Platforms', href: '/platforms/' },
  { id: 'docs', label: 'Docs', href: '/docs/' },
  { id: 'contribute', label: 'Contribute', href: '/contribute/' },
];

function renderHeader(active) {
  const links = NAV.map(
    (n) => `<a href="${n.href}"${n.id === active ? ' aria-current="page"' : ''}>${n.label}</a>`,
  ).join('\n          ');
  return `<header class="site-header">
      <div class="container header-inner">
        <a class="wordmark" href="/">halloween<span>.js</span></a>
        <nav class="site-nav" id="site-nav" aria-label="Primary">
          ${links}
        </nav>
        <div class="header-actions">
          <button class="icon-btn" type="button" data-theme-toggle aria-label="Toggle dark theme">${ICONS.theme}</button>
          <a class="icon-btn" href="https://www.npmjs.com/package/halloween.js" aria-label="npm">${ICONS.npm}</a>
          <a class="icon-btn" href="${REPO}" aria-label="GitHub">${ICONS.github}</a>
          <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="site-nav" aria-label="Menu">${ICONS.menu}</button>
        </div>
      </div>
    </header>`;
}

const FOOTER = `<footer class="site-footer">
      <div class="container footer-inner">
        <p>Built by <a href="https://iurii.rogulia.fi">Iurii Rogulia</a></p>
        <ul class="footer-links">
          <li><a href="/docs/">Docs</a></li>
          <li><a href="/platforms/">Platforms</a></li>
          <li><a href="/contribute/">Contribute</a></li>
          <li><a href="/SKILL.md">SKILL.md</a></li>
          <li><a href="${REPO}">GitHub repository</a></li>
          <li><a href="https://www.npmjs.com/package/halloween.js">npm</a></li>
          <li>
            <a href="https://codepen.io/Iurii-Rogulia/pen/01a04277-f24b-7dd1-b12c-aae1c436b168"
              >CodePen</a
            >
          </li>
        </ul>
      </div>
    </footer>`;

// crumbs: [{ name, path }]; the last one is the current page and is not a link.
export function renderBreadcrumb(crumbs) {
  const parts = crumbs.map((c, i) =>
    i === crumbs.length - 1 ? escapeHtml(c.name) : `<a href="${c.path}">${escapeHtml(c.name)}</a>`,
  );
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join(' / ')}</nav>`;
}

function breadcrumbJsonLd(crumbs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path}`,
    })),
  });
}

/**
 * @param {object} page
 * @param {string} page.path        site path with leading and trailing slash
 * @param {string} page.title       full <title>
 * @param {string} page.description
 * @param {string} page.active      NAV id highlighted in the header
 * @param {{name: string, path: string}[]} page.crumbs   starts at the home page
 * @param {string} page.main        inner HTML of <main>
 * @param {string[]} [page.scripts] extra deferred scripts at the end of <body>
 * @param {string} [page.ogType]
 */
export function renderPage(page) {
  const url = `${SITE}${page.path}`;
  const title = escapeAttr(page.title);
  const description = escapeAttr(page.description);
  const scripts = (page.scripts ?? [])
    .map((s) => `<script src="${s}" defer></script>`)
    .join('\n    ');
  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    ${page.alternateMarkdown ? `<link rel="alternate" type="text/markdown" href="${page.alternateMarkdown}" />` : ''}
    <meta property="og:type" content="${page.ogType ?? 'article'}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${SITE}/og-image.png" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/demo.css" />
    <script src="/site.js"></script>
    <script type="application/ld+json">
      ${breadcrumbJsonLd(page.crumbs)}
    </script>
    <script
      defer
      src="https://u.rogulia.fi/script.js"
      data-website-id="51dd7656-1ec6-465a-8197-a40c58937507"
    ></script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>

    ${renderHeader(page.active)}

    <main id="main" class="section">
      ${page.main}
    </main>

    ${FOOTER}
    ${scripts}
  </body>
</html>
`;
}

// Page that only forwards visitors from a URL that used to exist. Static
// hosting has no server redirects, so this is the strongest signal available:
// an instant meta refresh plus a canonical pointing at the new address.
export function renderRedirectStub(toPath) {
  const to = `${SITE}${toPath}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Moved — halloween.js</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href="${to}" />
    <meta http-equiv="refresh" content="0; url=${toPath}" />
  </head>
  <body>
    <p>This page moved to <a href="${toPath}">${to}</a>.</p>
  </body>
</html>
`;
}

export const logoSrc = (logo) =>
  logo.startsWith('http') ? logo : `https://cdn.simpleicons.org/${logo}`;

export const logoHtml = (logo, size = '') => {
  const cls = `plogo${size ? ` plogo--${size}` : ''}`;
  if (logo.startsWith('emoji:')) {
    return `<span class="${cls}" aria-hidden="true"><span style="font-size: ${size ? '18px' : '28px'}; line-height: 1">${logo.slice(6)}</span></span>`;
  }
  return `<span class="${cls}"><img src="${logoSrc(logo)}" alt="" width="28" height="28" loading="lazy" /></span>`;
};
