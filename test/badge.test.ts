import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockMatchMedia } from './test-utils';

const insideSeason = new Date(2026, 9, 20);
const outsideSeason = new Date(2026, 5, 1);

function badges() {
  return document.querySelectorAll('a.halloween-badge-link');
}

// Every freshly imported copy of src/index.ts leaves its own MutationObserver
// on the shared document.body; without disconnecting them, observers from
// earlier tests would also react to this test's class changes and add badges.
const OriginalMutationObserver = globalThis.MutationObserver;
const observers: MutationObserver[] = [];

beforeEach(() => {
  globalThis.MutationObserver = class extends OriginalMutationObserver {
    constructor(callback: MutationCallback) {
      super(callback);
      observers.push(this);
    }
  };
  vi.resetModules();
  vi.useFakeTimers();
  mockMatchMedia(false);
  document.body.innerHTML = '<main>page</main>';
  document.body.className = '';
  document.head.innerHTML = '';
});

afterEach(() => {
  observers.splice(0).forEach((observer) => observer.disconnect());
  globalThis.MutationObserver = OriginalMutationObserver;
  vi.useRealTimers();
});

describe('opt-in credit badge', () => {
  it('is off by default', async () => {
    vi.setSystemTime(insideSeason);
    document.body.className = 'halloween halloween-eyes';
    await import('../src/index');
    expect(badges()).toHaveLength(0);
  });

  it('renders one link as the last element of <body> when halloween-badge is set', async () => {
    vi.setSystemTime(insideSeason);
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');

    expect(badges()).toHaveLength(1);
    const link = badges()[0] as HTMLAnchorElement;
    expect(link.href).toBe('https://halloween.js.org/');
    expect(link.rel).toBe('noopener nofollow');
    expect(document.body.lastElementChild).toBe(link);
    expect(link.closest('.halloween-page-layer')).toBeNull();
  });

  it('does not render without the master class', async () => {
    vi.setSystemTime(insideSeason);
    document.body.className = 'halloween-badge';
    await import('../src/index');
    expect(badges()).toHaveLength(0);
  });

  it('does not render outside the season window', async () => {
    vi.setSystemTime(outsideSeason);
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');
    expect(badges()).toHaveLength(0);
  });

  it('is added and removed live as the class changes, never duplicated', async () => {
    vi.setSystemTime(insideSeason);
    document.body.className = 'halloween';
    await import('../src/index');
    expect(badges()).toHaveLength(0);

    document.body.classList.add('halloween-badge');
    await Promise.resolve();
    document.body.classList.add('halloween-eyes');
    await Promise.resolve();
    expect(badges()).toHaveLength(1);

    document.body.classList.remove('halloween-badge');
    await Promise.resolve();
    expect(badges()).toHaveLength(0);
  });

  it('goes away together with the master class', async () => {
    vi.setSystemTime(insideSeason);
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');
    expect(badges()).toHaveLength(1);

    document.body.classList.remove('halloween');
    await Promise.resolve();
    expect(badges()).toHaveLength(0);
  });

  it('is re-created if the page removed it from the DOM', async () => {
    vi.setSystemTime(insideSeason);
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');
    badges()[0].remove();

    document.body.classList.add('halloween-eyes');
    await Promise.resolve();
    expect(badges()).toHaveLength(1);
  });
});

describe('badge placement', () => {
  it('moves into a [data-halloween-badge-slot] element instead of <body>', async () => {
    vi.setSystemTime(insideSeason);
    document.body.innerHTML = '<main>page</main><footer data-halloween-badge-slot></footer>';
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');

    const slot = document.querySelector('[data-halloween-badge-slot]')!;
    expect(badges()).toHaveLength(1);
    expect(badges()[0].parentElement).toBe(slot);
  });

  it('switches host when the slot appears or disappears, never duplicating', async () => {
    vi.setSystemTime(insideSeason);
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');
    expect(badges()[0].parentElement).toBe(document.body);

    document.body.insertAdjacentHTML('afterbegin', '<div data-halloween-badge-slot></div>');
    document.body.classList.add('halloween-eyes');
    await Promise.resolve();
    expect(badges()).toHaveLength(1);
    expect(badges()[0].parentElement).toBe(document.querySelector('[data-halloween-badge-slot]'));

    document.querySelector('[data-halloween-badge-slot]')!.remove();
    document.body.classList.remove('halloween-eyes');
    await Promise.resolve();
    expect(badges()).toHaveLength(1);
    expect(badges()[0].parentElement).toBe(document.body);
  });

  it('ships CSS for left/right alignment and the style variables, with no floating variants', async () => {
    const { CSS } = await import('../src/styles');
    expect(CSS).toContain('body.halloween-badge-left .halloween-badge-link');
    expect(CSS).toContain('body.halloween-badge-right .halloween-badge-link');
    expect(CSS).not.toContain('halloween-badge-float');
    for (const v of ['color', 'border-color', 'bg', 'font', 'opacity', 'z-index']) {
      expect(CSS).toContain(`--halloween-badge-${v}`);
    }
  });
});

describe('badge sticks to the bottom of a short page', () => {
  // jsdom has no layout: stub the two measurements layoutBadge() reads — the
  // viewport height and where the badge's bottom edge currently sits.
  function setLayout(viewport: number, badgeBottom: number) {
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: viewport,
      configurable: true,
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const bottom = this.classList.contains('halloween-badge-link') ? badgeBottom : 0;
      return { bottom, top: bottom, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 } as DOMRect;
    });
  }

  afterEach(() => {
    delete (document.documentElement as unknown as { clientHeight?: number }).clientHeight;
  });

  it('pushes the badge down by the missing height when the page is shorter than the viewport', async () => {
    vi.setSystemTime(insideSeason);
    setLayout(800, 500);
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');
    expect((badges()[0] as HTMLElement).style.getPropertyValue('--halloween-badge-push')).toBe(
      '300px',
    );
  });

  it('adds nothing on a page taller than the viewport', async () => {
    vi.setSystemTime(insideSeason);
    setLayout(800, 2000);
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');
    expect((badges()[0] as HTMLElement).style.getPropertyValue('--halloween-badge-push')).toBe('');
  });

  it('does not push a badge hosted in a [data-halloween-badge-slot]', async () => {
    vi.setSystemTime(insideSeason);
    setLayout(800, 500);
    document.body.innerHTML = '<footer data-halloween-badge-slot></footer>';
    document.body.className = 'halloween halloween-badge';
    await import('../src/index');
    expect((badges()[0] as HTMLElement).style.getPropertyValue('--halloween-badge-push')).toBe('');
  });
});
