---
title: Size and opacity
description: CSS variables that resize each effect and dim the whole effects layer. Every variable, its default and how it combines with the intensity classes.
section: options
order: 7
---

Each effect's size, the size of the screen-corner webs and the opacity of the whole effects layer are controlled with CSS custom properties. Set them on `:root`, on `body` or on any element above the effects.

```css
:root {
  --halloween-witch-width: 140px;
  --halloween-witch-height: 175px;
  --halloween-page-opacity: 0.8;
}
```

## Variables

| Variable | Controls | Default |
| --- | --- | --- |
| `--halloween-eyes-width` | Width of the blinking eyes | `64px` |
| `--halloween-eyes-height` | Height of the blinking eyes | `26px` |
| `--halloween-witch-width` | Width of the flying witch | `104px` |
| `--halloween-witch-height` | Height of the flying witch | `130px` |
| `--halloween-spider-drop-width` | Width of the dropping spider | `90px` |
| `--halloween-spider-drop-height` | Height of the dropping spider. The drop distance accounts for it | `90px` |
| `--halloween-tombstone-width` | Width of the rising tombstone | `76px` |
| `--halloween-tombstone-height` | Height of the rising tombstone | `96px` |
| `--halloween-screen-corner-size` | Width and height of each corner web (square) | `120px` |
| `--halloween-page-opacity` | Opacity of the entire effects layer: ambient effects and corner webs together | `1` |
| `--halloween-page-z-index` | Stacking order of the effects layer | `999` |

Lengths accept any CSS length. Opacity is a number from 0 to 1. Each size can be set independently of the others. The witch, for instance, can be wider without changing its height.

## Order of precedence

For each size and for the opacity, the library uses the first value that exists:

1. Your own variable from the table.
2. The value from the active [intensity](/docs/options/intensity/) class.
3. The default from the table.

So an explicit size is kept whichever intensity class is on the page. The intensity class sets internal variables that start with `--halloween-preset-`. Do not set those yourself. They are not a public interface.

## Layer opacity and the corner webs

`--halloween-page-opacity` multiplies with each element's own animation. Ambient effects fade in and out by themselves, and the corner webs are drawn at 75 percent. The layer value dims everything on top of that. The `subtle` intensity uses `0.65`.

## Not configurable

The timing, positions, movement ranges and the artwork of the effects are internal. Only the values above and the [classes](/docs/options/effects/) are public options.
