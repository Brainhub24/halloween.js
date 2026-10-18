---
title: Intensity
description: The subtle and party intensity classes. How they change spawn rate, simultaneous effects, size and opacity, with the exact values.
section: options
order: 4
---

The intensity classes change how busy the page feels. They scale how often effects appear, how many can be on screen at once, how large they are and how opaque the whole layer is.

```html
<body class="halloween halloween-witches halloween-intensity-subtle">
<body class="halloween halloween-eyes halloween-spider-drop halloween-intensity-party">
```

## Values

| Class | Wait between appearances | At once per effect | Size | Layer opacity |
| --- | --- | --- | --- | --- |
| `halloween-intensity-subtle` | 2.5 times longer | 1 | About 75 percent | 0.65 |
| no class (normal, the default) | As listed on [effects](/docs/options/effects/) | 1 | 100 percent | 1 |
| `halloween-intensity-party` | 2 times shorter | 2 | About 115 percent | 1 |

There is no `halloween-intensity-normal` class. Normal simply means that no intensity class is present.

Use only one at a time. If both are on `<body>`, `halloween-intensity-party` wins.

## Exact sizes

Sizes in pixels, width by height.

| Element | Subtle | Normal | Party |
| --- | --- | --- | --- |
| Eyes | 48 by 20 | 64 by 26 | 72 by 30 |
| Witch | 78 by 98 | 104 by 130 | 120 by 150 |
| Spider drop | 68 by 68 | 90 by 90 | 104 by 104 |
| Tombstone | 58 by 73 | 76 by 96 | 88 by 112 |
| Screen corner | 90 | 120 | 140 |

## How changes are applied

- Sizes and opacity change immediately on the elements already on screen, because they are plain CSS.
- Timing changes apply from the next scheduled appearance. A timer that is already waiting is not restarted.
- The preset only supplies defaults. A size or opacity that you set with the [public CSS variables](/docs/options/size-and-opacity/) always wins, whichever intensity is active.
