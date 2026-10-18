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

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('demo install/body block structure', () => {
  it('has exactly one #install landmark', () => {
    loadDemo();
    expect(document.querySelectorAll('#install')).toHaveLength(1);
  });

  it('has exactly one generated body output and it is a textarea', () => {
    loadDemo();
    const outputs = document.querySelectorAll('#body-example');
    expect(outputs).toHaveLength(1);
    expect(outputs[0].tagName).toBe('TEXTAREA');
  });

  it('has exactly one Copy body button', () => {
    loadDemo();
    expect(document.querySelectorAll('#copy-body-btn')).toHaveLength(1);
  });

  it('no longer has the old duplicate live-body output or its copy button', () => {
    loadDemo();
    expect(document.getElementById('live-body-example')).toBeNull();
    expect(document.getElementById('copy-live-body-btn')).toBeNull();
  });

  it('places the script/npm tabs and their panels before the body output in document order', () => {
    loadDemo();
    const tabs = document.querySelector('.tabs');
    const bodyOutput = byId('body-example');
    expect(tabs).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING means bodyOutput comes after tabs.
    const relation = tabs!.compareDocumentPosition(bodyOutput);
    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps the body output inside the same configurator card as the controls, not a bordered sub-block', () => {
    loadDemo();
    const bodyOutput = byId('body-example');
    const controlsCard = document.querySelector('.controls-card');
    expect(controlsCard).not.toBeNull();
    expect(controlsCard!.contains(bodyOutput)).toBe(true);
    // The old bordered "Live <body> tag" fieldset is gone entirely.
    expect(document.querySelector('fieldset.live-body-group')).toBeNull();
  });

  it('textarea is readonly, wraps softly, and does not allow spellcheck', () => {
    loadDemo();
    const textarea = byId<HTMLTextAreaElement>('body-example');
    expect(textarea.readOnly).toBe(true);
    expect(textarea.getAttribute('wrap')).toBe('soft');
    expect(textarea.getAttribute('spellcheck')).toBe('false');
  });

  it('textarea has an accessible name via aria-labelledby pointing at a heading', () => {
    loadDemo();
    const textarea = byId<HTMLTextAreaElement>('body-example');
    const labelId = textarea.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const label = document.getElementById(labelId!);
    expect(label).not.toBeNull();
    expect(label!.textContent?.trim()).toBeTruthy();
  });
});

describe('demo control -> body textarea reactivity', () => {
  it('reflects tombstone toggle in the body textarea', () => {
    loadDemo();
    const textarea = byId<HTMLTextAreaElement>('body-example');
    const tombstones = byId<HTMLInputElement>('cfg-tombstones');
    expect(textarea.value).toContain('halloween-tombstones');
    tombstones.checked = false;
    tombstones.dispatchEvent(new Event('input', { bubbles: true }));
    expect(textarea.value).not.toContain('halloween-tombstones');
  });

  it('reflects intensity changes in the body textarea', () => {
    loadDemo();
    const textarea = byId<HTMLTextAreaElement>('body-example');
    const party = byId<HTMLInputElement>('cfg-intensity-party');
    party.checked = true;
    party.dispatchEvent(new Event('input', { bubbles: true }));
    expect(textarea.value).toContain('halloween-intensity-party');
  });

  it('reflects corner changes in the body textarea', () => {
    loadDemo();
    const textarea = byId<HTMLTextAreaElement>('body-example');
    const rt = byId<HTMLInputElement>('cfg-corner-rt');
    rt.checked = true;
    rt.dispatchEvent(new Event('input', { bubbles: true }));
    expect(textarea.value).toContain('halloween-screen-right-top');
  });

  it('reflects a valid custom color in the body textarea', () => {
    loadDemo();
    const textarea = byId<HTMLTextAreaElement>('body-example');
    const colorEnabled = byId<HTMLInputElement>('cfg-color-enabled');
    const colorText = byId<HTMLInputElement>('cfg-color');
    colorEnabled.checked = true;
    colorText.value = '#123abc';
    colorEnabled.dispatchEvent(new Event('input', { bubbles: true }));
    expect(textarea.value).toContain('--halloween-color: #123abc');
  });

  it('reflects a non-default season window in the body textarea', () => {
    loadDemo();
    const textarea = byId<HTMLTextAreaElement>('body-example');
    const sDay = byId<HTMLSelectElement>('cfg-season-start-day');
    sDay.value = '05';
    sDay.dispatchEvent(new Event('input', { bubbles: true }));
    expect(textarea.value).toContain('data-halloween-start="05-10"');
  });

  it('never changes the script tag when controls change', () => {
    loadDemo();
    const scriptExample = byId('script-example');
    const before = scriptExample.textContent;
    const tombstones = byId<HTMLInputElement>('cfg-tombstones');
    tombstones.checked = false;
    tombstones.dispatchEvent(new Event('input', { bubbles: true }));
    expect(scriptExample.textContent).toBe(before);
    expect(before).toContain('halloween.iife.js');
  });
});

describe('demo copy body button', () => {
  it("copies the textarea's current .value, not stale markup", () => {
    loadDemo();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const textarea = byId<HTMLTextAreaElement>('body-example');
    const tombstones = byId<HTMLInputElement>('cfg-tombstones');
    tombstones.checked = false;
    tombstones.dispatchEvent(new Event('input', { bubbles: true }));

    byId<HTMLButtonElement>('copy-body-btn').click();

    expect(writeText).toHaveBeenCalledWith(textarea.value);
    expect(textarea.value).not.toContain('halloween-tombstones');
  });
});

describe('demo install tabs keyboard navigation', () => {
  it('moves selection and focus with ArrowRight/ArrowLeft and updates aria-selected/hidden', () => {
    loadDemo();
    const tabScript = byId<HTMLButtonElement>('tab-script');
    const tabNpm = byId<HTMLButtonElement>('tab-npm');
    const panelScript = byId<HTMLElement>('panel-script');
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

describe('demo paste-only snippet', () => {
  function pasteScriptBody(): string {
    const value = byId<HTMLTextAreaElement>('paste-example').value;
    const match = /^<script src="[^"]+"><\/script>\n<script>\n([\s\S]*)\n<\/script>$/.exec(value);
    if (!match)
      throw new Error('paste-only output is not the library tag plus one inline <script>');
    return match[1];
  }

  it('mirrors the body classes of the <body> tag output', () => {
    loadDemo();
    const bodyTag = byId<HTMLTextAreaElement>('body-example').value;
    const classes = /class="([^"]+)"/.exec(bodyTag)![1].split(' ');
    const paste = byId<HTMLTextAreaElement>('paste-example').value;
    for (const name of classes) expect(paste).toContain(`"${name}"`);
  });

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

  it('copies the paste-only snippet value', () => {
    loadDemo();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    byId<HTMLButtonElement>('copy-paste-btn').click();
    expect(writeText).toHaveBeenCalledWith(byId<HTMLTextAreaElement>('paste-example').value);
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

  it('is off by default: no badge class in either output', () => {
    loadDemo();
    expect(byId<HTMLTextAreaElement>('body-example').value).not.toContain('halloween-badge');
    expect(byId<HTMLTextAreaElement>('paste-example').value).not.toContain('halloween-badge');
  });

  it('adds halloween-badge when enabled, with no placement class for the default', () => {
    loadDemo();
    setBadge(true);
    const body = byId<HTMLTextAreaElement>('body-example').value;
    expect(body).toContain('halloween-badge');
    expect(body).not.toMatch(/halloween-badge-(left|right)/);
  });

  it('adds the chosen placement class to both outputs', () => {
    loadDemo();
    setBadge(true, 'right');
    for (const id of ['body-example', 'paste-example']) {
      expect(byId<HTMLTextAreaElement>(id).value).toContain('halloween-badge-right');
    }
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
    expect(byId<HTMLTextAreaElement>('body-example').value).not.toContain('halloween-badge');
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
      expect(byId<HTMLTextAreaElement>('body-example').value).not.toContain('--halloween-badge');
      setBadge(true);
      expect(byId<HTMLTextAreaElement>('body-example').value).toContain(
        '--halloween-badge-color: #112233',
      );
    });

    it('merges badge colors into the single style attribute with the spider color', () => {
      loadDemo();
      setBadge(true);
      setColors({ text: '#112233', border: '#445566', bg: '#778899' });
      const body = byId<HTMLTextAreaElement>('body-example').value;
      expect(body.match(/style="/g)).toHaveLength(1);
      expect(body).toContain('--halloween-badge-color: #112233');
      expect(body).toContain('--halloween-badge-border-color: #445566');
      expect(body).toContain('--halloween-badge-bg: #778899');
    });

    it('leaves the background out by default and after "Transparent"', () => {
      loadDemo();
      setBadge(true);
      setColors({ text: '#112233' });
      const body = () => byId<HTMLTextAreaElement>('body-example').value;
      expect(body()).not.toContain('--halloween-badge-bg');
      setColors({ bg: '#778899' });
      expect(body()).toContain('--halloween-badge-bg: #778899');
      setColors({ transparent: true });
      expect(body()).not.toContain('--halloween-badge-bg');
      expect(byId<HTMLInputElement>('cfg-badge-bg').value).toBe('transparent');
      expect(byId('cfg-badge-bg-picker').classList.contains('is-transparent')).toBe(true);
    });

    it('writes the colors into the paste-only script', () => {
      loadDemo();
      setBadge(true);
      setColors({ border: '#445566' });
      expect(byId<HTMLTextAreaElement>('paste-example').value).toContain(
        'document.body.style.setProperty("--halloween-badge-border-color", "#445566");',
      );
    });

    it('flags an invalid hex and omits it from the output', () => {
      loadDemo();
      setBadge(true);
      setColors({ text: 'nope' });
      expect(byId<HTMLTextAreaElement>('body-example').value).not.toContain(
        '--halloween-badge-color',
      );
      expect(byId<HTMLInputElement>('cfg-badge-text').getAttribute('aria-invalid')).toBe('true');
      expect(byId('cfg-badge-colors-error').textContent).not.toBe('');
    });
  });
});
