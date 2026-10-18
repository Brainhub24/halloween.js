---
title: Badge
description: The optional credit link. How to switch it on, align it left or right, place it inside your footer, restyle it with CSS variables and what it does on short pages.
section: options
order: 8
---

The badge is an optional small link to halloween.js: "🎃 Halloween effects by halloween.js". It is off by default. Use it if you want to credit the project.

```html
<body class="halloween halloween-badge">
```

The badge shows only when both gates are open: the `halloween` class is on `<body>` and today is inside the [season window](/docs/options/season/). Outside the season it is removed with everything else.

## Classes

| Class | Result |
| --- | --- |
| `halloween-badge` | Shows the badge. Required |
| `halloween-badge-left` | Aligns it to the left, with a 16px margin |
| `halloween-badge-right` | Aligns it to the right, with a 16px margin |
| no alignment class | Centered |

## Where it is placed

By default the badge is a normal block at the very end of `<body>`, after your content. It is not part of the fixed effects layer, so it can never sit on top of a chat widget, a cookie banner, a toast or a modal.

To put it somewhere else, for instance inside your own footer, add this attribute to the element that should hold it. The first matching element on the page is used.

```html
<footer data-halloween-badge-slot></footer>
```

The alignment classes apply to a badge in a slot as well.

## Short pages

When the page content is shorter than the window, a badge at the end of `<body>` would float up directly under the content. The library adds the missing height above it as a margin, so the badge sits at the bottom edge of the screen. It does not change `<body>`'s own layout. A tall page gets no extra space. This applies only when the badge is in `<body>`. A badge in a slot stays where your markup puts it.

## Styling

All variables are optional and can be set on `:root` or `body`.

| Variable | Controls | Default |
| --- | --- | --- |
| `--halloween-badge-color` | Text color | Inherited from the page |
| `--halloween-badge-border-color` | Border color | The text color at 30 percent |
| `--halloween-badge-bg` | Background | `transparent` |
| `--halloween-badge-font` | The whole `font` shorthand | `13px/1.4 system-ui, sans-serif` |
| `--halloween-badge-opacity` | Opacity at rest. Hover and keyboard focus set it to 1 | `0.9` |
| `--halloween-badge-z-index` | Stacking order | One above `--halloween-page-z-index`, so the corner webs never paint over it |

The badge does not follow `--halloween-color`. It has the variables above.

```css
:root {
  --halloween-badge-color: #ff6b00;
  --halloween-badge-bg: #1a1a1a;
}
```

## The link

It points to `https://halloween.js.org/`, opens in a new tab and uses `rel="noopener nofollow"`. The element has the class `halloween-badge-link`. It is a pill with a 1px border, a 999px radius and a 6px by 14px padding, shown as a block no wider than the screen.
