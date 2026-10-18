# How it works

What halloween.js does on your page. The two gates, what gets added to the DOM, when it re-checks, and why it never shifts your layout.

Canonical page: https://halloween.js.org/docs/guides/how-it-works/

## Two gates

The library is active only when both are true:

1. `<body>` has the `halloween` class (the [master switch](/docs/options/master-switch/)).
2. Today is inside the [season window](/docs/options/season/).

If either is false, every effect, the corner webs and the badge are removed.

## When it checks

It checks once the page is ready, and again whenever `<body>` changes in one of these ways:

- Its `class` attribute changes.
- Its `data-halloween-start` or `data-halloween-end` attribute changes.
- The visitor changes the reduced-motion setting.

There is no polling. A change of date while the page sits open is not noticed on its own: see [season window](/docs/options/season/) and `halloween()` in the [JS API](/docs/api/js-api/).

## What it adds to the page

- A single `<style>` element with the id `halloween-styles`, added to `<head>` once. All the CSS is inside the bundle.
- One `div` with the class `halloween-page-layer` at the end of `<body>`. It is fixed to the window, covers it, ignores pointer events and is hidden from assistive technology. Effects and corner webs live inside it. It stays in the page when the library switches off. It is empty then.
- The badge, only when you opt in. See [badge](/docs/options/badge/).

It does not change your markup, does not move or resize anything, and does not change `<body>`'s layout.

## What it never does

- It never loads anything from the network. All artwork is inline.
- It never changes your existing body classes. It only reads them.
- It never sets a color unless you ask for one.

## Timing

Each effect has its own timer. The timer keeps running while the tab is in the background, but creates nothing until the tab is visible. Under reduced motion no timers run for ambient effects at all. See [ambient effects](/docs/options/effects/) and [accessibility](/docs/guides/accessibility/).
