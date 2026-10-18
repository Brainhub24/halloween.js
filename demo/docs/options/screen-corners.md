# Screen corners

Static spider webs fixed to the corners of the viewport. The four corner classes, size, color, opacity and how they differ from ambient effects.

Canonical page: https://halloween.js.org/docs/options/screen-corners/

Screen corners are static spider webs fixed to the corners of the browser window. They do not move, so unlike the [ambient effects](/docs/options/effects/) they are not affected by reduced motion.

```html
<body class="halloween halloween-screen-left-top halloween-screen-right-bottom">
```

## Values

| Class | Corner |
| --- | --- |
| `halloween-screen-left-top` | Top left |
| `halloween-screen-right-top` | Top right |
| `halloween-screen-left-bottom` | Bottom left |
| `halloween-screen-right-bottom` | Bottom right |

Use any combination, from none to all four. Each web is mirrored to fit its corner.

## What you can change

| What | How | Default |
| --- | --- | --- |
| Size | `--halloween-screen-corner-size` sets the width and height of each web, which is square | `120px` |
| Color | `--halloween-color` | The page text color |
| Opacity of all effects together | `--halloween-page-opacity` | `1` |

The web itself is drawn at 75 percent opacity. That value is fixed inside the library. The [intensity](/docs/options/intensity/) classes change the default size: 90px for `subtle` and 140px for `party`. A value you set yourself always wins over the preset. See [size and opacity](/docs/options/size-and-opacity/).

## Behavior

- All four webs are created when the library switches on. A class only shows or hides one of them, with CSS, so toggling is instant.
- The webs sit slightly outside the window edge, so the corner of the web is cut off by the viewport.
- They are drawn in the same fixed layer as the ambient effects, which does not receive clicks and never shifts your layout.
- The layer is placed at `z-index: 999` by default. Lower it with `--halloween-page-z-index` to keep a cookie banner or a modal above the webs.
