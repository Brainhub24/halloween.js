import { fromHTML } from './dom';

const BODY_CLASS = 'halloween-badge';
const SLOT_SELECTOR = '[data-halloween-badge-slot]';
const PUSH_VAR = '--halloween-badge-push';

let badgeNode: HTMLElement | null = null;
let pushPx = 0;
let resizeObserver: ResizeObserver | null = null;

// Unlike the screen corners, the badge is not part of the fixed overlay
// layer. By default it is a normal block at the very end of <body>, so it
// can never sit on top of a chat widget, cookie banner, toast or modal.
// Placement is opt-in per use: an element carrying data-halloween-badge-slot
// hosts it instead of <body> (e.g. inside the site's own footer), and
// body classes (see styles.ts) align it left or right.
// Opt-in via <body class="halloween-badge">.
export function syncBadge() {
  if (typeof document === 'undefined') return;
  if (!document.body.classList.contains(BODY_CLASS)) {
    removeBadge();
    return;
  }

  const host = document.querySelector<HTMLElement>(SLOT_SELECTOR) ?? document.body;
  if (!badgeNode || badgeNode.parentElement !== host) {
    badgeNode ??= fromHTML(
      `<a class="halloween-badge-link" href="https://halloween.js.org/" target="_blank" rel="noopener nofollow">🎃 Halloween effects by halloween.js</a>`,
    );
    host.appendChild(badgeNode);
  }

  if (host === document.body) watchLayout();
  else unwatchLayout();
}

export function removeBadge() {
  unwatchLayout();
  badgeNode?.remove();
  badgeNode = null;
}

// "Sticky footer" for short pages: when the content is shorter than the
// viewport the badge would float up under it, so the missing height is added
// above it (as a margin) and it ends up at the bottom edge of the screen.
// Measured from where the badge itself sits in the document (the root's
// scrollHeight is never smaller than the viewport, so it can't say how short
// the content is), and never by changing <body>'s layout, so the host site is
// not restyled. A tall page gets no extra space.
function layoutBadge() {
  if (!badgeNode || badgeNode.parentElement !== document.body) return;
  const marginBottom = parseFloat(getComputedStyle(badgeNode).marginBottom) || 0;
  const bottom = badgeNode.getBoundingClientRect().bottom + window.scrollY + marginBottom;
  const next = Math.max(0, document.documentElement.clientHeight - (bottom - pushPx));
  if (next === pushPx) return;
  pushPx = next;
  badgeNode.style.setProperty(PUSH_VAR, `${next}px`);
}

function watchLayout() {
  if (!resizeObserver && typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(layoutBadge);
    resizeObserver.observe(document.body);
  }
  // The viewport can change height without <body> changing size at all.
  window.addEventListener('resize', layoutBadge);
  layoutBadge();
}

function unwatchLayout() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener('resize', layoutBadge);
  pushPx = 0;
}
