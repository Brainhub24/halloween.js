# Season window

When halloween.js is active. The default 18 October to 2 November window, the start and end attributes, accepted date formats, year-wrapping ranges and the fail-open rule.

Canonical page: https://halloween.js.org/docs/options/season/

By default the library does anything only between 18 October and 2 November, every year. Outside that window it stays off, as if the `halloween` class were not on the page. This is a feature: install the script once, leave it in the page, and it switches itself on and off.

> Installed before 18 October? You will see nothing until the season starts. That is expected, not a bug, and there is nothing to hide or remove afterwards.

## Attributes

Change the window with two optional attributes on `<body>`.

```html
<body
  class="halloween halloween-eyes halloween-screen-left-top"
  data-halloween-start="18-10"
  data-halloween-end="02-11"
>
```

| Attribute | Meaning | Default |
| --- | --- | --- |
| `data-halloween-start` | First day of the season, written as `DD-MM` | `18-10` |
| `data-halloween-end` | Last day of the season, written as `DD-MM`. The whole day is included | `02-11` |

Both are optional and resolved independently. Set only the one you need to change.

## Accepted values

- The format is day, a dash, month: `18-10`, `02-11`. One digit is accepted as well, so `8-3` means 8 March.
- Dates are checked against the real calendar. `31-04` is rejected because April has 30 days.
- `29-02` is accepted in every year. In a year that is not a leap year it counts as 28 February.
- The year is never written. The window repeats every year.
- A single day is possible: use the same value for start and end.
- A window can cross the new year. `25-12` to `05-01` is active from 25 December to the end of 5 January.

## Which time is used

The check uses the current date on the visitor's device, in the visitor's own time zone. Visitors in different time zones can see the season start and end at slightly different moments.

## Precedence

Each end of the window is resolved on its own, in this order:

1. The `data-halloween-start` or `data-halloween-end` attribute on `<body>`.
2. The `?s=` or `?e=` query parameter on the script URL. See [script URL parameters](/docs/options/script-url-parameters/).
3. The library default, `18-10` and `02-11`.

An attribute that is missing, empty, or only whitespace counts as not set and the next source is used. When the attribute and the query parameter disagree, the attribute wins.

## Invalid values fail open

A value that is not empty but cannot be read, such as `abc`, `31-04` or `18/10`, does not switch the library off. If either end is invalid, the library runs as if there were no season restriction at all, so a typo can never silently disable it. If the effects are showing outside the dates you wanted, check both values for typos.

## When it is checked

The season is checked when the page loads and again whenever the body classes or either season attribute change. It is not checked continuously. A page that stays open across midnight on the first or last day keeps its old state until something touches `<body>` or you call `halloween()` (see the [JS API](/docs/api/js-api/)). Changing either attribute from your own script triggers an immediate re-check.

## Testing outside the season

To see the effects today, set a window that includes today.

```html
<body class="halloween halloween-eyes" data-halloween-start="01-01" data-halloween-end="31-12">
```

Remove the override before you publish, or the effects will run all year. The [playground](/#playground) generates the snippet with your dates.
