// Parent page controller. Never loads halloween.js itself — the library
// only runs inside preview.html, so the fixed ambient-effects layer never
// overlaps this configurator's own UI. All state lives here; the iframe is
// a dumb renderer driven entirely by postMessage.
(() => {
  'use strict';

  const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const SEASON_DEFAULTS = { start: '18-10', end: '02-11' };
  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  // Feb=29 (leap-safe) — no year is specified, so a fixed calendar table is
  // used rather than checking a specific year's leap-ness.
  const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // The only public halloween.js body classes this demo ever generates or
  // forwards to the preview — a single allowlist shared by class-building
  // and the postMessage payload, so nothing element-level or made up can
  // slip in from either path.
  const CORNER_CLASSES = {
    lt: 'halloween-screen-left-top',
    rt: 'halloween-screen-right-top',
    lb: 'halloween-screen-left-bottom',
    rb: 'halloween-screen-right-bottom',
  };
  const EFFECT_CLASSES = {
    eyes: 'halloween-eyes',
    witches: 'halloween-witches',
    spiderDrop: 'halloween-spider-drop',
    tombstones: 'halloween-tombstones',
  };
  // Value of the placement <select> -> body class; '' is the default (centered) and adds nothing beyond the on/off class.
  const BADGE_PLACEMENT_CLASSES = {
    left: 'halloween-badge-left',
    right: 'halloween-badge-right',
  };
  // The badge's own custom properties — the only ones the badge color
  // controls ever write, here and in preview.js.
  const BADGE_COLOR_VARS = {
    text: '--halloween-badge-color',
    border: '--halloween-badge-border-color',
    bg: '--halloween-badge-bg',
  };
  const INTENSITY_CLASSES = {
    subtle: 'halloween-intensity-subtle',
    party: 'halloween-intensity-party',
    // "normal" intentionally has no class — it's the library default.
  };

  const CDN_SCRIPT_TAG =
    '<script src="https://cdn.jsdelivr.net/npm/halloween.js@1.0.3/dist/halloween.iife.js"><\/script>';

  const pad2 = (n) => String(n).padStart(2, '0');

  function el(id) {
    return document.getElementById(id);
  }

  const cfg = {
    cornerLt: el('cfg-corner-lt'),
    cornerRt: el('cfg-corner-rt'),
    cornerLb: el('cfg-corner-lb'),
    cornerRb: el('cfg-corner-rb'),
    eyes: el('cfg-eyes'),
    witches: el('cfg-witches'),
    spiderDrop: el('cfg-spider-drop'),
    tombstones: el('cfg-tombstones'),
    intensitySubtle: el('cfg-intensity-subtle'),
    intensityNormal: el('cfg-intensity-normal'),
    intensityParty: el('cfg-intensity-party'),
    colorEnabled: el('cfg-color-enabled'),
    colorPicker: el('cfg-color-picker'),
    colorText: el('cfg-color'),
    badgeEnabled: el('cfg-badge-enabled'),
    badgeColorsEnabled: el('cfg-badge-colors-enabled'),
    badgeText: el('cfg-badge-text'),
    badgeTextPicker: el('cfg-badge-text-picker'),
    badgeBorder: el('cfg-badge-border'),
    badgeBorderPicker: el('cfg-badge-border-picker'),
    badgeBg: el('cfg-badge-bg'),
    badgeBgPicker: el('cfg-badge-bg-picker'),
    badgeBgTransparent: el('cfg-badge-bg-transparent'),
    sDay: el('cfg-season-start-day'),
    sMonth: el('cfg-season-start-month'),
    eDay: el('cfg-season-end-day'),
    eMonth: el('cfg-season-end-month'),
  };

  const colorError = el('cfg-color-error');
  const scriptExample = el('script-example');
  const bodyExample = el('body-example');
  const pasteExample = el('paste-example');
  const copyStatus = el('copy-status');
  const previewFrame = el('preview-frame');

  // ---- season day/month selects ----

  function populateMonthSelect(select) {
    MONTHS.forEach((name, i) => {
      const opt = document.createElement('option');
      opt.value = pad2(i + 1);
      opt.textContent = name;
      select.appendChild(opt);
    });
  }

  function populateDaySelect(select, maxDay) {
    const prev = select.value;
    select.innerHTML = '';
    for (let d = 1; d <= maxDay; d++) {
      const opt = document.createElement('option');
      opt.value = pad2(d);
      opt.textContent = String(d);
      select.appendChild(opt);
    }
    if (prev && Number(prev) <= maxDay) select.value = prev;
  }

  function setupDatePair(daySelect, monthSelect, defaultDay, defaultMonth) {
    populateMonthSelect(monthSelect);
    monthSelect.value = pad2(defaultMonth);
    populateDaySelect(daySelect, DAYS_IN_MONTH[defaultMonth - 1]);
    daySelect.value = pad2(defaultDay);
    monthSelect.addEventListener('change', () => {
      populateDaySelect(daySelect, DAYS_IN_MONTH[Number(monthSelect.value) - 1]);
      render();
    });
  }

  setupDatePair(cfg.sDay, cfg.sMonth, 18, 10);
  setupDatePair(cfg.eDay, cfg.eMonth, 2, 11);

  // ---- read state from controls ----

  function getIntensity() {
    if (cfg.intensityParty.checked) return 'party';
    if (cfg.intensitySubtle.checked) return 'subtle';
    return 'normal';
  }

  const badgePlacementRadios = document.querySelectorAll('input[name="cfg-badge-placement"]');
  const badgePlacementGroup = el('badge-placement');
  const badgeColorsGroup = el('badge-colors');
  const badgeColorsError = el('cfg-badge-colors-error');
  const badgeColorControls = [
    cfg.badgeText,
    cfg.badgeTextPicker,
    cfg.badgeBorder,
    cfg.badgeBorderPicker,
    cfg.badgeBgTransparent,
  ];

  function getBadgePlacement() {
    const checked = document.querySelector('input[name="cfg-badge-placement"]:checked');
    return checked ? checked.value : '';
  }

  function isBadgeBgTransparent() {
    return cfg.badgeBg.value.trim().toLowerCase() === 'transparent';
  }

  function hexOrNull(input) {
    const raw = input.value.trim();
    return HEX_PATTERN.test(raw) ? raw.toLowerCase() : null;
  }

  // Colors only apply with the badge on AND "Custom link colors" on; an
  // invalid hex or a transparent background yields null (= leave the
  // library default).
  function readBadgeColors() {
    if (!cfg.badgeEnabled.checked || !cfg.badgeColorsEnabled.checked) {
      return { text: null, border: null, bg: null };
    }
    return {
      text: hexOrNull(cfg.badgeText),
      border: hexOrNull(cfg.badgeBorder),
      bg: isBadgeBgTransparent() ? null : hexOrNull(cfg.badgeBg),
    };
  }

  function normalizedColor() {
    const raw = cfg.colorText.value.trim();
    if (!HEX_PATTERN.test(raw)) return null;
    return raw.toLowerCase();
  }

  function readState() {
    return {
      corners: {
        lt: cfg.cornerLt.checked,
        rt: cfg.cornerRt.checked,
        lb: cfg.cornerLb.checked,
        rb: cfg.cornerRb.checked,
      },
      effects: {
        eyes: cfg.eyes.checked,
        witches: cfg.witches.checked,
        spiderDrop: cfg.spiderDrop.checked,
        tombstones: cfg.tombstones.checked,
      },
      intensity: getIntensity(),
      badge: {
        enabled: cfg.badgeEnabled.checked,
        placement: getBadgePlacement(),
        colors: readBadgeColors(),
      },
      seasonStart: `${cfg.sDay.value}-${cfg.sMonth.value}`,
      seasonEnd: `${cfg.eDay.value}-${cfg.eMonth.value}`,
      colorEnabled: cfg.colorEnabled.checked,
      color: cfg.colorEnabled.checked ? normalizedColor() : null,
    };
  }

  // ---- build the public class list (single source for preview + generated body) ----

  function buildClasses(state) {
    const classes = ['halloween'];
    if (state.corners.lt) classes.push(CORNER_CLASSES.lt);
    if (state.corners.rt) classes.push(CORNER_CLASSES.rt);
    if (state.corners.lb) classes.push(CORNER_CLASSES.lb);
    if (state.corners.rb) classes.push(CORNER_CLASSES.rb);
    if (state.effects.eyes) classes.push(EFFECT_CLASSES.eyes);
    if (state.effects.witches) classes.push(EFFECT_CLASSES.witches);
    if (state.effects.spiderDrop) classes.push(EFFECT_CLASSES.spiderDrop);
    if (state.effects.tombstones) classes.push(EFFECT_CLASSES.tombstones);
    if (INTENSITY_CLASSES[state.intensity]) classes.push(INTENSITY_CLASSES[state.intensity]);
    if (state.badge.enabled) {
      classes.push('halloween-badge');
      if (BADGE_PLACEMENT_CLASSES[state.badge.placement]) {
        classes.push(BADGE_PLACEMENT_CLASSES[state.badge.placement]);
      }
    }
    return classes;
  }

  // ---- build the generated <body> markup text ----

  function buildBodyMarkup(state, classes) {
    const attrs = [`class="${classes.join(' ')}"`];
    if (state.seasonStart !== SEASON_DEFAULTS.start) {
      attrs.push(`data-halloween-start="${state.seasonStart}"`);
    }
    if (state.seasonEnd !== SEASON_DEFAULTS.end) {
      attrs.push(`data-halloween-end="${state.seasonEnd}"`);
    }
    const styles = [];
    if (state.colorEnabled && state.color) styles.push(`--halloween-color: ${state.color}`);
    Object.entries(state.badge.colors).forEach(([key, value]) => {
      if (value) styles.push(`${BADGE_COLOR_VARS[key]}: ${value}`);
    });
    if (styles.length > 0) attrs.push(`style="${styles.join('; ')}"`);
    return `<body ${attrs.join(' ')}>`;
  }

  // For platforms that don't expose <body> (Wix, Tilda, GTM, Squarespace…):
  // the same classes and attributes, applied from a script instead. It waits
  // for DOMContentLoaded because a script in <head> runs before document.body
  // exists, and applies immediately when injected after the page has loaded.
  // Includes the library <script> so one copy-paste is the whole install.
  function buildPasteMarkup(state, classes) {
    const lines = [`document.body.classList.add(${classes.map((c) => `"${c}"`).join(', ')});`];
    if (state.seasonStart !== SEASON_DEFAULTS.start) {
      lines.push(`document.body.setAttribute("data-halloween-start", "${state.seasonStart}");`);
    }
    if (state.seasonEnd !== SEASON_DEFAULTS.end) {
      lines.push(`document.body.setAttribute("data-halloween-end", "${state.seasonEnd}");`);
    }
    if (state.colorEnabled && state.color) {
      lines.push(`document.body.style.setProperty("--halloween-color", "${state.color}");`);
    }
    Object.entries(state.badge.colors).forEach(([key, value]) => {
      if (value) {
        lines.push(`document.body.style.setProperty("${BADGE_COLOR_VARS[key]}", "${value}");`);
      }
    });
    return [
      CDN_SCRIPT_TAG,
      '<script>',
      '(function () {',
      '  function apply() {',
      ...lines.map((line) => `    ${line}`),
      '  }',
      '  if (document.readyState === "loading") {',
      '    document.addEventListener("DOMContentLoaded", apply);',
      '  } else {',
      '    apply();',
      '  }',
      '})();',
      '<\/script>',
    ].join('\n');
  }

  // ---- iframe messaging ----

  const PREVIEW_ORIGIN = window.location.origin;
  // sendStateToPreview() is always safe to call; it just skips the actual
  // postMessage until "ready" arrives, at which point the ready handler
  // below sends whatever the current state is at that moment (never a
  // stale pre-ready snapshot).
  let previewReady = false;
  let previewTheme = 'light';

  function sendStateToPreview(state) {
    if (!previewReady) return;
    const payload = {
      corners: state.corners,
      effects: state.effects,
      intensity: state.intensity,
      badge: state.badge,
      color: state.colorEnabled ? state.color : null,
      theme: previewTheme,
    };
    previewFrame.contentWindow.postMessage(
      { type: 'halloween-preview:state', payload },
      PREVIEW_ORIGIN,
    );
  }

  // Two-way ready handshake, immune to load order — this is the actual
  // protection against the lost-ready race, not a timer. The iframe can
  // finish loading (e.g. served from cache) before this deferred script
  // even runs and attaches its own listener, so a "ready" sent from inside
  // the iframe at that exact moment would be lost with nothing to receive
  // it. Instead the PARENT pings from two points that between them cover
  // both possible orderings:
  //  1. immediately, right after the listener below is attached — catches
  //     "the iframe was already fully loaded by the time we got here";
  //  2. on the iframe element's own `load` event — catches "the iframe
  //     finishes loading after we started listening". By the time `load`
  //     fires, preview.js's message listener (registered as its very first
  //     statement) is guaranteed to already be attached, since `load` only
  //     fires once every script in the iframe, deferred or not, has run.
  // preview.js answers every valid ping with "ready", and separately still
  // sends one proactive "ready" of its own on its own load as a second,
  // independent safety net. Both a repeated ping and a repeated ready are
  // harmless no-ops: sendStateToPreview() just re-sends the current state,
  // which the iframe applies idempotently (plain classList.toggle / style
  // property writes, nothing additive).
  function pingPreview() {
    if (!previewFrame.contentWindow) return;
    previewFrame.contentWindow.postMessage({ type: 'halloween-preview:ping' }, PREVIEW_ORIGIN);
  }
  pingPreview();
  previewFrame.addEventListener('load', pingPreview);

  window.addEventListener('message', (event) => {
    if (event.source !== previewFrame.contentWindow) return;
    if (event.origin !== PREVIEW_ORIGIN) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'halloween-preview:ready') {
      previewReady = true;
      sendStateToPreview(currentState);
    }
  });

  // ---- body textarea auto-resize ----

  // Grows the readonly body textarea to fit its wrapped content, so it never
  // shows its own internal scrollbar. Resetting height to "auto" first is
  // required before reading scrollHeight — otherwise scrollHeight would just
  // reflect the previous (already-grown) height and the box could never
  // shrink back down when the body markup gets shorter. This only ever
  // *measures* height and writes it back once, so it can't retrigger itself
  // and cannot loop.
  function resizeBodyTextarea() {
    [bodyExample, pasteExample].forEach((area) => {
      area.style.height = 'auto';
      area.style.height = `${area.scrollHeight}px`;
    });
  }

  window.addEventListener('resize', resizeBodyTextarea);

  // ---- render: single update path ----

  let currentState = readState();

  function render() {
    currentState = readState();
    badgePlacementRadios.forEach((radio) => {
      radio.disabled = !currentState.badge.enabled;
    });
    badgePlacementGroup.classList.toggle('is-disabled', !currentState.badge.enabled);
    const colorsActive = currentState.badge.enabled && cfg.badgeColorsEnabled.checked;
    cfg.badgeColorsEnabled.disabled = !currentState.badge.enabled;
    badgeColorControls.forEach((control) => {
      control.disabled = !colorsActive;
    });
    cfg.badgeBg.disabled = !colorsActive;
    cfg.badgeBgPicker.disabled = !colorsActive;
    badgeColorsGroup.classList.toggle('is-disabled', !colorsActive);
    cfg.badgeBgPicker.classList.toggle('is-transparent', isBadgeBgTransparent());
    const badgeInputs = [
      [cfg.badgeText, 'text'],
      [cfg.badgeBorder, 'border'],
      [cfg.badgeBg, 'bg'],
    ];
    let badgeColorInvalid = false;
    badgeInputs.forEach(([input, key]) => {
      const invalid =
        colorsActive &&
        !(key === 'bg' && isBadgeBgTransparent()) &&
        currentState.badge.colors[key] === null;
      input.setAttribute('aria-invalid', String(invalid));
      badgeColorInvalid = badgeColorInvalid || invalid;
    });
    badgeColorsError.textContent = badgeColorInvalid
      ? 'Enter valid hex colors, e.g. #f4b342 or #f60.'
      : '';
    const classes = buildClasses(currentState);

    scriptExample.textContent = CDN_SCRIPT_TAG;
    const bodyMarkup = buildBodyMarkup(currentState, classes);
    bodyExample.value = bodyMarkup;
    pasteExample.value = buildPasteMarkup(currentState, classes);
    resizeBodyTextarea();

    // currentState.color is already null for anything that doesn't match
    // HEX_PATTERN — including an empty field. With Custom color on, an
    // empty field means no override actually applies despite the switch
    // being enabled, so it's invalid too, not just a non-empty malformed
    // value.
    const colorInvalid = currentState.colorEnabled && !currentState.color;
    cfg.colorText.setAttribute('aria-invalid', String(colorInvalid));
    colorError.textContent = colorInvalid ? 'Enter a valid hex color, e.g. #f4b342 or #f60.' : '';

    sendStateToPreview(currentState);
  }

  [...Object.values(cfg), ...badgePlacementRadios].forEach((control) => {
    control.addEventListener('input', render);
  });

  // Keep the native color picker and the hex text field in sync without
  // fighting each other: the picker always writes a full 6-digit value into
  // the text field; the text field (3- or 6-digit) only pushes into the
  // picker when it's valid, since <input type="color"> can't hold shorthand.
  cfg.colorPicker.addEventListener('input', () => {
    cfg.colorText.value = cfg.colorPicker.value;
    render();
  });
  cfg.colorText.addEventListener('input', () => {
    const value = cfg.colorText.value.trim();
    if (HEX_PATTERN.test(value) && value.length === 7) {
      cfg.colorPicker.value = value;
    }
  });

  // Same picker <-> hex field sync as the spider color above, for each badge
  // color: the picker always writes a full 6-digit hex; the text field only
  // pushes into the picker when it is a valid 6-digit hex.
  [
    [cfg.badgeTextPicker, cfg.badgeText],
    [cfg.badgeBorderPicker, cfg.badgeBorder],
    [cfg.badgeBgPicker, cfg.badgeBg],
  ].forEach(([picker, text]) => {
    picker.addEventListener('input', () => {
      text.value = picker.value;
      render();
    });
    text.addEventListener('input', () => {
      const value = text.value.trim();
      if (HEX_PATTERN.test(value) && value.length === 7) picker.value = value;
    });
  });

  cfg.badgeBgTransparent.addEventListener('click', () => {
    cfg.badgeBg.value = 'transparent';
    render();
  });

  render();

  // ---- replay ----

  el('replay-btn').addEventListener('click', () => {
    if (!previewReady) return;
    previewFrame.contentWindow.postMessage({ type: 'halloween-preview:replay' }, PREVIEW_ORIGIN);
  });

  // ---- preview theme ----

  const themeToggle = el('theme-toggle');
  themeToggle.addEventListener('click', () => {
    previewTheme = previewTheme === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute(
      'aria-label',
      previewTheme === 'dark' ? 'Switch preview to light theme' : 'Switch preview to dark theme',
    );
    themeToggle.querySelector('span').textContent = previewTheme === 'dark' ? '🌙' : '☀️';
    sendStateToPreview(currentState);
  });

  // ---- tabs (WAI-ARIA tablist, shared by every tab group on the page) ----

  function setupTabs(tabs, panels) {
    function selectTab(tab) {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        panels[t.id].hidden = !selected;
      });
      tab.focus();
      resizeBodyTextarea();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          const next =
            event.key === 'ArrowRight'
              ? (i + 1) % tabs.length
              : (i - 1 + tabs.length) % tabs.length;
          event.preventDefault();
          selectTab(tabs[next]);
        } else if (event.key === 'Home') {
          event.preventDefault();
          selectTab(tabs[0]);
        } else if (event.key === 'End') {
          event.preventDefault();
          selectTab(tabs[tabs.length - 1]);
        }
      });
    });
  }

  setupTabs([el('tab-script'), el('tab-npm')], {
    'tab-script': el('panel-script'),
    'tab-npm': el('panel-npm'),
  });
  setupTabs([el('tab-body'), el('tab-paste')], {
    'tab-body': el('panel-body'),
    'tab-paste': el('panel-paste'),
  });

  // ---- copy buttons ----

  function setCopyStatus(message) {
    copyStatus.textContent = message;
  }

  function flashCopied(button) {
    const original = button.dataset.label || button.textContent;
    button.textContent = 'Copied';
    window.setTimeout(() => {
      button.textContent = original;
    }, 1600);
  }

  function setupCopyButton(buttonId, getText, label) {
    const button = el(buttonId);
    button.addEventListener('click', () => {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        setCopyStatus(`Clipboard isn't available — copy the ${label.toLowerCase()} manually.`);
        return;
      }
      navigator.clipboard.writeText(getText()).then(
        () => {
          setCopyStatus(`${label} copied`);
          flashCopied(button);
        },
        () => {
          setCopyStatus(`Couldn't copy the ${label.toLowerCase()} — copy it manually.`);
        },
      );
    });
  }

  setupCopyButton('copy-script-btn', () => scriptExample.textContent, 'Script tag');
  setupCopyButton(
    'copy-npm-install-btn',
    () => el('npm-install-example').textContent,
    'npm install command',
  );
  setupCopyButton(
    'copy-npm-import-btn',
    () => el('npm-import-example').textContent,
    'npm import line',
  );
  setupCopyButton('copy-body-btn', () => bodyExample.value, 'Body markup');
  setupCopyButton('copy-paste-btn', () => pasteExample.value, 'Paste-only snippet');
})();
