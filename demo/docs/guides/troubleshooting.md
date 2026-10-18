# Troubleshooting

Nothing shows up? A checklist of the usual causes with how to confirm each one, from the season window to content blockers.

Canonical page: https://halloween.js.org/docs/guides/troubleshooting/

Work through the list from the top. The first one is the cause most of the time.

## 1. It is outside the season

The default window is 18 October to 2 November. Outside it nothing shows, by design. To test, set a window that includes today with the [season attributes](/docs/options/season/), then remove the override before you publish.

## 2. The master class is missing

Open the browser console on your site and run:

```js
document.body.classList.contains("halloween")
```

It must return `true`. Without the class the library does nothing. See [master switch](/docs/options/master-switch/).

## 3. The script is not loaded

In the network panel look for `halloween.iife.js` and check it loaded with status 200. A content blocker, an ad blocker or a Content Security Policy can stop a script from a CDN. Also check that you are looking at the live site and not at an editor preview, because many site builders do not run custom code in the editor.

## 4. Reduced motion is on

If your system asks for reduced motion, the ambient effects are not created. Only the screen-corner webs and the badge appear. Check your operating system setting. See [accessibility](/docs/guides/accessibility/).

## 5. The date values are wrong

Wrong date values do not turn the library off. They make it run all the time, because malformed values fail open. If effects appear on the wrong days, check every `data-halloween-start`, `data-halloween-end`, `?s=` and `?e=` value for the `DD-MM` format.

## 6. You see a cached page

Reload without cache, or open the site in a private window. Check that the snippet is on the live page and not only in a draft.

## 7. The effects are hidden behind something

The effects layer is at `z-index: 999`. A fixed header or a modal with a higher z-index covers it. Raise `--halloween-page-z-index` to move the effects above it, or lower it to move them below.

## 8. The styles are blocked

The library adds a `<style>` element with the id `halloween-styles`. A strict Content Security Policy that forbids inline styles blocks style elements added by scripts, unless it allows them with a nonce or `'unsafe-inline'`. If the element is missing from `<head>`, check the console for policy errors.

## 9. A different version loads

Pin an exact version in the script URL. See [installation](/docs/getting-started/installation/).

## Still stuck

Open an issue on [GitHub](https://github.com/rogulia/halloween.js/issues/new/choose) with the page URL, the classes on `<body>` and what the console says.
