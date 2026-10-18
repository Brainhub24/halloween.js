# Quick start

Switch halloween.js on with body classes. A minimal example, a full example and a paste-anywhere snippet for site builders.

Canonical page: https://halloween.js.org/docs/getting-started/quick-start/

halloween.js is controlled by CSS classes on `<body>`. There is no configuration object and nothing to call. The library watches `<body>` and reacts whenever its classes change.

## The minimal setup

Load the library, then add the master class and at least one effect.

```html
<script src="https://cdn.jsdelivr.net/npm/halloween.js@1.0.3/dist/halloween.iife.js"></script>

<body class="halloween halloween-screen-left-top halloween-eyes">
  ...
</body>
```

This shows a spider web in the top-left corner and blinking eyes at random spots, from 18 October to 2 November. On every other day the page looks unchanged.

## What each part does

- `halloween` is the [master switch](/docs/options/master-switch/). Without it nothing runs.
- `halloween-screen-left-top` adds a web to a [screen corner](/docs/options/screen-corners/).
- `halloween-eyes` starts an [ambient effect](/docs/options/effects/).
- The [season window](/docs/options/season/) decides on which days all of this is active.

## A full example

Four effects, two corners, a calmer intensity, the season written out and a custom color.

```html
<body
  class="halloween halloween-eyes halloween-witches halloween-spider-drop halloween-tombstones halloween-screen-left-top halloween-screen-right-bottom halloween-intensity-subtle"
  data-halloween-start="18-10"
  data-halloween-end="02-11"
  style="--halloween-color: #ff6b00"
>
```

Every option is described on its own page: [intensity](/docs/options/intensity/), [color](/docs/options/color/), [size and opacity](/docs/options/size-and-opacity/) and the optional [badge](/docs/options/badge/).

## When you cannot edit the body tag

Site builders and CMSs often hide the `<body>` tag. This snippet loads the library and adds the classes from a script, so it works whether it is pasted in the head, in the footer or injected later by a tag manager. It adds to the existing body classes instead of replacing them.

```html
<script src="https://cdn.jsdelivr.net/npm/halloween.js@1.0.3/dist/halloween.iife.js"></script>
<script>
(function () {
  function apply() {
    document.body.classList.add(
       "halloween",
       "halloween-screen-left-top",
       "halloween-screen-right-bottom",
       "halloween-eyes",
       "halloween-witches",
       "halloween-spider-drop",
       "halloween-tombstones"
    );
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
</script>
```

Step-by-step guides with the exact menu path for each builder are in [platforms](/platforms/). To build the classes for your own setup, use the [playground](/#playground).

## Turn effects on and off from code

Because the library re-syncs whenever the body classes change, toggling a class is enough. This works in single-page apps and in any framework.

```js
document.body.classList.toggle("halloween-eyes", someCondition);
```

Removing a class clears the matching effect from the screen immediately. It does not wait for the effect to finish fading out.
