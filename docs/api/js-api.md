---
title: JS API
description: The halloween and pageEffects exports. What they do, when you need them, and what they do not bypass. Includes the Halloween global for script-tag installs.
section: api
order: 1
---

Most sites never call the API. The library already syncs itself with the classes and attributes on `<body>`: on load, on every class change and on every change to the season attributes. These exports cover the cases where that is not enough.

With a script tag, the same functions are on the global `Halloween`, as `Halloween.halloween` and `Halloween.pageEffects`. With npm they are named imports.

```js
import halloween, { pageEffects } from "halloween.js";
```

## halloween()

An immediate manual sync against the current body classes, the season attributes and today's date. Takes no arguments and returns nothing.

```js
document.body.classList.add("halloween", "halloween-eyes"); // master class required
halloween(); // sync now, instead of waiting for the next automatic check
```

It runs the same checks as the automatic sync. It does not skip the master switch or the season gate. Two reasons to call it:

- To sync at once after you change the classes, without waiting for the browser to deliver the change notification.
- To re-check the date. The season is only checked when something changes, so a page that stays open past the first or last day of the season keeps its old state until a sync runs. Calling `halloween()` from a timer is the way to refresh it.

It is also exported as the default export, so `import halloween from "halloween.js"` and `import { halloween } from "halloween.js"` give the same function.

## pageEffects.start(name)

Starts one ambient effect directly, without a body class.

```js
pageEffects.start("eyes");
```

`name` is one of `"eyes"`, `"witches"`, `"spider-drop"` and `"tombstones"`. TypeScript accepts only these values through the exported type `PageEffectName`.

What to know:

- It skips the master switch and the season window for this call. It does still inject the library's styles and apply the color override first.
- It does not last on its own. The next automatic sync, which runs on any change to the body classes, either season attribute or the reduced-motion preference, stops every effect whose `halloween-<name>` class is not on `<body>`. If you need an effect to stay, put its class on `<body>`.
- It does nothing when the visitor prefers reduced motion.
- Calling it again for an effect that is already running does nothing.
- Intensity classes on `<body>` still apply to sizes and timing.

## pageEffects.stop(name)

Stops one effect. Its timer is cleared and every instance on screen is removed immediately, without waiting for a fade-out.

```js
pageEffects.stop("witches");
```

## Types

The package ships its own types. `PageEffectName` is exported for typing your own code.

```ts
import type { PageEffectName } from "halloween.js";

const name: PageEffectName = "eyes";
```

## What is not in the API

There is no configuration object. The season, the color, sizes and intensity are all set with attributes, classes and CSS variables: see [options](/docs/options/master-switch/).
