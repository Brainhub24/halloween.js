---
title: Master switch
description: The halloween body class turns the whole library on. Without it nothing runs. How it combines with the season window.
section: options
order: 1
---

`<body class="halloween">` turns the library on. Without this class nothing runs at all: no ambient effects, no screen corners, no badge. Every other class is only a modifier.

```html
<body class="halloween">
```

## Values

| Class | Effect |
| --- | --- |
| `halloween` | On. The other classes and attributes take effect. |
| not present | Off. Everything is removed from the page, including effects already on screen. |

## What it affects

- Every [ambient effect](/docs/options/effects/), every [screen corner](/docs/options/screen-corners/) and the [badge](/docs/options/badge/) are gated by it.
- It is the first of two gates. The second is the [season window](/docs/options/season/): the library does anything only when the class is present and today is inside the season. Both are checked together each time something changes.

## Changing it at runtime

Adding or removing the class is picked up automatically. Removing it removes the web corners, the badge and every effect on screen immediately, and stops the timers that create new effects.

```js
document.body.classList.add("halloween");
document.body.classList.remove("halloween");
```

`<body>` is the only element that is watched. The class on `<html>` or on any other element has no effect.
