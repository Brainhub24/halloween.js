---
name: halloween-js
description: Add Halloween effects (spider webs, blinking eyes, flying witches, a dropping spider, rising tombstones) to a website with halloween.js. Use when asked to add Halloween, spooky or seasonal decorations to a site.
---

# halloween.js

Zero-dependency Halloween decorations for any website. It is controlled only by CSS classes and attributes on `<body>`. Full documentation: https://halloween.js.org/docs/ (every page also as Markdown by adding .md, e.g. https://halloween.js.org/docs/options/season.md; everything in one file: https://halloween.js.org/llms-full.txt)

## Rules

1. Load one script, then add classes to `<body>`. Nothing else is needed: no CSS file, no init call.
2. Always pin an exact version in the CDN URL. Never use an unversioned or ranged URL.
3. Leave the script in the site after installing. By default it activates itself every year from 18 October to 2 November and does nothing the rest of the year. Do not add code to remove it, and do not tell the user it needs removing.
4. The user installing it earlier than 18 October will see nothing until the season starts. That is expected, not a bug.
5. Keep any existing `<body>` classes. Add to them, never replace them.

## Install

Choose by what the project has.

### Static HTML, templates, or when you can edit the body tag

Put the script anywhere in the page and the classes on `<body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/halloween.js@1.0.3/dist/halloween.iife.js"></script>

<body class="halloween halloween-screen-left-top halloween-screen-right-bottom halloween-eyes halloween-witches halloween-spider-drop halloween-tombstones">
```

### CMS, site builders, tag managers, or when you cannot edit the body tag

Paste this once, in a footer or custom-code field. It adds the classes from a script and keeps the existing ones:

```html
<script src="https://cdn.jsdelivr.net/npm/halloween.js@1.0.3/dist/halloween.iife.js"></script>
<script>
(function () {
  function apply() {
    document.body.classList.add(
       "halloween",
       "halloween-screen-left-top",
       "halloween-screen-right-bottom",
       "halloween-eyes",
       "halloween-witches",
       "halloween-spider-drop",
       "halloween-tombstones"
    );
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
</script>
```

### npm project with a bundler

```bash
npm install halloween.js
```

```js
import "halloween.js";

document.body.classList.add("halloween", "halloween-eyes", "halloween-screen-left-top");
```

Importing the module is enough to start it. Run the `classList.add` after the DOM is ready. Per-platform steps: https://halloween.js.org/platforms/

## Classes on body

| Class | Effect |
| --- | --- |
| `halloween` | Master switch. Required. Without it nothing runs |
| `halloween-eyes` | Blinking eyes fade in and out at random spots |
| `halloween-witches` | A witch flies across the screen at a random angle |
| `halloween-spider-drop` | A spider drops from the top on a thread and climbs back |
| `halloween-tombstones` | A tombstone rises from the bottom, holds, then sinks |
| `halloween-screen-left-top`, `halloween-screen-right-top`, `halloween-screen-left-bottom`, `halloween-screen-right-bottom` | A static spider web fixed in that corner. Any combination |
| `halloween-intensity-subtle` | 2.5 times slower, smaller, dimmer layer (opacity 0.65) |
| `halloween-intensity-party` | 2 times faster, up to 2 of each effect at once, larger. Wins over subtle if both are present |
| no intensity class | Normal. There is no `halloween-intensity-normal` class |
| `halloween-badge` | Optional credit link "Halloween effects by halloween.js" at the end of `<body>` |
| `halloween-badge-left`, `halloween-badge-right` | Align the badge. Centered by default |

An element with the attribute `data-halloween-badge-slot` hosts the badge instead of `<body>`.

Removing a class removes that effect from the screen immediately. Toggling classes from code is enough; the library watches `<body>`.

## Season window

Default: 18 October to 2 November, every year, by the visitor's local date. Override with attributes on `<body>`:

```html
<body class="halloween halloween-eyes" data-halloween-start="18-10" data-halloween-end="02-11">
```

- Format `DD-MM`. Both attributes are optional and independent. The end day is included.
- A window may cross the new year (`25-12` to `05-01`).
- Dates are validated against the calendar. `29-02` is accepted and counts as 28 February in non-leap years.
- A value that is present but malformed makes the library run with no season limit (fail open). An empty value counts as not set.
- With a classic script tag, `?s=DD-MM&e=DD-MM` on the script URL does the same. The body attribute wins when both are set.
- To test outside the season, set a window that includes today, and remove it before shipping.

## Color and CSS variables

Spiders, threads, webs, the witch and tombstones use the page text color by default. The eyes always keep their own amber. Set variables on `:root` or `body`:

| Variable | Controls | Default |
| --- | --- | --- |
| `--halloween-color` | Color of webs, spiders, witch, tombstones (any CSS color). Also `?color=%23ff6b00` on the script URL | page text color |
| `--halloween-page-z-index` | Stacking order of the effects layer | `999` |
| `--halloween-page-opacity` | Opacity of the whole layer | `1` |
| `--halloween-screen-corner-size` | Width and height of each corner web | `120px` |
| `--halloween-eyes-width`, `--halloween-eyes-height` | Eyes | `64px`, `26px` |
| `--halloween-witch-width`, `--halloween-witch-height` | Witch | `104px`, `130px` |
| `--halloween-spider-drop-width`, `--halloween-spider-drop-height` | Dropping spider | `90px`, `90px` |
| `--halloween-tombstone-width`, `--halloween-tombstone-height` | Tombstone | `76px`, `96px` |
| `--halloween-badge-color`, `--halloween-badge-border-color`, `--halloween-badge-bg`, `--halloween-badge-font`, `--halloween-badge-opacity`, `--halloween-badge-z-index` | Badge look | inherits, 30% of text color, transparent, `13px/1.4 system-ui`, `0.9`, page z-index + 1 |

A size you set always wins over the size from an intensity class. Do not set variables beginning with `--halloween-preset-`; they are internal.

## JavaScript API

Most sites never need it.

- `halloween()` re-runs the sync now (master class and season are still required). Useful after a long-open page crosses a season boundary, because the date is only checked when something changes.
- `pageEffects.start(name)` / `pageEffects.stop(name)` with `name` one of `"eyes"`, `"witches"`, `"spider-drop"`, `"tombstones"`. `start` ignores the master class and season, but the next automatic sync stops any effect whose body class is missing. `stop` removes instances at once.
- With a script tag these are `Halloween.halloween` and `Halloween.pageEffects`. With npm: `import halloween, { pageEffects } from "halloween.js"`.

## Behavior to know

- Ambient effects (eyes, witches, spider drop, tombstones) do not run when the visitor prefers reduced motion. Corner webs and the badge stay.
- No new effects are created while the browser tab is in the background.
- Everything renders in a fixed, click-through, `aria-hidden` layer. It never shifts the page layout.
- Internal timings and positions are not configurable.

## When asked for a quick setup

Use the "cannot edit the body tag" snippet with the default classes above, put it in the site-wide footer or the base layout so every page gets it, keep the pinned version, and tell the user: the effects appear on their own from 18 October to 2 November every year; nothing to remove afterwards.

More detail on every option: https://halloween.js.org/docs/
