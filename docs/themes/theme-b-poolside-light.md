# Theme B — Poolside プールサイド · Light

> **Mood:** Hiroshi Nagai's pool at noon. Pale sky, white concrete, deep water, a coral
> parasol. Bright, clean, spacious.

|           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family    | B — Poolside (プールサイド)                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Mode      | Light                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Intensity | **Balanced** — the default recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Lineage   | Nagai / Ohtaki / resort AOR — the daytime lineage at full noon                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Leans on  | [#1 gradient skies](../design/city-pop-aesthetics.md#1-gradient-skies-and-time-of-day-light), [#2 flat geometry](../design/city-pop-aesthetics.md#2-flat-hard-edged-geometry), [#3 tropical accents](../design/city-pop-aesthetics.md#3-high-chroma-tropical-accents-on-a-cool-base), [#4 chrome & water](../design/city-pop-aesthetics.md#4-chrome-glass-and-water-reflection), [#7 negative space](../design/city-pop-aesthetics.md#7-album-cover-composition-and-negative-space) |
| Avoids    | Scanlines, glitch, neon glow                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Typography

Identical to the dark variant — typography does not change between modes.

| Element                            | Value                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Display / headings                 | `Outfit` — geometric sans, Latin                                           |
| Body                               | `Inter`                                                                    |
| Data (handles, DIDs, counts, URIs) | `IBM Plex Mono`                                                            |
| Fallback stack                     | `system-ui, sans-serif` throughout                                         |
| Weights loaded                     | Outfit 500/700 · Inter 400/500/600 · Plex Mono 400                         |
| Delivery                           | `@nuxt/fonts` — self-hosted, subset, `font-display: swap`                  |
| Base size                          | `16px`                                                                     |
| Scale ratio                        | **1.250** (major third)                                                    |
| `--text-3xl`                       | `2.441rem` / 39px                                                          |
| `--text-2xl`                       | `1.953rem` / 31.2px                                                        |
| `--text-xl`                        | `1.563rem` / 25px                                                          |
| `--text-lg`                        | `1.250rem` / 20px                                                          |
| `--text-base`                      | `1rem` / 16px                                                              |
| `--text-sm`                        | `0.800rem` / 12.8px                                                        |
| `--text-xs`                        | `0.640rem` / 10.2px                                                        |
| Line height                        | Headings `1.2` · body `1.6`                                                |
| Tracking                           | Display `0.06em` · body `0`                                                |
| Casing                             | Display headings `uppercase` at `--text-lg` and below; sentence case above |

## Colour

Ratios measured against `--background-color` and `--card-color`; the lower is shown.

### Surfaces

The card is pure white against a tinted sky-blue page — the "white concrete beside blue water"
relationship, and it makes cards read as objects sitting on the page rather than holes in it.

| Token                        | Value                  | Role                         | Contrast | Verdict    |
| ---------------------------- | ---------------------- | ---------------------------- | -------- | ---------- |
| `--background-color`         | `#EAF6FA`              | Page — pale sky              | —        | —          |
| `--card-color` / `--card-bg` | `#FFFFFF`              | Card, panel — white concrete | —        | —          |
| `--surface-raised`           | `#FFFFFF`              | Modal, dropdown              | —        | —          |
| `--input-bg`                 | `#FFFFFF`              | Field fill                   | —        | —          |
| `--hover-bg`                 | `rgba(0,112,127,0.06)` | Neutral hover wash           | —        | —          |
| `--border-color`             | `#C3DEE9`              | Decorative separators        | 1.28     | decorative |
| `--border-strong`            | `#6B8998`              | Form-control borders         | **3.37** | ✅ AA      |

### Content

| Token                 | Value     | Role                 | Contrast  | Verdict |
| --------------------- | --------- | -------------------- | --------- | ------- |
| `--text-color`        | `#0F2233` | Body — deep navy ink | **14.70** | ✅ AA   |
| `--text-light`        | `#4E6B7D` | Metadata, handles    | **5.12**  | ✅ AA   |
| `--text-disabled`     | `#6F8B9A` | Inactive             | **3.27**  | ✅ (≥3) |
| `--button-text-color` | `#FFFFFF` | On deep-aqua fill    | **5.79**  | ✅ AA   |

### Brand roles

The dark variant's bright aqua `#45D0E0` is unusable as text on a light page (≈1.7:1), so
light mode inverts the relationship: the aqua goes deep and saturated, and the _background_
carries the pale sky tone instead.

| Token               | Value     | Role                         | Contrast | Verdict |
| ------------------- | --------- | ---------------------------- | -------- | ------- |
| `--primary-color`   | `#00707F` | Deep pool aqua — interactive | **5.26** | ✅ AA   |
| `--primary-dark`    | `#005560` | Pressed / hover fill         | **7.72** | ✅ AA   |
| `--secondary-color` | `#C2410C` | Coral sunset — counterpoint  | **4.70** | ✅ AA   |
| `--accent-color`    | `#8A5406` | Sun ochre — rare highlight   | **5.69** | ✅ AA   |

### Status

| Token                                | Value     | Contrast | Verdict   |
| ------------------------------------ | --------- | -------- | --------- |
| `--success-color` / `--success-text` | `#12694F` | **6.03** | ✅ AA     |
| `--success-bg`                       | `#E2F1EC` | —        | —         |
| `--error-color` / `--error-text`     | `#B02020` | **6.20** | ✅ AA     |
| `--error-bg`                         | `#FBE6E6` | —        | —         |
| `--error-hover-color`                | `#8C1818` | —        | fill only |
| `--disabled-color`                   | `#D8E7EE` | —        | —         |

### Alpha variants

| Token                                        | Value                                    |
| -------------------------------------------- | ---------------------------------------- |
| `--primary-transparent-10 / -15 / -20 / -30` | `rgba(0,112,127, .10 / .15 / .20 / .30)` |
| `--secondary-transparent-10 / -50`           | `rgba(194,65,12, .10 / .50)`             |
| `--accent-transparent-10 / -50`              | `rgba(138,84,6, .10 / .50)`              |
| `--card-bg-transparent-30 / -50 / -80`       | `rgba(255,255,255, .30 / .50 / .80)`     |
| `--text-light-transparent-20 / -30`          | `rgba(78,107,125, .20 / .30)`            |
| `--error-bg-transparent-10`                  | `rgba(176,32,32,0.10)`                   |
| `--card-shadow`                              | `rgba(15,34,51,0.10)`                    |
| `--spinner-bg`                               | `rgba(78,107,125,0.15)`                  |

## Buttons

| Variant     | Fill                                  | Border                | Text              | Radius | Padding     | Hover                                  | Active            | Focus                  |
| ----------- | ------------------------------------- | --------------------- | ----------------- | ------ | ----------- | -------------------------------------- | ----------------- | ---------------------- |
| Primary     | `--primary-color` (+ `--decor-sheen`) | none                  | `#FFFFFF`         | `4px`  | `11px 20px` | fill → `--primary-dark`                | `translateY(1px)` | `0 0 0 3px` @ 30% aqua |
| Secondary   | `--primary-transparent-10`            | `1px --primary-color` | `--primary-color` | `4px`  | `11px 20px` | fill → 20%                             | `translateY(1px)` | same                   |
| Ghost       | transparent                           | `1px --border-strong` | `--text-color`    | `4px`  | `11px 20px` | fill → `--hover-bg`                    | `translateY(1px)` | same                   |
| Destructive | `--error-color`                       | none                  | `#FFFFFF`         | `4px`  | `11px 20px` | fill → `--error-hover-color`           | `translateY(1px)` | `0 0 0 3px` @ 30% red  |
| Disabled    | `--disabled-color`                    | none                  | `--text-disabled` | `4px`  | `11px 20px` | none                                   | none              | none                   |
| Icon-only   | transparent                           | none                  | `--text-light`    | `4px`  | `7px`       | `--hover-bg`, text → `--primary-color` | —                 | same                   |

## Spacing & layout

Identical to the dark variant.

| Token                     | Value                                               |
| ------------------------- | --------------------------------------------------- |
| Base unit                 | `4px`                                               |
| `--space-1` … `--space-8` | `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64px`             |
| `--card-padding`          | `--space-5` (24px)                                  |
| `--section-gap`           | `--space-6` (32px)                                  |
| `--page-gutter`           | `--space-6` (32px), `--space-4` (16px) below 1100px |
| `--content-max-width`     | `1200px`                                            |
| Card list gap             | `--space-4` (16px)                                  |
| Breakpoints               | `1100px`, `720px`                                   |

## Blocks & surfaces

| Block            | Background                                    | Border                      | Radius | Shadow        | Accent rule                    | Hover                                   |
| ---------------- | --------------------------------------------- | --------------------------- | ------ | ------------- | ------------------------------ | --------------------------------------- |
| Page             | `--background-color` (+ `--decor-gradient`)   | —                           | —      | —             | —                              | —                                       |
| `DataCard`       | `--card-color`                                | `1px --border-color`        | `4px`  | `--shadow-sm` | 2px top bar, `--primary-color` | lift `-2px` + `--shadow-md`             |
| `MemberCard`     | `--card-color`                                | `1px --border-color`        | `4px`  | none          | none                           | `--hover-bg`                            |
| Modal            | `--surface-raised`                            | `1px --border-strong`       | `4px`  | `--shadow-lg` | none                           | —                                       |
| `AppHeader`      | `--card-color` (+ sky gradient when decor on) | bottom `1px --border-color` | —      | `--shadow-sm` | none                           | —                                       |
| `ListChips` chip | `--primary-transparent-10`                    | `1px --primary-color`       | `4px`  | none          | none                           | fill → 20%                              |
| `Pagination`     | transparent                                   | top `1px --border-color`    | —      | none          | none                           | —                                       |
| Form input       | `--input-bg`                                  | `1px --border-strong`       | `4px`  | none          | none                           | border → `--primary-color` + focus ring |
| `LoginForm`      | `--card-color`                                | `1px --border-color`        | `4px`  | `--shadow-lg` | 4px top bar, `--primary-color` | —                                       |
| Empty state      | transparent                                   | `1px dashed --border-color` | `4px`  | none          | none                           | —                                       |
| Loading overlay  | `--card-bg-transparent-80`                    | —                           | —      | —             | —                              | —                                       |

## Motion

Identical to the dark variant.

| Token             | Value                                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| `--duration-fast` | `140ms`                                                                    |
| `--duration-base` | `200ms`                                                                    |
| `--ease`          | `cubic-bezier(0.2, 0.8, 0.2, 1)`                                           |
| `--transition`    | `all var(--duration-base) var(--ease)`                                     |
| Hover             | `translateY(-2px)` + shadow step on cards                                  |
| Press             | `translateY(1px)`                                                          |
| Reduced motion    | `@media (prefers-reduced-motion: reduce)` → durations `0ms`, no transforms |

## Decorative layer

Opt-in behind `[data-decor='on']` on `<html>`. Off by default.

| Effect            | Token              | CSS                                                                              | Default |
| ----------------- | ------------------ | -------------------------------------------------------------------------------- | ------- |
| Noon sky gradient | `--decor-gradient` | `linear-gradient(180deg, #D6EEF7 0%, #EAF6FA 45%, #F7FCFD 100%)` fixed on `body` | off     |
| Header sky wash   | `--decor-gradient` | Same gradient, `background-attachment: fixed` on `.app__header`                  | off     |
| Button sheen      | `--decor-sheen`    | `linear-gradient(180deg, rgba(255,255,255,.22) 0%, transparent 45%)` overlay     | off     |
| Horizon rule      | —                  | 1px `--secondary-color` full-bleed rule between page sections                    | off     |
| Glow / scanlines  | —                  | _not used by this theme_                                                         | —       |

## Token map

Paste into `.light-theme` in `src/assets/styles/_variables.css`.

```css
.light-theme {
  /* surfaces */
  --background-color: #eaf6fa;
  --card-color: #ffffff;
  --card-bg: var(--card-color);
  --surface-raised: #ffffff;
  --input-bg: #ffffff;
  --hover-bg: rgba(0, 112, 127, 0.06);
  --border-color: #c3dee9;
  --border-strong: #6b8998;
  --border-style: 1px solid var(--border-color);

  /* content */
  --text-color: #0f2233;
  --text-light: #4e6b7d;
  --text-disabled: #6f8b9a;
  --button-text-color: #ffffff;

  /* brand */
  --primary-color: #00707f;
  --primary-dark: #005560;
  --secondary-color: #c2410c;
  --accent-color: #8a5406;

  /* status */
  --success-color: #12694f;
  --success-text: #12694f;
  --success-bg: #e2f1ec;
  --error-color: #b02020;
  --error-text: #b02020;
  --error-bg: #fbe6e6;
  --error-hover-color: #8c1818;
  --disabled-color: #d8e7ee;

  /* alpha */
  --primary-transparent-10: rgba(0, 112, 127, 0.1);
  --primary-transparent-15: rgba(0, 112, 127, 0.15);
  --primary-transparent-20: rgba(0, 112, 127, 0.2);
  --primary-transparent-30: rgba(0, 112, 127, 0.3);
  --secondary-transparent-10: rgba(194, 65, 12, 0.1);
  --secondary-transparent-50: rgba(194, 65, 12, 0.5);
  --accent-transparent-10: rgba(138, 84, 6, 0.1);
  --accent-transparent-50: rgba(138, 84, 6, 0.5);
  --card-bg-transparent-30: rgba(255, 255, 255, 0.3);
  --card-bg-transparent-50: rgba(255, 255, 255, 0.5);
  --card-bg-transparent-80: rgba(255, 255, 255, 0.8);
  --text-light-transparent-20: rgba(78, 107, 125, 0.2);
  --text-light-transparent-30: rgba(78, 107, 125, 0.3);
  --error-bg-transparent-10: rgba(176, 32, 32, 0.1);
  --card-shadow: rgba(15, 34, 51, 0.1);
  --spinner-bg: rgba(78, 107, 125, 0.15);

  /* shape & elevation */
  --shadow-sm: 0 1px 2px var(--card-shadow);
  --shadow-md: 0 4px 12px var(--card-shadow);
  --shadow-lg: 0 12px 32px var(--card-shadow);
  --shadow: var(--shadow-md);
  --focus-ring: 0 0 0 3px var(--primary-transparent-30);

  /* decoration (opt-in) */
  --decor-gradient: linear-gradient(
    180deg,
    #d6eef7 0%,
    #eaf6fa 45%,
    #f7fcfd 100%
  );
  --decor-sheen: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.22) 0%,
    transparent 45%
  );
}
```

Font, type-scale, spacing, radius and motion tokens are inherited from `:root` — they are
mode-independent and are not redeclared here.

## Preview

```
┌────────────────────────────────────────────────┐
│▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ ← 2px #00707F

│  D E S I G N   F O L K S                        │ ← Outfit 700 20px, +0.06em
│                                                 │
│  42 members · updated 3d ago                    │ ← Plex Mono 12.8px #4E6B7D
│                                                 │
│  ╭───────────╮  ╭───────────╮                   │
│  │   View    │  │  Curate   │                   │ ← aqua fill / aqua outline
│  ╰───────────╯  ╰───────────╯                   │
└────────────────────────────────────────────────┘
   card #FFFFFF on page #EAF6FA, 1px #C3DEE9, r4
```

Swatches — `#EAF6FA` `#FFFFFF` `#C3DEE9` `#6B8998` `#4E6B7D` `#0F2233` · `#00707F` `#005560`
`#C2410C` `#8A5406` · `#12694F` `#B02020`

## Migration notes

Beyond swapping the token block:

- `app.css` — `body` must move from `--font-mono` to `--font-body`; add font preloads. With
  decoration on, `body` needs `background-image: var(--decor-gradient)` and
  `background-attachment: fixed`.
- `app-header.css` — gains an optional gradient layer over `--card-color`.
- `data-card.css` — `--card-bg` and `--hover-bg` now resolve, so the modal and card action
  hover states render for the first time.
- `list-form.css` — `--input-bg` now resolves; white fields against the tinted page.
- `action-buttons.css` — `.action-button` hard-codes `border-radius: 0`; switch to
  `var(--radius-sm)`. Sheen is an extra `::after`, gated on `[data-decor='on']`.
- **Watch out:** this theme's card is pure white while the page is tinted. Any component
  currently assuming `--card-color` and `--background-color` are near-identical (the old light
  theme had `#ffffff` on `#f7f7f8`) will now show a visible edge — that is intended.
- **No component markup changes required.**
