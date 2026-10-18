// Playground controller. The page itself is the preview: halloween.js runs on
// this page's <body>, which has the season forced open via data attributes in
// index.html, and the controls below toggle its public classes directly. The
// season selects never touch the page — they only change the generated code.
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
  const pasteExample = el('paste-example');
  const npmActivateExample = el('npm-activate-example');
  const copyStatus = el('copy-status');

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

  // The lines that switch the library on: the same classes, attributes and
  // custom properties for both outputs. The class list goes one name per
  // line so a long list stays readable instead of one very wide line.
  function buildActivationLines(state, classes) {
    const lines = [
      'document.body.classList.add(',
      ...classes.map((c, i) => `   "${c}"${i < classes.length - 1 ? ',' : ''}`),
      ');',
    ];
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
    return lines;
  }

  // For any site or builder: a script applies the classes once the page is
  // ready. It waits for DOMContentLoaded because a script in <head> runs
  // before document.body exists, and applies immediately when injected after
  // the page has loaded. Includes the library <script> so one copy-paste is
  // the whole install.
  function buildPasteMarkup(state, classes) {
    return [
      CDN_SCRIPT_TAG,
      '<script>',
      '(function () {',
      '  function apply() {',
      ...buildActivationLines(state, classes).map((line) => `    ${line}`),
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

  // For a bundled project, after `import "halloween.js"`: just the activation.
  function buildNpmActivation(state, classes) {
    return buildActivationLines(state, classes).join('\n');
  }

  // ---- apply the state to this page ----

  // The only classes this playground ever adds to or removes from the page's
  // own <body>. "halloween" and the season attributes live in index.html and
  // are never touched here, so the page keeps running outside the season.
  const ALL_MANAGED_CLASSES = [
    'halloween-badge',
    ...Object.values(BADGE_PLACEMENT_CLASSES),
    ...Object.values(CORNER_CLASSES),
    ...Object.values(EFFECT_CLASSES),
    ...Object.values(INTENSITY_CLASSES),
  ];

  function applyToPage(state, classes) {
    const desired = new Set(classes);
    ALL_MANAGED_CLASSES.forEach((cls) => {
      document.body.classList.toggle(cls, desired.has(cls));
    });
    if (state.colorEnabled && state.color) {
      document.body.style.setProperty('--halloween-color', state.color);
    } else {
      document.body.style.removeProperty('--halloween-color');
    }
    Object.entries(BADGE_COLOR_VARS).forEach(([key, cssVar]) => {
      const value = state.badge.colors[key];
      if (value) document.body.style.setProperty(cssVar, value);
      else document.body.style.removeProperty(cssVar);
    });
  }

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

    pasteExample.textContent = buildPasteMarkup(currentState, classes);
    npmActivateExample.textContent = buildNpmActivation(currentState, classes);

    // currentState.color is already null for anything that doesn't match
    // HEX_PATTERN — including an empty field. With Custom color on, an
    // empty field means no override actually applies despite the switch
    // being enabled, so it's invalid too, not just a non-empty malformed
    // value.
    const colorInvalid = currentState.colorEnabled && !currentState.color;
    cfg.colorText.setAttribute('aria-invalid', String(colorInvalid));
    colorError.textContent = colorInvalid ? 'Enter a valid hex color, e.g. #f4b342 or #f60.' : '';

    applyToPage(currentState, classes);
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

  setupTabs([el('tab-paste'), el('tab-npm')], {
    'tab-paste': el('panel-paste'),
    'tab-npm': el('panel-npm'),
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

  setupCopyButton('copy-paste-btn', () => pasteExample.textContent, 'Snippet');
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
  setupCopyButton('copy-npm-activate-btn', () => npmActivateExample.textContent, 'Activation code');
})();
