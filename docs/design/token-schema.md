# Design Token Audit & Target Schema

Two things live here:

1. **The audit** — defects and gaps in the current token layer in
   [`src/assets/styles/_variables.css`](../../src/assets/styles/_variables.css).
2. **The target schema** — the contract every theme proposal in
   [`docs/themes/`](../themes/README.md) fills in. Because all six proposals fill the same
   schema, diffing any two of them shows only value changes.

Nothing here has been applied to `src/`. This is specification only.

## Current state

Theming is entirely CSS-custom-property driven. `_variables.css` defines two blocks:

- `:root` — dark theme (the default)
- `.light-theme` — light theme

[`ThemeToggle.vue`](../../src/components/ThemeToggle.vue) toggles the `light-theme` class on
`document.documentElement` and persists the choice to `localStorage['theme']`. Twelve
component stylesheets under `src/assets/styles/` consume the tokens across ~297 `var()` calls.

**Consequence: shipping one chosen theme family requires no architectural change** — it is a
replacement of the two token blocks. A theme _switcher_ (more than one family available at
runtime) would be a separate change and is out of scope.

## Audit findings

### A. Tokens referenced but never defined

Ten tokens are used in component CSS but declared in neither `:root` nor `.light-theme`. Each
currently resolves to nothing, silently falling back to the property's initial value.

| Token                       | Used in                              | Current effect                               |
| --------------------------- | ------------------------------------ | -------------------------------------------- |
| `--hover-bg`                | `data-card.css`                      | Card action buttons have no hover background |
| `--card-bg`                 | `data-card.css`, `list-form.css`     | Modal and form panels are transparent        |
| `--input-bg`                | `list-form.css`                      | Text inputs have no background fill          |
| `--primary-transparent-15`  | `data-display.css`, `pagination.css` | Transparent instead of tinted                |
| `--card-bg-transparent-30`  | `data-display.css`                   | Transparent                                  |
| `--success-text`            | `data-display.css`                   | Falls back to inherited colour               |
| `--error-text`              | `data-display.css`                   | Falls back to inherited colour               |
| `--error-bg-transparent-10` | `data-display.css`                   | Transparent                                  |
| `--error-hover-color`       | `data-card.css`                      | Destructive button has no hover state        |
| `--button-text-color`       | `list-form.css`                      | Has a `white` fallback, so masked            |

### B. Transparent variants do not match their base colour

The `*-transparent-*` tokens were not updated when the base colours changed. They currently
tint with a completely different hue.

| Mode  | Base token          | Base value             | Transparent variant   | Variant hue    |
| ----- | ------------------- | ---------------------- | --------------------- | -------------- |
| Dark  | `--primary-color`   | `#a0d6ff` (light blue) | `rgba(255,158,100,…)` | Orange         |
| Light | `--primary-color`   | `#1185e0` (blue)       | `rgba(211,100,255,…)` | Purple         |
| Light | `--secondary-color` | `#ff7700` (orange)     | `rgba(92,204,150,…)`  | Green          |
| Light | `--accent-color`    | `#7c5cff` (violet)     | `rgba(187,154,247,…)` | Lighter violet |

This is why hover and focus states across the app tint toward colours that appear nowhere
else. **Every proposal derives its transparent variants from its own base colour**, which
fixes this as a side effect.

### C. Mode-asymmetric tokens

Defined in one mode only, so the other mode falls through to nothing:

- `--success-bg`, `--error-bg` — light only
- `--secondary-transparent-50` — dark only
- `--card-shadow` — used by `--shadow` in `:root` but only _defined_ later in the light block
  and in `:root` after first use

### D. Missing scales

No tokens exist for spacing, radius beyond a single value, typography, or motion timing.
Values are hard-coded per file — `0.75rem`, `1rem`, `16px`, `20px`, `5px`, `8px` all appear as
literals. `--border-radius: 10px` is defined once and then overridden to `0` in at least four
places, meaning the token no longer describes reality.

### E. Global monospace

`app.css` sets `body { font-family: var(--font-mono), … }` and `--font-mono` is
`'Courier New', Courier, monospace`. Only one font token exists. See
[city-pop-aesthetics.md](city-pop-aesthetics.md#applying-this-to-bluelist-specifically) for
why this is being changed.

### F. Insufficient border contrast

No current border colour reaches 3:1 against its background. That is acceptable for decorative
separators but **not** for borders that are the only visual indicator of a form control
(WCAG 2.1 SC 1.4.11 Non-text Contrast). The schema therefore splits borders into two tokens.

## Target schema

Every theme proposal defines all of the following. Tokens marked **new** do not exist today.

### Colour — surfaces

| Token                | Role                                                   | Requirement          |
| -------------------- | ------------------------------------------------------ | -------------------- |
| `--background-color` | Page background                                        | —                    |
| `--card-color`       | Card / panel surface                                   | —                    |
| `--card-bg`          | **new** alias of `--card-color`, for legacy call sites | —                    |
| `--surface-raised`   | **new** Modals, dropdowns, elevated panels             | —                    |
| `--input-bg`         | **new** Form field fill                                | —                    |
| `--hover-bg`         | **new** Neutral hover wash                             | —                    |
| `--border-color`     | Decorative separators, card outlines                   | —                    |
| `--border-strong`    | **new** Form-control borders                           | ≥ 3:1 vs. background |
| `--border-style`     | Composed: `1px solid var(--border-color)`              | —                    |

### Colour — content

| Token                 | Role                                   | Requirement                               |
| --------------------- | -------------------------------------- | ----------------------------------------- |
| `--text-color`        | Body copy                              | ≥ 4.5:1 vs. background _and_ card         |
| `--text-light`        | Secondary copy, metadata               | ≥ 4.5:1 vs. background _and_ card         |
| `--text-disabled`     | Inactive text                          | ≥ 3:1 (exempt under SC 1.4.3, met anyway) |
| `--button-text-color` | **new** Text on filled primary buttons | ≥ 4.5:1 vs. `--primary-color`             |

### Colour — brand roles

Per [characteristic 3](city-pop-aesthetics.md#3-high-chroma-tropical-accents-on-a-cool-base):

| Token               | Role                          | Requirement                       |
| ------------------- | ----------------------------- | --------------------------------- |
| `--primary-color`   | Interactive / cool            | ≥ 4.5:1 vs. background _and_ card |
| `--primary-dark`    | Pressed and hover fills       | ≥ 4.5:1 vs. background _and_ card |
| `--secondary-color` | Warm counterpoint, emphasis   | ≥ 4.5:1 vs. background _and_ card |
| `--accent-color`    | Rare high-attention highlight | ≥ 4.5:1 vs. background _and_ card |

### Colour — status

`--success-color`, `--success-bg`, `--success-text`, `--error-color`, `--error-bg`,
`--error-text`, `--error-hover-color`, `--disabled-color`. Both modes must define all of them.
`--success-text` and `--error-text` require ≥ 4.5:1 against their paired `*-bg`.

### Colour — alpha variants

Derived from their own base, never from another hue:

`--primary-transparent-10 / -15 / -20 / -30`, `--secondary-transparent-10 / -50`,
`--accent-transparent-10 / -50`, `--card-bg-transparent-30 / -50 / -80`,
`--text-light-transparent-20 / -30`, `--error-bg-transparent-10`, `--card-shadow`,
`--spinner-bg`.

### Typography — **new**

`--font-display`, `--font-body`, `--font-mono`; `--text-xs` … `--text-3xl`;
`--leading-tight / -normal / -relaxed`; `--tracking-tight / -normal / -wide / -wider`;
`--weight-normal / -medium / -bold`.

Mono is retained for **data only**: handles, DIDs, counts, URIs, timestamps.

### Spacing and layout — **new**

`--space-1` … `--space-8` on a consistent base unit, plus `--content-max-width`,
`--page-gutter`, `--card-padding`, `--section-gap`.

### Shape, elevation, motion — **new**

`--radius-sm`, `--radius-md`, `--border-radius` (retained alias); `--shadow-sm`,
`--shadow-md`, `--shadow-lg`, `--shadow` (retained alias), `--focus-ring`;
`--duration-fast`, `--duration-base`, `--ease`, `--transition` (retained alias).

### Decoration — **new, opt-in**

`--decor-gradient`, `--decor-sheen`, `--decor-glow`, `--decor-overlay`.

All decorative rules are scoped to `[data-decor='on']` on `<html>` and default to off, per
[characteristic 8](city-pop-aesthetics.md#8-analog-nostalgia-layer).

## Verification method

Contrast figures quoted in the proposals were computed with the WCAG 2.1 relative-luminance
formula against each theme's own `--background-color` and `--card-color`, and the reported
ratio is the **lower** of the two. All six palettes pass the requirements in this schema —
several values were darkened or lightened during authoring specifically to clear the
thresholds, notably every `--border-strong` and all four light-mode `--text-disabled` values.
