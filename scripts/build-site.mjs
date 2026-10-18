// Generates every static page that is not hand-written:
//   /platforms/ and /platforms/<slug>/   install guides
//   /docs/, /docs/<section>/, /docs/<section>/<page>/   from docs/**/*.md
//   /contribute/                         from CONTRIBUTING.md + CODE_OF_CONDUCT.md
//   <slug>/index.html                    redirect stubs for URLs that moved
// plus sitemap.xml and the generated blocks of llms.txt / llms-full.txt.
// Run without flags to rewrite the files; run with --check (wired into
// `npm run check`) to fail if any of them drifted from the sources.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import {
  SITE,
  REPO,
  version,
  escapeHtml,
  renderPage,
  renderBreadcrumb,
  renderRedirectStub,
  logoHtml,
} from './site/layout.mjs';
import { parseFrontMatter, renderMarkdown } from './site/markdown.mjs';
import { PLATFORMS, SNIPPET, SEASON_NOTE, SKILL_PROMPT } from './site/platforms.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const isCheck = process.argv.includes('--check');
const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

// Paths that existed before the move into /platforms/. Each gets a stub.
const MOVED_PLATFORM_SLUGS = [
  'wordpress',
  'shopify',
  'webflow',
  'squarespace',
  'wix',
  'tilda',
  'ghost',
  'blogger',
  'google-tag-manager',
  'framer',
];

const SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'Install the library and switch it on in a minute.',
  },
  {
    id: 'options',
    title: 'Options',
    description:
      'Every class, attribute and CSS variable: the values it accepts and what it changes.',
  },
  {
    id: 'api',
    title: 'API',
    description: 'The halloween() and pageEffects functions for the cases classes cannot cover.',
  },
  {
    id: 'guides',
    title: 'Guides',
    description: 'How the library works, accessibility and a troubleshooting checklist.',
  },
];

const HOME = { name: 'halloween.js', path: '/' };
const sectionPath = (id) => `/docs/${id}/`;
const docPath = (doc) => `/docs/${doc.section}/${doc.name}/`;
const docMdPath = (doc) => `/docs/${doc.section}/${doc.name}.md`;

// ---------- docs ----------

function loadDocs() {
  const docs = [];
  for (const section of SECTIONS) {
    const dir = new URL(`../docs/${section.id}/`, import.meta.url);
    if (!existsSync(dir)) throw new Error(`docs/${section.id}/ is missing`);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const rel = `docs/${section.id}/${file}`;
      const { data, body } = parseFrontMatter(read(rel), rel);
      for (const key of ['title', 'description', 'section', 'order']) {
        if (!data[key]) throw new Error(`${rel}: missing "${key}" in front matter`);
      }
      if (data.section !== section.id) throw new Error(`${rel}: section does not match folder`);
      const rendered = renderMarkdown(body, rel);
      docs.push({
        name: file.replace(/\.md$/, ''),
        section: section.id,
        title: data.title,
        description: data.description,
        order: Number(data.order),
        markdown: body.trim(),
        ...rendered,
      });
    }
  }
  const rank = (d) => SECTIONS.findIndex((s) => s.id === d.section) * 1000 + d.order;
  return docs.sort((a, b) => rank(a) - rank(b));
}

function docsNav(docs, current) {
  return SECTIONS.map((s) => {
    const items = docs
      .filter((d) => d.section === s.id)
      .map((d) => {
        const here = current && d.section === current.section && d.name === current.name;
        return `<li><a href="${docPath(d)}"${here ? ' aria-current="page"' : ''}>${escapeHtml(d.title)}</a></li>`;
      })
      .join('');
    return `<div class="docs-nav-group"><h4><a href="${sectionPath(s.id)}">${s.title}</a></h4><ul>${items}</ul></div>`;
  }).join('');
}

function renderDocPage(doc, docs) {
  const section = SECTIONS.find((s) => s.id === doc.section);
  const index = docs.indexOf(doc);
  const prev = docs[index - 1];
  const next = docs[index + 1];
  const crumbs = [
    HOME,
    { name: 'Docs', path: '/docs/' },
    { name: section.title, path: sectionPath(section.id) },
    { name: doc.title, path: docPath(doc) },
  ];
  const toc = doc.headings.length
    ? `<div class="card toc"><h3>On this page</h3><ul>${doc.headings
        .map((h) => `<li><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`)
        .join('')}</ul></div>`
    : '';
  const pager = `<nav class="pager" aria-label="Previous and next page">${
    prev
      ? `<a class="pager-prev" href="${docPath(prev)}"><span>Previous</span>${escapeHtml(prev.title)}</a>`
      : '<span></span>'
  }${
    next
      ? `<a class="pager-next" href="${docPath(next)}"><span>Next</span>${escapeHtml(next.title)}</a>`
      : '<span></span>'
  }</nav>`;
  const main = `<div class="container">
        ${renderBreadcrumb(crumbs)}
        <div class="doc">
          <article class="doc-main">
            <header class="stack">
              <p class="eyebrow" style="margin: 0">${escapeHtml(section.title)}</p>
              <h1 style="font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)">${escapeHtml(doc.title)}</h1>
              <p class="lead">${escapeHtml(doc.description)}</p>
              <div class="doc-tools">
                <button type="button" class="btn btn-secondary btn--sm" data-copy-md="${docMdPath(doc)}" data-label="Copy for LLM"><svg class="tool-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6V3.5"/><circle cx="12" cy="3" r="1"/><rect x="4" y="6" width="16" height="13" rx="3.5"/><path d="M2 11.5v3M22 11.5v3M9.5 16h5"/><circle cx="9" cy="11.5" r=".6"/><circle cx="15" cy="11.5" r=".6"/></svg> <span data-copy-md-text>Copy for LLM</span></button>
                <a class="btn btn-secondary btn--sm" href="${docMdPath(doc)}"><svg class="tool-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3.5"/><path d="M6 15V9l2.5 3L11 9v6M17 9v6m-2-2 2 2 2-2"/></svg> View as Markdown</a>
                <span class="copy-status" role="status" aria-live="polite" data-copy-md-status></span>
              </div>
            </header>
            ${doc.html}
            ${pager}
          </article>
          <aside class="doc-aside" aria-label="Documentation">
            ${toc}
            <div class="card docs-nav"><h3>Documentation</h3>${docsNav(docs, doc)}</div>
          </aside>
        </div>
      </div>`;
  return {
    path: docPath(doc),
    html: renderPage({
      path: docPath(doc),
      title: `${doc.title} — halloween.js docs`,
      description: doc.description,
      active: 'docs',
      crumbs,
      main,
      alternateMarkdown: docMdPath(doc),
      scripts: ['/docs.js'],
    }),
    links: doc.links,
  };
}

function renderDocsIndex(docs) {
  const crumbs = [HOME, { name: 'Docs', path: '/docs/' }];
  const cards = SECTIONS.map((s) => {
    const items = docs
      .filter((d) => d.section === s.id)
      .map((d) => `<li><a href="${docPath(d)}">${escapeHtml(d.title)}</a></li>`)
      .join('');
    return `<div class="card"><h3><a href="${sectionPath(s.id)}">${s.title}</a></h3><p>${escapeHtml(s.description)}</p><ul class="link-list" style="margin-top: var(--s-3)">${items}</ul></div>`;
  }).join('');
  const description =
    'Documentation for halloween.js: install it, switch it on with body classes, and every option explained with its values and what it changes.';
  const main = `<div class="container">
        ${renderBreadcrumb(crumbs)}
        <header class="stack">
          <h1 style="font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)">Documentation</h1>
          <p class="lead">${escapeHtml(description)}</p>
        </header>
        <div class="grid" style="margin-top: var(--s-7)">${cards}</div>
      </div>`;
  return {
    path: '/docs/',
    html: renderPage({
      path: '/docs/',
      title: 'Documentation — halloween.js',
      description,
      active: 'docs',
      crumbs,
      main,
      ogType: 'website',
    }),
    links: [],
  };
}

function renderSectionPage(section, docs) {
  const crumbs = [
    HOME,
    { name: 'Docs', path: '/docs/' },
    { name: section.title, path: sectionPath(section.id) },
  ];
  const items = docs
    .filter((d) => d.section === section.id)
    .map(
      (d) =>
        `<a class="card" href="${docPath(d)}" style="display: block"><h3>${escapeHtml(d.title)}</h3><p>${escapeHtml(d.description)}</p></a>`,
    )
    .join('');
  const main = `<div class="container">
        ${renderBreadcrumb(crumbs)}
        <header class="stack">
          <h1 style="font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)">${section.title}</h1>
          <p class="lead">${escapeHtml(section.description)}</p>
        </header>
        <div class="grid" style="margin-top: var(--s-7)">${items}</div>
      </div>`;
  return {
    path: sectionPath(section.id),
    html: renderPage({
      path: sectionPath(section.id),
      title: `${section.title} — halloween.js docs`,
      description: section.description,
      active: 'docs',
      crumbs,
      main,
      ogType: 'website',
    }),
    links: [],
  };
}

// ---------- platforms ----------

const platformPath = (p) => `/platforms/${p.slug}/`;

function otherPlatforms(current) {
  return PLATFORMS.filter((p) => p.slug !== current.slug)
    .map(
      (p) =>
        `<li><a href="${platformPath(p)}"><span class="link-with-logo">${logoHtml(p.logo, 'sm')}${p.name}</span></a></li>`,
    )
    .join('');
}

function renderPlatformPage(p) {
  const isPrompt = p.kind === 'prompt';
  const path = platformPath(p);
  const crumbs = [HOME, { name: 'Platforms', path: '/platforms/' }, { name: p.name, path }];
  const title = isPrompt
    ? 'Add Halloween effects with an AI assistant — halloween.js'
    : `Add Halloween effects to ${p.name} — halloween.js`;
  const description = isPrompt
    ? 'Let an AI coding assistant add Halloween effects to your site. Copy one prompt; the assistant follows the SKILL.md file for halloween.js.'
    : `Add Halloween effects to your ${p.name}${p.also ? ` or ${p.also}` : ''} site with one pasted snippet: spider webs, blinking eyes, flying witches. Free, MIT licensed, under 10 KB.`;
  const heading = isPrompt
    ? 'Add Halloween effects with an AI assistant'
    : `Add Halloween effects to ${p.name}`;
  const steps = p.steps.map((s) => `<li><p>${s}</p></li>`).join('');
  const notes = p.notes.map((n) => `<li>${n}</li>`).join('');
  const code = isPrompt ? SKILL_PROMPT : SNIPPET;
  const codeSection = isPrompt
    ? `<h2>The prompt</h2>
            <p class="muted">The assistant reads <a href="/SKILL.md">SKILL.md</a>, which lists every class, option and gotcha, and then edits your project.</p>`
    : `<h2>The snippet</h2>
            <p class="muted">One paste, no other files. It loads halloween.js ${version} from jsDelivr and turns on webs in two corners, blinking eyes, flying witches, a dropping spider and a rising tombstone.</p>`;
  const copyWord = isPrompt ? 'Prompt' : 'Snippet';
  const main = `<div class="container">
        ${renderBreadcrumb(crumbs)}
        <div class="doc">
          <article class="doc-main">
            <header class="stack">
              <div class="doc-kicker">${logoHtml(p.logo)}<p class="eyebrow" style="margin: 0">${isPrompt ? 'Install guide · AI assistant' : `Install guide · ${p.name}${p.also ? ` &amp; ${p.also}` : ''}`}</p></div>
              <h1 style="font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)">${heading}</h1>
              <p class="lead">${p.lead}</p>
            </header>

            <h2>Steps</h2>
            <ol class="steps">${steps}</ol>

            ${codeSection}
            <div class="code-block code-block--wrap">
              <pre><code id="snippet">${escapeHtml(code)}</code></pre>
              <button type="button" class="btn btn-secondary btn--sm" id="copy-snippet" data-label="Copy" data-copied="${copyWord} copied">Copy</button>
            </div>
            <p class="copy-status" id="copy-status" role="status" aria-live="polite"></p>
            ${SEASON_NOTE}

            <h2>Check that it works</h2>
            <ol class="steps">
              <li><p>Open your live site in a private window and reload without cache.</p></li>
              <li><p>Between 18 October and 2 November you should see webs in the screen corners and eyes blinking within a few seconds. Outside those dates the page looks unchanged.</p></li>
            </ol>

            <h2>Good to know</h2>
            <ul class="bullets muted">
              <li>Want to test outside the season? Open the <a href="/#playground">playground</a>, set the active season to cover today and copy the snippet it generates.</li>
              <li>Ambient effects stop when a visitor has reduced motion turned on. The screen-corner webs stay.</li>
              <li>The effects sit in a fixed layer and never shift your page layout.</li>
              ${notes}
              <li>Nothing showing in season? See <a href="/docs/guides/troubleshooting/">troubleshooting</a>.</li>
            </ul>
          </article>

          <aside class="doc-aside" aria-label="Related">
            <div class="card">
              <h3>Make it yours</h3>
              <p>Pick corners, effects, intensity, color and season dates, then copy the snippet.</p>
              <a class="btn btn-primary" style="margin-top: var(--s-4)" href="/#playground">Open playground</a>
            </div>
            <div class="card">
              <h3>Other platforms</h3>
              <ul class="link-list" style="margin-top: var(--s-3)">${otherPlatforms(p)}</ul>
            </div>
            <p class="caption"><a href="/docs/">Full documentation</a></p>
          </aside>
        </div>
      </div>`;
  return {
    path,
    html: renderPage({
      path,
      title,
      description,
      active: 'platforms',
      crumbs,
      main,
      scripts: ['/platform.js'],
    }),
    links: [...main.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]),
  };
}

const tileHtml = (p) =>
  `<a class="card tile" href="${platformPath(p)}">${logoHtml(p.logo)}<span>${p.name}</span></a>`;

function renderPlatformsHub() {
  const crumbs = [HOME, { name: 'Platforms', path: '/platforms/' }];
  const description =
    'Step-by-step guides for adding Halloween effects to WordPress, Shopify, Webflow, Wix, Squarespace, Tilda, Ghost, Blogger, Google Tag Manager, Framer, plain HTML sites and AI assistants.';
  const main = `<div class="container">
        ${renderBreadcrumb(crumbs)}
        <header class="stack">
          <h1 style="font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)">Add Halloween effects to your platform</h1>
          <p class="lead">Pick yours for click-by-click steps. The same snippet works everywhere, so any builder with a custom-code field is covered even if it is not listed.</p>
        </header>
        <div class="tiles" style="margin-top: var(--s-7)">${PLATFORMS.map(tileHtml).join('')}</div>
        <div class="container--prose" style="margin: var(--s-8) 0 0; padding: 0">
          <h2 style="font-size: var(--text-xl)">Your platform is not listed?</h2>
          <p class="muted" style="margin-top: var(--s-3)">Look for a place to add custom code to the footer or the end of the page, then paste the snippet from the <a href="${platformPath(PLATFORMS.find((p) => p.slug === 'html'))}">HTML website</a> guide. Prefer to build your own classes and options first? Use the <a href="/#playground">playground</a> or read the <a href="/docs/">documentation</a>.</p>
        </div>
      </div>`;
  return {
    path: '/platforms/',
    html: renderPage({
      path: '/platforms/',
      title: 'Platforms — halloween.js install guides',
      description,
      active: 'platforms',
      crumbs,
      main,
      ogType: 'website',
    }),
    links: [...main.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]),
  };
}

// ---------- contribute ----------

const CONTRIBUTE_PATH = '/contribute/';
const ISSUES = `${REPO}/issues`;

function repoLink(href) {
  if (/^(https?:|\/|#|mailto:)/.test(href)) return href;
  return `${REPO}/blob/main/${href}`;
}

function renderContribute() {
  const crumbs = [HOME, { name: 'Contribute', path: CONTRIBUTE_PATH }];
  const contributing = renderMarkdown(
    read('CONTRIBUTING.md').replace(/^# .*\n/, ''),
    'CONTRIBUTING.md',
    { resolveLink: repoLink },
  );
  const conduct = renderMarkdown(
    read('CODE_OF_CONDUCT.md').replace(/^# .*\n/, ''),
    'CODE_OF_CONDUCT.md',
    { shift: 1, resolveLink: repoLink },
  );
  const toc = [...contributing.headings, { id: 'code-of-conduct', text: 'Code of conduct' }];
  const description =
    'How to contribute to halloween.js: ideas and artwork, new effects, bug fixes and docs. What a pull request needs, how to run the checks and what to expect from review.';
  const starter = `${ISSUES}?q=${encodeURIComponent('is:issue is:open label:"good first issue"')}`;
  const main = `<div class="container">
        ${renderBreadcrumb(crumbs)}
        <div class="doc">
          <article class="doc-main">
            <header class="stack">
              <p class="eyebrow" style="margin: 0">Open source · MIT</p>
              <h1 style="font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)">Contribute to halloween.js</h1>
              <p class="lead">An idea, a drawing, a bug fix or a docs correction all help. Pick the level that matches the time you have.</p>
            </header>

            <div class="grid">
              <a class="card" href="${starter}" style="display: block"><h3>Pick a starter issue</h3><p>Small, well-scoped tasks that are labelled for newcomers.</p></a>
              <a class="card" href="${ISSUES}/new?template=new_character.yml" style="display: block"><h3>Propose a character</h3><p>Sketch or draw an SVG and open it as an issue. No code needed.</p></a>
              <a class="card" href="${ISSUES}/new?template=bug_report.yml" style="display: block"><h3>Report a bug</h3><p>Tell us what broke and where. A page URL helps the most.</p></a>
            </div>

            ${contributing.html}

            <h2 id="code-of-conduct">Code of conduct<a class="anchor" href="#code-of-conduct" aria-label="Link to this section">#</a></h2>
            ${conduct.html}
          </article>
          <aside class="doc-aside" aria-label="Contribute">
            <div class="card toc"><h3>On this page</h3><ul>${toc.map((h) => `<li><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`).join('')}</ul></div>
            <div class="card">
              <h3>Links</h3>
              <ul class="link-list" style="margin-top: var(--s-3)">
                <li><a href="${REPO}">GitHub repository</a></li>
                <li><a href="${ISSUES}">Issues</a></li>
                <li><a href="${REPO}/graphs/contributors">Contributors</a></li>
                <li><a href="${REPO}/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>`;
  return {
    path: CONTRIBUTE_PATH,
    html: renderPage({
      path: CONTRIBUTE_PATH,
      title: 'Contribute — halloween.js',
      description,
      active: 'contribute',
      crumbs,
      main,
    }),
    links: [...contributing.links, ...conduct.links],
  };
}

// ---------- sitemap and llms ----------

function renderSitemap(paths) {
  const body = paths
    .map(
      (loc, i) =>
        `  <url>\n    <loc>${SITE}${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${i === 0 ? '1.0' : '0.7'}</priority>\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function llmsBlock(id, text) {
  return `<!-- ${id}:start -->\n${text}\n<!-- ${id}:end -->`;
}

function withBlock(source, id, text) {
  const block = llmsBlock(id, text);
  const pattern = new RegExp(`<!-- ${id}:start -->[\\s\\S]*?<!-- ${id}:end -->`);
  if (pattern.test(source)) return source.replace(pattern, block);
  return `${source.trimEnd()}\n\n${block}\n`;
}

function platformsLlms() {
  const lines = PLATFORMS.map(
    (p) =>
      `- [${p.name}](${SITE}${platformPath(p)}): ${
        p.kind === 'prompt'
          ? 'let an AI coding assistant install it from SKILL.md'
          : `where to paste the snippet in ${p.name}${p.also ? ` and ${p.also}` : ''}`
      }`,
  );
  return `## Install guides by platform\n\n- [All platforms](${SITE}/platforms/): index of the guides below\n${lines.join('\n')}`;
}

function docsLlms(docs) {
  const lines = docs.map((d) => `- [${d.title}](${SITE}${docMdPath(d)}): ${d.description}`);
  return `## Documentation\n\n- [Documentation index](${SITE}/docs/): every page below is also available as Markdown at the same path with a .md ending\n${lines.join('\n')}\n- [SKILL.md](${SITE}/SKILL.md): instructions for AI coding assistants`;
}

function renderLlmsFull(docs) {
  const intro = read('demo/llms.txt').split('<!-- platforms:start -->')[0].trimEnd();
  const pages = docs
    .map((d) => `# ${d.title}\n\n${SITE}${docPath(d)}\n\n${d.description}\n\n${d.markdown}`)
    .join('\n\n---\n\n');
  return `${intro}\n\nThis file contains the complete documentation as plain text. Instructions for AI coding assistants: ${SITE}/SKILL.md\n\n---\n\n${pages}\n\n---\n\n${platformsLlms()}\n`;
}

// ---------- assemble ----------

async function prettyHtml(source, filepath) {
  return format(source, { parser: 'html', filepath, singleQuote: true, printWidth: 100 });
}

const docs = loadDocs();
const pages = [
  renderPlatformsHub(),
  ...PLATFORMS.map(renderPlatformPage),
  renderDocsIndex(docs),
  ...SECTIONS.map((s) => renderSectionPage(s, docs)),
  ...docs.map((d) => renderDocPage(d, docs)),
  renderContribute(),
];

const outputs = new Map();
for (const page of pages) {
  const rel = `demo${page.path}index.html`;
  outputs.set(rel, await prettyHtml(page.html, rel));
}
for (const slug of MOVED_PLATFORM_SLUGS) {
  const rel = `demo/${slug}/index.html`;
  outputs.set(rel, await prettyHtml(renderRedirectStub(`/platforms/${slug}/`), rel));
}
for (const d of docs) {
  outputs.set(
    `demo${docMdPath(d)}`,
    `# ${d.title}\n\n${d.description}\n\nCanonical page: ${SITE}${docPath(d)}\n\n${d.markdown}\n`,
  );
}
outputs.set('demo/sitemap.xml', renderSitemap(['/', ...pages.map((p) => p.path)]));
for (const rel of ['demo/llms.txt']) {
  let source = withBlock(read(rel), 'platforms', platformsLlms());
  source = withBlock(source, 'docs', docsLlms(docs));
  outputs.set(rel, source);
}
outputs.set('demo/llms-full.txt', renderLlmsFull(docs));

// Every site-absolute link written in docs and guides must land on a page or
// file that exists, so a renamed page can't leave dead links behind.
const known = new Set(['/', '/SKILL.md', ...pages.map((p) => p.path)]);
const dead = [];
for (const page of pages) {
  for (const href of page.links) {
    const [path] = href.split('#');
    if (path && !known.has(path)) dead.push(`${page.path} -> ${href}`);
  }
}
if (dead.length > 0) {
  console.error(`Dead internal links:\n${dead.map((d) => `  ${d}`).join('\n')}`);
  process.exit(1);
}

let drifted = false;
for (const [rel, content] of outputs) {
  const abs = new URL(rel, `file://${ROOT}`);
  const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
  if (current === content) {
    console.log(`OK   ${rel}`);
    continue;
  }
  if (isCheck) {
    console.error(`FAIL ${rel} — out of date`);
    drifted = true;
    continue;
  }
  mkdirSync(new URL('.', abs), { recursive: true });
  writeFileSync(abs, content);
  console.log(`WROTE ${rel}`);
}

if (isCheck && drifted) {
  console.error('\nRun `node scripts/build-site.mjs` to fix.');
  process.exit(1);
}
