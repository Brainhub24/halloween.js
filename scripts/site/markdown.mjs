// Restricted Markdown renderer for docs/*.md. It supports only what the docs
// use and fails loudly on anything else, so a typo can't silently produce
// broken markup: front matter, h2-h4, paragraphs, flat lists, tables, fenced
// code, blockquotes (rendered as callouts), `code`, **bold**, *italic*, links.
// Raw HTML is escaped, never passed through.
import { escapeHtml, escapeAttr } from './layout.mjs';

export function parseFrontMatter(source, file) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) throw new Error(`${file}: missing front matter`);
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!kv) throw new Error(`${file}: bad front matter line "${line}"`);
    data[kv[1]] = kv[2].trim();
  }
  return { data, body: source.slice(match[0].length) };
}

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function renderInline(text, ctx) {
  // Code spans are lifted out first so their content is never read as
  // Markdown, and so a link label can contain `code`.
  const codes = [];
  const lifted = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  let out = escapeHtml(lifted);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const raw = ctx.resolveLink(href.replaceAll('&amp;', '&'));
    if (raw.startsWith('/')) ctx.links.push(raw);
    const external = /^https?:\/\//.test(raw) && !raw.startsWith('https://halloween.js.org/');
    return `<a href="${escapeAttr(raw)}"${external ? ' rel="noopener"' : ''}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\w)/g, '$1<em>$2</em>');
  return out.replace(/\u0000(\d+)\u0000/g, (_, n) => codes[Number(n)]);
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replaceAll('\\|', '|'));
}

// options.shift lowers every heading by that many levels; options.resolveLink
// rewrites hrefs (used to point repository-relative links at GitHub).
export function renderMarkdown(body, file, options = {}) {
  const shift = options.shift ?? 0;
  const ctx = { links: [], resolveLink: options.resolveLink ?? ((href) => href) };
  const headings = [];
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const fail = (message) => {
    throw new Error(`${file}:${i + 1}: ${message}`);
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }

    const fence = /^```(\w*)$/.exec(line);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && lines[i] !== '```') code.push(lines[i++]);
      if (i >= lines.length) fail('unterminated code fence');
      i++;
      out.push(
        `<div class="code-block code-block--wrap code-block--plain"><pre><code>${escapeHtml(code.join('\n'))}</code></pre></div>`,
      );
      continue;
    }

    const heading = /^(#{2,4}) (.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length + shift;
      const text = heading[2].trim();
      const id = slugify(text);
      if (level === 2) headings.push({ id, text: text.replace(/`/g, '') });
      out.push(
        `<h${level} id="${id}">${renderInline(text, ctx)}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>`,
      );
      i++;
      continue;
    }
    if (/^#/.test(line))
      fail('only ##, ### and #### headings are allowed (the page title comes from front matter)');

    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      if (rows.length < 3 || !/^\|[\s:|-]+\|$/.test(rows[1])) fail('malformed table');
      const head = splitRow(rows[0]);
      const bodyRows = rows.slice(2).map(splitRow);
      for (const r of bodyRows)
        if (r.length !== head.length) fail('table row has a different column count');
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${renderInline(c, ctx)}</th>`).join('')}</tr></thead><tbody>${bodyRows
          .map((r) => `<tr>${r.map((c) => `<td>${renderInline(c, ctx)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      );
      continue;
    }

    if (line.startsWith('>')) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith('>'))
        quote.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<div class="callout">${renderInline(quote.join(' '), ctx)}</div>`);
      continue;
    }

    const listMatch = /^(-|\d+\.) /.exec(line);
    if (listMatch) {
      const ordered = listMatch[1] !== '-';
      const items = [];
      while (i < lines.length && /^(-|\d+\.) /.test(lines[i])) {
        let item = lines[i].replace(/^(-|\d+\.) /, '');
        i++;
        while (i < lines.length && /^ {2,}\S/.test(lines[i])) {
          if (/^\s+(-|\d+\.) /.test(lines[i])) fail('nested lists are not supported');
          item += ` ${lines[i].trim()}`;
          i++;
        }
        items.push(`<li>${renderInline(item, ctx)}</li>`);
      }
      out.push(
        ordered
          ? `<ol class="bullets">${items.join('')}</ol>`
          : `<ul class="bullets">${items.join('')}</ul>`,
      );
      continue;
    }

    if (/^\s/.test(line) || line.startsWith('<')) fail('unexpected indentation or raw HTML');
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(```|#|\||>|(-|\d+\.) )/.test(lines[i])
    ) {
      para.push(lines[i++].trim());
    }
    out.push(`<p>${renderInline(para.join(' '), ctx)}</p>`);
  }

  return { html: out.join('\n'), headings, links: ctx.links };
}
