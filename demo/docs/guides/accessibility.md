# Accessibility

How halloween.js handles reduced motion, assistive technology and pointer events, and what to do about contrast and layering.

Canonical page: https://halloween.js.org/docs/guides/accessibility/

## Reduced motion

Every animation respects the visitor's `prefers-reduced-motion: reduce` setting, and picks up changes while the page stays open. No reload is needed.

| Element | With reduced motion on |
| --- | --- |
| Eyes, witches, spider drop, tombstones | Not created. Any already on screen are removed at once. |
| Screen-corner webs | Unchanged. They do not move. |
| Badge | Unchanged |
| `pageEffects.start()` | Does nothing |

## Assistive technology

The effects layer and every decorative picture are marked `aria-hidden`, so screen readers skip them. The layer ignores pointer events, so it never blocks a click, a tap or text selection on your page. The only focusable thing the library can add is the optional [badge](/docs/options/badge/), which is a normal link.

## Contrast and layering

- The decorations take the text color of your page by default, which keeps them visible on both light and dark themes. If you override [the color](/docs/options/color/), check it against both.
- The effects layer sits at `z-index: 999`. Lower `--halloween-page-z-index` if it has to stay under a cookie banner or a modal.
- Lower `--halloween-page-opacity`, or use `halloween-intensity-subtle`, if the effects compete with content.
