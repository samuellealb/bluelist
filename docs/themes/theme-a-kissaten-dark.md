# Theme A — Kissaten 喫茶店 · Dark

> **Mood:** a 1970s Tokyo coffee shop at night. Warm charcoal, amber lamplight, muted teal.
> Quiet, literary, unhurried.

|           |                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family    | A — Kissaten (喫茶店, "coffee house")                                                                                                                                                                                                                                                                                                                                        |
| Mode      | Dark                                                                                                                                                                                                                                                                                                                                                                         |
| Intensity | **Restrained / editorial** — lowest risk of the three                                                                                                                                                                                                                                                                                                                        |
| Lineage   | Showa retro (昭和レトロ) — vinyl liner notes, 1970s Japanese print                                                                                                                                                                                                                                                                                                           |
| Leans on  | [#2 flat geometry](../design/city-pop-aesthetics.md#2-flat-hard-edged-geometry), [#5 bilingual type](../design/city-pop-aesthetics.md#5-bilingual-typographic-pairing), [#6 horizon rules](../design/city-pop-aesthetics.md#6-horizon-lines-rules-and-perspective-grids), [#7 negative space](../design/city-pop-aesthetics.md#7-album-cover-composition-and-negative-space) |
| Avoids    | Gradients, glow, chrome, scanlines                                                                                                                                                                                                                                                                                                                                           |

## Typography

Mincho serif for headings is the strongest Showa-retro signal available and costs nothing in
legibility, because it is confined to headings.

| Element                            | Value                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Display / headings                 | `Shippori Mincho B1` — serif, covers Latin + kana                      |
| Body                               | `Inter`                                                                |
| Data (handles, DIDs, counts, URIs) | `IBM Plex Mono`                                                        |
| Fallback stack                     | `Georgia, serif` / `system-ui, sans-serif` / `ui-monospace, monospace` |
| Weights loaded                     | Mincho 400/600 · Inter 400/500/600 · Plex Mono 400                     |
| Delivery                           | Self-hosted WOFF2, `font-display: swap`, subset to Latin + kana used   |
| Base size                          | `16px`                                                                 |
| Scale ratio                        | **1.200** (minor third) — gentle, editorial                            |
| `--text-3xl`                       | `2.074rem` / 33px — page title                                         |
| `--text-2xl`                       | `1.728rem` / 27.6px — h2                                               |
| `--text-xl`                        | `1.440rem` / 23px — h3                                                 |
| `--text-lg`                        | `1.200rem` / 19.2px — h4, card title                                   |
| `--text-base`                      | `1rem` / 16px — body                                                   |
| `--text-sm`                        | `0.833rem` / 13.3px — metadata                                         |
| `--text-xs`                        | `0.694rem` / 11.1px — kana micro-labels                                |
| Line height                        | Headings `1.25` · body `1.7` (generous, print-like)                    |
| Tracking                           | Display `0.02em` · body `0` · kana label `0.24em`                      |
| Casing                             | No uppercase transforms; mincho reads poorly in caps                   |

**Kana micro-labels.** Section headers may carry a small kana label above the Latin heading,
at `--text-xs` / `--tracking-wider` / `--text-light`. Decorative only — never functional text.

## Colour

Ratios are measured against `--background-color` and `--card-color`; the lower is shown.
Target is ≥ 4.5:1 for text and brand roles, ≥ 3:1 for disabled text and control borders.

### Surfaces

| Token                        | Value                   | Role                   | Contrast | Verdict    |
| ---------------------------- | ----------------------- | ---------------------- | -------- | ---------- |
| `--background-color`         | `#15120E`               | Page — warm near-black | —        | —          |
| `--card-color` / `--card-bg` | `#1E1A15`               | Card, panel            | —        | —          |
| `--surface-raised`           | `#262019`               | Modal, dropdown        | —        | —          |
| `--input-bg`                 | `#12100C`               | Field fill — recessed  | —        | —          |
| `--hover-bg`                 | `rgba(232,163,61,0.08)` | Neutral hover wash     | —        | —          |
| `--border-color`             | `#3A3025`               | Decorative separators  | 1.45     | decorative |
| `--border-strong`            | `#7C6F5D`               | Form-control borders   | **3.53** | ✅ AA      |

### Content

| Token                 | Value     | Role                  | Contrast  | Verdict |
| --------------------- | --------- | --------------------- | --------- | ------- |
| `--text-color`        | `#EDE6D8` | Body — warm off-white | **13.93** | ✅ AA   |
| `--text-light`        | `#A89B85` | Metadata, handles     | **6.34**  | ✅ AA   |
| `--text-disabled`     | `#7A6F60` | Inactive              | **3.52**  | ✅ (≥3) |
| `--button-text-color` | `#15120E` | On amber fill         | **8.02**  | ✅ AA   |

### Brand roles

| Token               | Value     | Role                          | Contrast | Verdict |
| ------------------- | --------- | ----------------------------- | -------- | ------- |
| `--primary-color`   | `#E8A33D` | Amber lamplight — interactive | **8.02** | ✅ AA   |
| `--primary-dark`    | `#C4832A` | Pressed / hover fill          | **5.46** | ✅ AA   |
| `--secondary-color` | `#5FA398` | Muted teal — counterpoint     | **5.91** | ✅ AA   |
| `--accent-color`    | `#D4674A` | Persimmon 柿 — rare highlight | **4.81** | ✅ AA   |

### Status

| Token                                | Value                    | Contrast | Verdict   |
| ------------------------------------ | ------------------------ | -------- | --------- |
| `--success-color` / `--success-text` | `#6FA76B`                | **6.11** | ✅ AA     |
| `--success-bg`                       | `rgba(111,167,107,0.12)` | —        | —         |
| `--error-color` / `--error-text`     | `#E0655A`                | **5.09** | ✅ AA     |
| `--error-bg`                         | `rgba(224,101,90,0.12)`  | —        | —         |
| `--error-hover-color`                | `#C24A40`                | —        | fill only |
| `--disabled-color`                   | `#3A3025`                | —        | —         |

### Alpha variants

All derived from this theme's own bases — fixes [audit finding B](../design/token-schema.md#b-transparent-variants-do-not-match-their-base-colour).

| Token                                        | Value                                     |
| -------------------------------------------- | ----------------------------------------- |
| `--primary-transparent-10 / -15 / -20 / -30` | `rgba(232,163,61, .10 / .15 / .20 / .30)` |
| `--secondary-transparent-10 / -50`           | `rgba(95,163,152, .10 / .50)`             |
| `--accent-transparent-10 / -50`              | `rgba(212,103,74, .10 / .50)`             |
| `--card-bg-transparent-30 / -50 / -80`       | `rgba(30,26,21, .30 / .50 / .80)`         |
| `--text-light-transparent-20 / -30`          | `rgba(168,155,133, .20 / .30)`            |
| `--error-bg-transparent-10`                  | `rgba(224,101,90,0.10)`                   |
| `--card-shadow`                              | `rgba(0,0,0,0.45)`                        |
| `--spinner-bg`                               | `rgba(168,155,133,0.15)`                  |

## Buttons

Flat fills, 2px radius, hairline borders. No gradients.

| Variant     | Fill                       | Border                | Text              | Radius | Padding     | Hover                                  | Active            | Focus                   |
| ----------- | -------------------------- | --------------------- | ----------------- | ------ | ----------- | -------------------------------------- | ----------------- | ----------------------- |
| Primary     | `--primary-color`          | none                  | `#15120E`         | `2px`  | `10px 18px` | fill → `--primary-dark`                | `translateY(1px)` | `0 0 0 2px` @ 30% amber |
| Secondary   | `--primary-transparent-10` | `1px --primary-color` | `--primary-color` | `2px`  | `10px 18px` | fill → 20%                             | `translateY(1px)` | same                    |
| Ghost       | transparent                | `1px --border-strong` | `--text-color`    | `2px`  | `10px 18px` | fill → `--hover-bg`                    | `translateY(1px)` | same                    |
| Destructive | `--error-color`            | none                  | `#15120E`         | `2px`  | `10px 18px` | fill → `--error-hover-color`           | `translateY(1px)` | `0 0 0 2px` @ 30% red   |
| Disabled    | `--disabled-color`         | none                  | `--text-disabled` | `2px`  | `10px 18px` | none                                   | none              | none                    |
| Icon-only   | transparent                | none                  | `--text-light`    | `2px`  | `6px`       | `--hover-bg`, text → `--primary-color` | —                 | same                    |

## Spacing & layout

| Token                     | Value                                                   |
| ------------------------- | ------------------------------------------------------- |
| Base unit                 | `4px`                                                   |
| `--space-1` … `--space-8` | `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64px`                 |
| `--card-padding`          | `--space-5` (24px)                                      |
| `--section-gap`           | `--space-7` (48px)                                      |
| `--page-gutter`           | `--space-6` (32px), `--space-4` (16px) below 1100px     |
| `--content-max-width`     | `1100px` — narrower than today's 1200px, more editorial |
| Card list gap             | `--space-3` (12px)                                      |
| Breakpoints               | `1100px`, `720px`                                       |

## Blocks & surfaces

| Block            | Background                 | Border                      | Radius | Shadow        | Accent rule                    | Hover                      |
| ---------------- | -------------------------- | --------------------------- | ------ | ------------- | ------------------------------ | -------------------------- |
| Page             | `--background-color`       | —                           | —      | —             | —                              | —                          |
| `DataCard`       | `--card-color`             | `1px --border-color`        | `2px`  | none          | 2px top bar, `--primary-color` | border → `--primary-color` |
| `MemberCard`     | `--card-color`             | `1px --border-color`        | `2px`  | none          | none                           | `--hover-bg`               |
| Modal            | `--surface-raised`         | `1px --border-strong`       | `2px`  | `--shadow-lg` | none                           | —                          |
| `AppHeader`      | `--background-color`       | bottom `1px --border-color` | —      | none          | none                           | —                          |
| `ListChips` chip | `--primary-transparent-10` | `1px --primary-color`       | `2px`  | none          | none                           | fill → 20%                 |
| `Pagination`     | transparent                | top `1px --border-color`    | —      | none          | none                           | —                          |
| Form input       | `--input-bg`               | `1px --border-strong`       | `2px`  | none          | none                           | border → `--primary-color` |
| `LoginForm`      | `--card-color`             | `1px --border-color`        | `2px`  | `--shadow-md` | 2px top bar, `--primary-color` | —                          |
| Empty state      | transparent                | `1px dashed --border-color` | `2px`  | none          | none                           | —                          |
| Loading overlay  | `--card-bg-transparent-80` | —                           | —      | —             | —                              | —                          |

## Motion

| Token             | Value                                                           |
| ----------------- | --------------------------------------------------------------- |
| `--duration-fast` | `120ms`                                                         |
| `--duration-base` | `160ms`                                                         |
| `--ease`          | `cubic-bezier(0.4, 0, 0.2, 1)`                                  |
| `--transition`    | `all var(--duration-base) var(--ease)`                          |
| Hover             | Colour only — no lift                                           |
| Press             | `translateY(1px)`                                               |
| Reduced motion    | `@media (prefers-reduced-motion: reduce)` → all durations `0ms` |

## Decorative layer

Opt-in behind `[data-decor='on']` on `<html>`. Off by default.

| Effect       | Token             | CSS                                                                                   | Default |
| ------------ | ----------------- | ------------------------------------------------------------------------------------- | ------- |
| Paper grain  | `--decor-overlay` | Tiled SVG `feTurbulence`, `opacity: .035`, `mix-blend-mode: overlay` on `body::after` | off     |
| Section rule | `--decor-sheen`   | `linear-gradient(90deg, --primary-color, transparent)` on section `::before`          | off     |
| Gradient     | —                 | _not used by this theme_                                                              | —       |
| Glow         | —                 | _not used by this theme_                                                              | —       |

## Token map

Paste into `:root` in `src/assets/styles/_variables.css`.

```css
:root {
  /* fonts */
  --font-display: 'Shippori Mincho B1', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  /* type scale */
  --text-xs: 0.694rem;
  --text-sm: 0.833rem;
  --text-base: 1rem;
  --text-lg: 1.2rem;
  --text-xl: 1.44rem;
  --text-2xl: 1.728rem;
  --text-3xl: 2.074rem;
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.24em;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-bold: 600;

  /* surfaces */
  --background-color: #15120e;
  --card-color: #1e1a15;
  --card-bg: var(--card-color);
  --surface-raised: #262019;
  --input-bg: #12100c;
  --hover-bg: rgba(232, 163, 61, 0.08);
  --border-color: #3a3025;
  --border-strong: #7c6f5d;
  --border-style: 1px solid var(--border-color);

  /* content */
  --text-color: #ede6d8;
  --text-light: #a89b85;
  --text-disabled: #7a6f60;
  --button-text-color: #15120e;

  /* brand */
  --primary-color: #e8a33d;
  --primary-dark: #c4832a;
  --secondary-color: #5fa398;
  --accent-color: #d4674a;

  /* status */
  --success-color: #6fa76b;
  --success-text: #6fa76b;
  --success-bg: rgba(111, 167, 107, 0.12);
  --error-color: #e0655a;
  --error-text: #e0655a;
  --error-bg: rgba(224, 101, 90, 0.12);
  --error-hover-color: #c24a40;
  --disabled-color: #3a3025;

  /* alpha */
  --primary-transparent-10: rgba(232, 163, 61, 0.1);
  --primary-transparent-15: rgba(232, 163, 61, 0.15);
  --primary-transparent-20: rgba(232, 163, 61, 0.2);
  --primary-transparent-30: rgba(232, 163, 61, 0.3);
  --secondary-transparent-10: rgba(95, 163, 152, 0.1);
  --secondary-transparent-50: rgba(95, 163, 152, 0.5);
  --accent-transparent-10: rgba(212, 103, 74, 0.1);
  --accent-transparent-50: rgba(212, 103, 74, 0.5);
  --card-bg-transparent-30: rgba(30, 26, 21, 0.3);
  --card-bg-transparent-50: rgba(30, 26, 21, 0.5);
  --card-bg-transparent-80: rgba(30, 26, 21, 0.8);
  --text-light-transparent-20: rgba(168, 155, 133, 0.2);
  --text-light-transparent-30: rgba(168, 155, 133, 0.3);
  --error-bg-transparent-10: rgba(224, 101, 90, 0.1);
  --card-shadow: rgba(0, 0, 0, 0.45);
  --spinner-bg: rgba(168, 155, 133, 0.15);

  /* spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --card-padding: var(--space-5);
  --section-gap: var(--space-7);
  --page-gutter: var(--space-6);
  --content-max-width: 1100px;

  /* shape & elevation */
  --radius-sm: 2px;
  --radius-md: 2px;
  --border-radius: var(--radius-md);
  --shadow-sm: none;
  --shadow-md: 0 2px 6px var(--card-shadow);
  --shadow-lg: 0 8px 28px var(--card-shadow);
  --shadow: var(--shadow-md);
  --focus-ring: 0 0 0 2px var(--primary-transparent-30);

  /* motion */
  --duration-fast: 120ms;
  --duration-base: 160ms;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --transition: all var(--duration-base) var(--ease);

  /* decoration (opt-in) */
  --decor-overlay: none;
  --decor-sheen: linear-gradient(90deg, var(--primary-color), transparent);
}
```

## Preview

```
┌────────────────────────────────────────────────┐
│▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ ← 2px #E8A33D
│  リスト                                          │ ← kana micro-label, 11px
│  Design Folks                                   │ ← Mincho 19.2px #EDE6D8
│                                                 │
│  42 members · updated 3d ago                    │ ← Plex Mono 13.3px #A89B85
│                                                 │
│  ┌───────────┐  ┌───────────┐                   │
│  │   View    │  │  Curate   │                   │ ← amber fill / amber outline
│  └───────────┘  └───────────┘                   │
└────────────────────────────────────────────────┘
   card #1E1A15 on page #15120E, 1px #3A3025, r2
```

Swatches — `#15120E` `#1E1A15` `#3A3025` `#7C6F5D` `#A89B85` `#EDE6D8` · `#E8A33D` `#C4832A`
`#5FA398` `#D4674A` · `#6FA76B` `#E0655A`

## Migration notes

Beyond swapping the token block:

- `app.css` — `body` must move from `--font-mono` to `--font-body`; add the `@font-face` or
  preload links.
- `data-card.css` — `--card-bg` and `--hover-bg` now resolve, so the modal and card action
  hover states will render for the first time.
- `action-buttons.css` — `.action-button` hard-codes `border-radius: 0`; switch to
  `var(--radius-sm)`.
- `dashboard.css`, `data-display.css` — hard-coded paddings should move to `--space-*`.
- **No component markup changes required**, except adding the optional kana `<span>` to
  section headers, which is additive.
