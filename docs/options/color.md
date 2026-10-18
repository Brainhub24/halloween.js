---
title: Color
description: Change the color of webs, spiders, the witch and tombstones with --halloween-color. Which elements follow it, which do not, and how it combines with the script URL parameter.
section: options
order: 6
---

By default the decorations take the text color of your page, which looks right on both light and dark sites without any configuration. One CSS variable overrides that.

## --halloween-color

Any valid CSS color is accepted: a hex value, `rgb()`, `hsl()`, a named color or `var()` of your own token.

```css
:root {
  --halloween-color: #ff6b00;
}
```

| Value | Result |
| --- | --- |
| not set (default) | The color of the surrounding text, `currentColor` |
| Any CSS color | All decorations listed below use it |

## What follows the variable

- The spider webs in the [screen corners](/docs/options/screen-corners/).
- The spider and its thread (`halloween-spider-drop`).
- The witch silhouette (`halloween-witches`).
- The tombstone (`halloween-tombstones`).

## What does not follow it

- The eyes (`halloween-eyes`) keep a fixed amber with a dark outline. They are a two-tone picture, not a single-color shape, so they look the same on every background.
- The [badge](/docs/options/badge/) has its own color variables.

## Where to set it

Set it in your stylesheet on `:root` or `body`, or inline on `<body>`. If you load the script with a tag, you can also pass `?color=` on its URL (see [script URL parameters](/docs/options/script-url-parameters/)).

```html
<body class="halloween halloween-witches" style="--halloween-color: #ff6b00">
```

When both a stylesheet value and `?color=` are present, the `?color=` value wins on pages where it is used. It is written inline on `<body>`, which sits closer to the decorations than `:root`.

The library only ever sets the color. It never clears one that you set by another means, even when a body class changes later.

## Related variable

`--halloween-page-z-index` places the effects layer above or below other fixed elements. The default is `999`. Lower it to keep a modal or a cookie banner on top.

```css
:root {
  --halloween-page-z-index: 500;
}
```
