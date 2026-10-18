# Script URL parameters

The s, e and color query parameters on the script tag URL. When they work, when they do not, and how they rank against body attributes.

Canonical page: https://halloween.js.org/docs/options/script-url-parameters/

When you load the library with a plain script tag, three optional query parameters on the script's own URL set the same values as the attributes and the CSS variable. They are a convenience for the script-tag install.

```html
<script
  src="https://cdn.jsdelivr.net/npm/halloween.js@1.0.3/dist/halloween.iife.js?s=18-10&e=02-11&color=%23ff6b00"
></script>
```

## Parameters

| Parameter | Same as | Format | Default |
| --- | --- | --- | --- |
| `s` | `data-halloween-start` | `DD-MM` | `18-10` |
| `e` | `data-halloween-end` | `DD-MM` | `02-11` |
| `color` | `--halloween-color` | Any CSS color, URL-encoded. A hash sign is written as `%23` | not set |

An empty parameter counts as not set.

## Limits

- They work only with a classic script tag. The library reads its own URL while that script is running. There is no script URL to read when you import the npm package, so the parameters do not exist there. Use the `<body>` attributes and CSS variables instead.
- They are read once, when the script loads. Changing the URL afterwards does nothing.
- Body attributes are re-read on every check and can change at runtime. Query parameters cannot.

## Precedence

For the season, each end is resolved on its own: `<body>` attribute first, then the query parameter, then the default. See [season window](/docs/options/season/).

For the color, the query parameter is written as an inline `--halloween-color` on `<body>`, so it takes priority over a value from your stylesheet. See [color](/docs/options/color/).
