# Installation

Install halloween.js from npm or load it with one script tag from a CDN. Formats, TypeScript types and why you should pin an exact version.

Canonical page: https://halloween.js.org/docs/getting-started/installation/

halloween.js ships as one small file with no dependencies. Its styles are inside the bundle, so there is no separate CSS file to load. Pick the way that matches your site.

## Script tag from a CDN

The simplest way, with no build step. It works on plain HTML, WordPress, site builders and anything else where you can add a script.

```html
<script src="https://cdn.jsdelivr.net/npm/halloween.js@1.0.3/dist/halloween.iife.js"></script>
```

The script starts on its own as soon as it loads. After it loads, the browser global `Halloween` is available with `Halloween.halloween` and `Halloween.pageEffects` (see the [JS API](/docs/api/js-api/)).

Always pin an exact version, like `@1.0.3` above. jsDelivr caches an npm version forever, so a pinned URL can never change under you. A URL without a version, or with a range, can start serving a different build on the day a new release is published.

On a site builder you usually cannot edit the `<body>` tag, and a script placed in `<head>` runs before `document.body` exists. The [platform guides](/platforms/) show a snippet that works anywhere.

## npm

```bash
npm install halloween.js
```

```js
import halloween, { pageEffects } from "halloween.js";
```

A plain `import` already switches the library on: importing the module starts watching `<body>` for the `halloween` class. You do not need to call anything. Call `halloween()` or `pageEffects.start()` only in the cases described in the [JS API](/docs/api/js-api/).

## Package formats

| Format | File | Use it for |
| --- | --- | --- |
| ESM | `dist/halloween.js` | `import` in bundlers and modern Node tooling |
| CommonJS | `dist/halloween.cjs` | `require()` |
| IIFE | `dist/halloween.iife.js` | The CDN script tag. Exposes the global `Halloween` |
| Types | `dist/halloween.d.ts` for ESM, `dist/halloween.d.cts` for CJS | TypeScript, no extra package needed |

The whole library is under 10 KB gzipped and has zero runtime dependencies.

## Install is not activation

Loading the library does nothing visible by itself. It switches on only when `<body>` carries the `halloween` class and today is inside the [season window](/docs/options/season/). Continue with the [quick start](/docs/getting-started/quick-start/).

> Installed the script before 18 October? You will see nothing until the season starts. That is expected, not a bug. Leave the script in place: it turns on by itself every year.
