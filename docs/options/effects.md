---
title: Ambient effects
description: The four ambient effects (eyes, witches, spider-drop, tombstones). The class for each, how it behaves, how often it appears and what limits it.
section: options
order: 2
---

Ambient effects are decorations that appear at random places, stay for a few seconds and go away again. Each one is a separate class on `<body>`, used together with the [master switch](/docs/options/master-switch/).

```html
<body class="halloween halloween-eyes halloween-witches halloween-spider-drop halloween-tombstones">
```

## The four effects

| Class | What you see |
| --- | --- |
| `halloween-eyes` | A pair of amber eyes fades in at a random spot, blinks, and fades out. |
| `halloween-witches` | A witch silhouette flies across the screen at a random angle and direction. |
| `halloween-spider-drop` | A spider lowers itself on a thread from the top of the screen, hangs, and climbs back up. |
| `halloween-tombstones` | A tombstone rises out of the bottom of the screen, holds, and sinks back down. |

Use any combination. Effects that are not listed are not started, and removing a class clears that effect from the screen at once.

## How each effect behaves

| Effect | Where it appears | How long it lasts | Wait between appearances |
| --- | --- | --- | --- |
| Eyes | Random spot, 5 to 90 percent from the left and 10 to 80 percent from the top | Visible for 2.4 to 4 seconds, plus a 0.7 second fade each way | 5 seconds |
| Witches | Enters at the left or the right edge, at a height of 5 to 40 percent from the top | Crosses the screen in 7 to 12 seconds, tilted up to 30 degrees either way, growing and shrinking as it flies | 6 to 14 seconds |
| Spider drop | Random horizontal position, 2 to 94 percent from the left | Drops in 1.8 to 3 seconds to 75 percent of the viewport height, hangs 1.2 to 2.8 seconds, climbs back in 1.4 to 2.4 seconds | 4 to 9 seconds |
| Tombstones | Random horizontal position, 4 to 88 percent from the left | Rises 80 to 120 pixels in 1.2 to 1.8 seconds, holds 2 to 3 seconds, sinks in 1.2 to 1.8 seconds. Slightly tilted and scaled each time | 8 to 16 seconds |

The first appearance happens right after the effect starts. These timings, positions and ranges are fixed inside the library. They are not options. What you can change is how often effects appear and how large they are: see [intensity](/docs/options/intensity/) and [size and opacity](/docs/options/size-and-opacity/).

## How many appear at once

By default at most one instance of each effect is on screen at a time. The `halloween-intensity-party` class raises that to two. Effects are independent of each other, so with all four on you can see up to four decorations together.

## Background tabs

While the browser tab is in the background no new effects are created. The timers keep running and the next scheduled attempt after the tab becomes visible again creates one. Effects do not pile up while you are away.

## Colors

The witch, the spider with its thread and the tombstone take their color from `--halloween-color`, which defaults to the surrounding text color. The eyes keep their own fixed amber and ignore it. See [color](/docs/options/color/).

## Reduced motion

When the visitor has asked their system for reduced motion, ambient effects do not start, and any that are on screen are removed immediately. See [accessibility](/docs/guides/accessibility/).
