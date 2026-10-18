// Structural + behavioral coverage for the demo/ configurator page (not part
// of the published package — demo/ is a static site that ships the library
// via a plain <script>, so it's exercised here by loading the real
// demo/index.html markup into jsdom and running the real demo/demo.js
// against it, rather than re-implementing its logic against mocks.
// ?raw (a Vite/Vitest built-in, see test/vite-raw.d.ts) loads these as plain
// text without going through Node's fs — the project has no @types/node
// dependency, and this avoids adding one just for two file reads in tests.
import html from '../demo/index.html?raw';
import demoJsSource from '../demo/demo.js?raw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// demo.js is a plain browser IIFE script (not an ES module) that reaches for
// `document`/`window`/`navigator` as ambient globals, exactly as it does
// when loaded via <script src="./demo.js" defer>. Running its source through
// `new Function` executes it against vitest's jsdom globals the same way a
// real <script> tag would, without needing a bundler-friendly rewrite.
function loadDemo() {
  const bodyMarkup = html.slice(html.indexOf('<body'), html.indexOf('</body>') + '</body>'.length);
  document.documentElement.innerHTML = `<head></head>${bodyMarkup}`;
  new Function(demoJsSource)();
}

function byId<T extends Element = Element>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} not found`);
  return node as unknown as T;
}

function pasteText(): string {
  return byId('paste-example').textContent ?? '';
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('demo page structure', () => {
  it('has exactly one #install landmark', () => {
    loadDemo();
    expect(document.querySelectorAll('#install')).toHaveLength(1);
  });

  it('shows the generated snippet in a code block, not in a separate preview frame', () => {
    loadDemo();
    expect(byId('paste-example').tagName).toBe('CODE');
    expect(document.querySelector('iframe')).toBeNull();
    expect(document.getElementById('body-example')).toBeNull();
  });

  it('has one Copy button per generated block', () => {
    loadDemo();
    for (const id of [
      'copy-paste-btn',
      'copy-npm-install-btn',
      'copy-npm-import-btn',
      'copy-npm-activate-btn',
    ]) {
      expect(document.querySelectorAll(`#${id}`)).toHaveLength(1);
    }
  });

  it('runs on a page with the season forced open', () => {
    loadDemo();
    expect(document.body.classList.contains('halloween')).toBe(true);
    expect(document.body.getAttribute('data-halloween-start')).toBe('01-01');
    expect(document.body.getAttribute('data-halloween-end')).toBe('31-12');
  });

  it('keeps the color, credit link and season options behind disclosures', () => {
    loadDemo();
    for (const id of ['cfg-color-enabled', 'cfg-badge-enabled', 'cfg-season-start-day']) {
      expect(byId(id).closest('details')).not.toBeNull();
    }
  });

  it('lists the platform guides', () => {
    loadDemo();
    expect(document.querySelectorAll('#platforms .tile')).toHaveLength(12);
    expect(
      Array.from(document.querySelectorAll('#platforms .tile')).every((tile) =>
        tile.getAttribute('href')?.startsWith('/platforms/'),
      ),
    ).toBe(true);
  });
});

describe('demo controls drive the page and the code', () => {
  it('reflects the tombstone toggle in the snippet and on the page body', () => {
    loadDemo();
    const tombstones = byId<HTMLInputElement>('cfg-tombstones');
    expect(pasteText()).toContain('halloween-tombstones');
    expect(document.body.classList.contains('halloween-tombstones')).toBe(true);
    tombstones.checked = false;
    tombstones.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pasteText()).not.toContain('halloween-tombstones');
    expect(document.body.classList.contains('halloween-tombstones')).toBe(false);
  });

  it('reflects intensity changes in the snippet and on the page body', () => {
    loadDemo();
    const party = byId<HTMLInputElement>('cfg-intensity-party');
    party.checked = true;
    party.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pasteText()).toContain('halloween-intensity-party');
    expect(document.body.classList.contains('halloween-intensity-party')).toBe(true);
  });

  it('reflects corner changes in the snippet and on the page body', () => {
    loadDemo();
    const rt = byId<HTMLInputElement>('cfg-corner-rt');
    rt.checked = true;
    rt.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pasteText()).toContain('halloween-screen-right-top');
    expect(document.body.classList.contains('halloween-screen-right-top')).toBe(true);
  });

  it('reflects a valid custom color in the snippet and on the page body', () => {
    loadDemo();
    const colorEnabled = byId<HTMLInputElement>('cfg-color-enabled');
    byId<HTMLInputElement>('cfg-color').value = '#123abc';
    colorEnabled.checked = true;
    colorEnabled.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pasteText()).toContain(
      'document.body.style.setProperty("--halloween-color", "#123abc");',
    );
    expect(document.body.style.getPropertyValue('--halloween-color')).toBe('#123abc');
  });

  it('reflects a non-default season window in the snippet only, never on the page', () => {
    loadDemo();
    const sDay = byId<HTMLSelectElement>('cfg-season-start-day');
    sDay.value = '05';
    sDay.dispatchEvent(new Event('input', { bubbles: true }));
    expect(pasteText()).toContain('document.body.setAttribute("data-halloween-start", "05-10");');
    expect(document.body.getAttribute('data-halloween-start')).toBe('01-01');
    expect(document.body.getAttribute('data-halloween-end')).toBe('31-12');
  });

  it('never removes the master class from the page', () => {
    loadDemo();
    for (const id of ['cfg-eyes', 'cfg-witches', 'cfg-spider-drop', 'cfg-tombstones']) {
      const box = byId<HTMLInputElement>(id);
      box.checked = false;
      box.dispatchEvent(new Event('input', { bubbles: true }));
    }
    expect(document.body.classList.contains('halloween')).toBe(true);
  });

  it('lists the body classes one per line', () => {
    loadDemo();
    expect(pasteText()).toContain(
      'document.body.classList.add(\n       "halloween",\n       "halloween-screen-left-top",',
    );
  });

  it('uses the same activation code for the npm tab', () => {
    loadDemo();
    const npm = byId('npm-activate-example').textContent ?? '';
    expect(npm.startsWith('document.body.classList.add(\n   "halloween",')).toBe(true);
    expect(npm).toContain('"halloween-tombstones"\n);');
    expect(pasteText()).toContain(npm.split('\n').join('\n    '));
  });
});

describe('demo copy buttons', () => {
  it("copy the block's current text, not stale markup", () => {
    loadDemo();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    const tombstones = byId<HTMLInputElement>('cfg-tombstones');
    tombstones.checked = false;
    tombstones.dispatchEvent(new Event('input', { bubbles: true }));

    byId<HTMLButtonElement>('copy-paste-btn').click();
    expect(writeText).toHaveBeenCalledWith(pasteText());
    expect(pasteText()).not.toContain('halloween-tombstones');

    byId<HTMLButtonElement>('copy-npm-activate-btn').click();
    expect(writeText).toHaveBeenCalledWith(byId('npm-activate-example').textContent);
  });
});

describe('demo install tabs keyboard navigation', () => {
  it('moves selection and focus with ArrowRight/ArrowLeft and updates aria-selected/hidden', () => {
    loadDemo();
    const tabScript = byId<HTMLButtonElement>('tab-paste');
    const tabNpm = byId<HTMLButtonElement>('tab-npm');
    const panelScript = byId<HTMLElement>('panel-paste');
    const panelNpm = byId<HTMLElement>('panel-npm');

    expect(tabScript.getAttribute('aria-selected')).toBe('true');
    expect(panelNpm.hidden).toBe(true);

    tabScript.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(tabNpm.getAttribute('aria-selected')).toBe('true');
    expect(tabScript.getAttribute('aria-selected')).toBe('false');
    expect(panelScript.hidden).toBe(true);
    expect(panelNpm.hidden).toBe(false);
    expect(document.activeElement).toBe(tabNpm);

    tabNpm.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(tabScript.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabScript);
  });
});

describe('demo snippet', () => {
  function pasteScriptBody(): string {
    const value = pasteText();
    const match = /^<script src="[^"]+"><\/script>\n<script>\n([\s\S]*)\n<\/script>$/.exec(value);
    if (!match)
      throw new Error('paste-only output is not the library tag plus one inline <script>');
    return match[1];
  }

  it('applies classes, season attributes and color to <body> when it runs after load', () => {
    loadDemo();
    byId<HTMLInputElement>('cfg-tombstones').checked = false;
    byId<HTMLSelectElement>('cfg-season-start-month').value = '09';
    byId<HTMLInputElement>('cfg-color-enabled').checked = true;
    byId<HTMLInputElement>('cfg-color').value = '#ff6b00';
    for (const id of [
      'cfg-tombstones',
      'cfg-season-start-month',
      'cfg-color-enabled',
      'cfg-color',
    ]) {
      byId(id).dispatchEvent(new Event('input', { bubbles: true }));
    }
    new Function(pasteScriptBody())();
    expect(document.body.classList.contains('halloween')).toBe(true);
    expect(document.body.classList.contains('halloween-eyes')).toBe(true);
    expect(document.body.classList.contains('halloween-tombstones')).toBe(false);
    expect(document.body.getAttribute('data-halloween-start')).toBe('18-09');
    expect(document.body.style.getPropertyValue('--halloween-color')).toBe('#ff6b00');
  });

  it('waits for DOMContentLoaded while the document is still loading', () => {
    loadDemo();
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
    document.body.className = '';
    new Function(pasteScriptBody())();
    expect(document.body.classList.contains('halloween')).toBe(false);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(document.body.classList.contains('halloween')).toBe(true);
    delete (document as unknown as { readyState?: string }).readyState;
  });
});

describe('demo credit link controls', () => {
  function setBadge(enabled: boolean, placement = '') {
    const toggle = byId<HTMLInputElement>('cfg-badge-enabled');
    toggle.checked = enabled;
    toggle.dispatchEvent(new Event('input', { bubbles: true }));
    const radio = document.querySelector<HTMLInputElement>(
      `input[name="cfg-badge-placement"][value="${placement}"]`,
    )!;
    radio.checked = true;
    radio.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('is off by default: no badge class in the snippet or on the page', () => {
    loadDemo();
    expect(pasteText()).not.toContain('halloween-badge');
    expect(document.body.classList.contains('halloween-badge')).toBe(false);
  });

  it('adds halloween-badge when enabled, with no placement class for the default', () => {
    loadDemo();
    setBadge(true);
    const body = pasteText();
    expect(body).toContain('halloween-badge');
    expect(body).not.toMatch(/halloween-badge-(left|right)/);
  });

  it('adds the chosen placement class to the snippet and the page', () => {
    loadDemo();
    setBadge(true, 'right');
    expect(pasteText()).toContain('halloween-badge-right');
    expect(document.body.classList.contains('halloween-badge-right')).toBe(true);
  });

  it('disables the placement radios while the badge is off and enables them when on', () => {
    loadDemo();
    const radios = () =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input[name="cfg-badge-placement"]'));
    expect(radios().every((r) => r.disabled)).toBe(true);
    setBadge(true);
    expect(radios().every((r) => !r.disabled)).toBe(true);
  });

  it('ignores the placement while the badge is off', () => {
    loadDemo();
    setBadge(false, 'left');
    expect(pasteText()).not.toContain('halloween-badge');
  });

  describe('colors', () => {
    function setColors(opts: {
      text?: string;
      border?: string;
      bg?: string;
      transparent?: boolean;
    }) {
      const fire = (id: string, value?: string, checked?: boolean) => {
        const input = byId<HTMLInputElement>(id);
        if (value !== undefined) input.value = value;
        if (checked !== undefined) input.checked = checked;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      fire('cfg-badge-colors-enabled', undefined, true);
      if (opts.text) fire('cfg-badge-text', opts.text);
      if (opts.border) fire('cfg-badge-border', opts.border);
      if (opts.bg) fire('cfg-badge-bg', opts.bg);
      if (opts.transparent) byId<HTMLButtonElement>('cfg-badge-bg-transparent').click();
    }

    it('adds no style for the badge by default or while the badge is off', () => {
      loadDemo();
      setColors({ text: '#112233' });
      expect(pasteText()).not.toContain('--halloween-badge');
      setBadge(true);
      expect(pasteText()).toContain(
        'document.body.style.setProperty("--halloween-badge-color", "#112233");',
      );
      expect(document.body.style.getPropertyValue('--halloween-badge-color')).toBe('#112233');
    });

    it('writes all badge colors next to the spider color', () => {
      loadDemo();
      setBadge(true);
      byId<HTMLInputElement>('cfg-color').value = '#123abc';
      const colorEnabled = byId<HTMLInputElement>('cfg-color-enabled');
      colorEnabled.checked = true;
      colorEnabled.dispatchEvent(new Event('input', { bubbles: true }));
      setColors({ text: '#112233', border: '#445566', bg: '#778899' });
      const snippet = pasteText();
      expect(snippet).toContain('"--halloween-color", "#123abc"');
      expect(snippet).toContain('"--halloween-badge-color", "#112233"');
      expect(snippet).toContain('"--halloween-badge-border-color", "#445566"');
      expect(snippet).toContain('"--halloween-badge-bg", "#778899"');
    });

    it('leaves the background out by default and after "Transparent"', () => {
      loadDemo();
      setBadge(true);
      setColors({ text: '#112233' });
      expect(pasteText()).not.toContain('--halloween-badge-bg');
      setColors({ bg: '#778899' });
      expect(pasteText()).toContain('"--halloween-badge-bg", "#778899"');
      setColors({ transparent: true });
      expect(pasteText()).not.toContain('--halloween-badge-bg');
      expect(byId<HTMLInputElement>('cfg-badge-bg').value).toBe('transparent');
      expect(byId('cfg-badge-bg-picker').classList.contains('is-transparent')).toBe(true);
    });

    it('writes the colors into the paste-only script', () => {
      loadDemo();
      setBadge(true);
      setColors({ border: '#445566' });
      expect(pasteText()).toContain(
        'document.body.style.setProperty("--halloween-badge-border-color", "#445566");',
      );
    });

    it('flags an invalid hex and omits it from the output', () => {
      loadDemo();
      setBadge(true);
      setColors({ text: 'nope' });
      expect(pasteText()).not.toContain('--halloween-badge-color');
      expect(byId<HTMLInputElement>('cfg-badge-text').getAttribute('aria-invalid')).toBe('true');
      expect(byId('cfg-badge-colors-error').textContent).not.toBe('');
    });
  });
});
