# Theme C — Bayside Neon 湾岸ネオン · Dark

> **Mood:** the Tokyo bayfront at 2am. Ink-violet black, magenta signage reflected in wet
> asphalt, cyan cutting through. _Plastic Love_ on the car stereo.

|           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family    | C — Bayside Neon (湾岸ネオン, "bayside neon")                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Mode      | Dark                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Intensity | **Maximalist** — highest risk, highest personality                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Lineage   | The nighttime lineage — Plastic Love, vaporwave, future funk                                                                                                                                                                                                                                                                                                                                                                                                           |
| Leans on  | [#3 tropical accents](../design/city-pop-aesthetics.md#3-high-chroma-tropical-accents-on-a-cool-base), [#4 chrome](../design/city-pop-aesthetics.md#4-chrome-glass-and-water-reflection), [#5 bilingual type](../design/city-pop-aesthetics.md#5-bilingual-typographic-pairing), [#6 grids & horizons](../design/city-pop-aesthetics.md#6-horizon-lines-rules-and-perspective-grids), [#8 analog nostalgia](../design/city-pop-aesthetics.md#8-analog-nostalgia-layer) |
| Avoids    | Nothing. This is the loud one.                                                                                                                                                                                                                                                                                                                                                                                                                                         |

> **Risk note.** This theme is the most likely to read as pastiche and the most likely to
> fatigue on the dense, repetitive surfaces Bluelist is mostly made of (`MemberCard` lists,
> `Pagination`). Its saturated colours are confined to chrome, headings and accents; body rows
> stay on `--text-color` and `--text-light`, both of which clear AA comfortably. The
> decorative layer — scanlines, glow, chrome sheen — is off by default.

## Typography

Wide, heavy display lettering is the signature. Confined to headings; body copy stays Inter.

| Element                            | Value                                                                |
| ---------------------------------- | -------------------------------------------------------------------- |
| Display / headings                 | `Chakra Petch` 700 — wide techno sans, Latin                         |
| Body                               | `Inter`                                                              |
| Data (handles, DIDs, counts, URIs) | `IBM Plex Mono`                                                      |
| Kana micro-labels                  | `Zen Kaku Gothic New` 500                                            |
| Fallback stack                     | `system-ui, sans-serif` throughout                                   |
| Weights loaded                     | Chakra Petch 700 · Inter 400/500/600 · Plex Mono 400 · Zen Kaku 500  |
| Delivery                           | Self-hosted WOFF2, `font-display: swap`, subset to Latin + kana used |
| Base size                          | `16px`                                                               |
| Scale ratio                        | **1.333** (perfect fourth) — dramatic, poster-like                   |
| `--text-3xl`                       | `3.157rem` / 50.5px — page title                                     |
| `--text-2xl`                       | `2.369rem` / 37.9px — h2                                             |
| `--text-xl`                        | `1.777rem` / 28.4px — h3                                             |
| `--text-lg`                        | `1.333rem` / 21.3px — h4, card title                                 |
| `--text-base`                      | `1rem` / 16px — body                                                 |
| `--text-sm`                        | `0.750rem` / 12px — metadata                                         |
| `--text-xs`                        | `0.563rem` / 9px — kana micro-labels                                 |
| Line height                        | Headings `1.1` · body `1.6`                                          |
| Tracking                           | Display `0.12em` · body `0` · kana label `0.4em`                     |
| Casing                             | All display headings `uppercase`                                     |

**Kana micro-labels.** Kana above section headings at `--text-xs` / `--tracking-wider` /
`--secondary-color`. Decorative only — never functional text.

**Fullwidth note.** The vaporwave `ＡＥＳＴＨＥＴＩＣ` fullwidth convention is deliberately _not_
used — it breaks screen readers and text selection. Wide tracking achieves the same look
safely.

## Colour

Ratios measured against `--background-color` and `--card-color`; the lower is shown.
Target ≥ 4.5:1 for text and brand roles, ≥ 3:1 for disabled text and control borders.

### Surfaces

| Token                        | Value                   | Role                    | Contrast | Verdict    |
| ---------------------------- | ----------------------- | ----------------------- | -------- | ---------- |
| `--background-color`         | `#0A0614`               | Page — ink violet-black | —        | —          |
| `--card-color` / `--card-bg` | `#150E24`               | Card, panel             | —        | —          |
| `--surface-raised`           | `#1E1433`               | Modal, dropdown         | —        | —          |
| `--input-bg`                 | `#07040F`               | Field fill — recessed   | —        | —          |
| `--hover-bg`                 | `rgba(255,77,166,0.10)` | Neutral hover wash      | —        | —          |
| `--border-color`             | `#3A2260`               | Decorative separators   | 1.50     | decorative |
| `--border-strong`            | `#7A63A3`               | Form-control borders    | **3.70** | ✅ AA      |

### Content

| Token                 | Value     | Role                       | Contrast  | Verdict |
| --------------------- | --------- | -------------------------- | --------- | ------- |
| `--text-color`        | `#F2E9FF` | Body — violet-tinted white | **15.96** | ✅ AA   |
| `--text-light`        | `#A896C9` | Metadata, handles          | **7.03**  | ✅ AA   |
| `--text-disabled`     | `#7B6C99` | Inactive                   | **3.97**  | ✅ (≥3) |
| `--button-text-color` | `#0A0614` | On magenta fill            | **6.13**  | ✅ AA   |

### Brand roles

| Token               | Value     | Role                       | Contrast  | Verdict |
| ------------------- | --------- | -------------------------- | --------- | ------- |
| `--primary-color`   | `#FF4DA6` | Neon magenta — interactive | **6.13**  | ✅ AA   |
| `--primary-dark`    | `#E8479A` | Pressed / hover fill       | **5.18**  | ✅ AA   |
| `--secondary-color` | `#35E8FF` | Neon cyan — counterpoint   | **12.62** | ✅ AA   |
| `--accent-color`    | `#B96BFF` | Violet — rare highlight    | **5.90**  | ✅ AA   |

Note that `--primary-dark` is _lighter_ than `--primary-color` here. On a near-black ground a
"darker" pressed state would disappear, so the pressed fill brightens instead — the neon-sign
behaviour rather than the paint behaviour.

### Status

| Token                                | Value                   | Contrast  | Verdict   |
| ------------------------------------ | ----------------------- | --------- | --------- |
| `--success-color` / `--success-text` | `#3DE8B0`               | **11.93** | ✅ AA     |
| `--success-bg`                       | `rgba(61,232,176,0.12)` | —         | —         |
| `--error-color` / `--error-text`     | `#FF5C7A`               | **6.31**  | ✅ AA     |
| `--error-bg`                         | `rgba(255,92,122,0.12)` | —         | —         |
| `--error-hover-color`                | `#FF7D94`               | —         | fill only |
| `--disabled-color`                   | `#2A1B45`               | —         | —         |

### Alpha variants

| Token                                        | Value                                     |
| -------------------------------------------- | ----------------------------------------- |
| `--primary-transparent-10 / -15 / -20 / -30` | `rgba(255,77,166, .10 / .15 / .20 / .30)` |
| `--secondary-transparent-10 / -50`           | `rgba(53,232,255, .10 / .50)`             |
| `--accent-transparent-10 / -50`              | `rgba(185,107,255, .10 / .50)`            |
| `--card-bg-transparent-30 / -50 / -80`       | `rgba(21,14,36, .30 / .50 / .80)`         |
| `--text-light-transparent-20 / -30`          | `rgba(168,150,201, .20 / .30)`            |
| `--error-bg-transparent-10`                  | `rgba(255,92,122,0.10)`                   |
| `--card-shadow`                              | `rgba(0,0,0,0.6)`                         |
| `--spinner-bg`                               | `rgba(168,150,201,0.15)`                  |

## Buttons

Zero radius, hard edges. Primary is a magenta→violet gradient; glow appears only with
decoration enabled.

| Variant     | Fill                                       | Border                | Text              | Radius | Padding     | Hover                                    | Active            | Focus                     |
| ----------- | ------------------------------------------ | --------------------- | ----------------- | ------ | ----------- | ---------------------------------------- | ----------------- | ------------------------- |
| Primary     | `linear-gradient(90deg, #FF4DA6, #B96BFF)` | none                  | `#0A0614`         | `0`    | `12px 22px` | brighten + `--decor-glow`                | `translateY(2px)` | `0 0 0 3px` @ 30% magenta |
| Secondary   | `--primary-transparent-10`                 | `1px --primary-color` | `--primary-color` | `0`    | `12px 22px` | fill → 20% + glow                        | `translateY(2px)` | same                      |
| Ghost       | transparent                                | `1px --border-strong` | `--text-color`    | `0`    | `12px 22px` | fill → `--hover-bg`                      | `translateY(2px)` | same                      |
| Destructive | `--error-color`                            | none                  | `#0A0614`         | `0`    | `12px 22px` | fill → `--error-hover-color`             | `translateY(2px)` | `0 0 0 3px` @ 30% red     |
| Disabled    | `--disabled-color`                         | none                  | `--text-disabled` | `0`    | `12px 22px` | none                                     | none              | none                      |
| Icon-only   | transparent                                | none                  | `--text-light`    | `0`    | `8px`       | `--hover-bg`, text → `--secondary-color` | —                 | same                      |

## Spacing & layout

Larger base unit than A and B — bigger blocks, more air, poster composition.

| Token                     | Value                                               |
| ------------------------- | --------------------------------------------------- |
| Base unit                 | `8px`                                               |
| `--space-1` … `--space-8` | `4 · 8 · 16 · 24 · 32 · 40 · 56 · 80px`             |
| `--card-padding`          | `--space-4` (24px)                                  |
| `--section-gap`           | `--space-7` (56px)                                  |
| `--page-gutter`           | `--space-5` (32px), `--space-3` (16px) below 1100px |
| `--content-max-width`     | `1240px`                                            |
| Card list gap             | `--space-2` (8px) — tight rows against wide gutters |
| Breakpoints               | `1100px`, `720px`                                   |

## Blocks & surfaces

| Block            | Background                                          | Border                             | Radius | Shadow        | Accent rule                        | Hover                                       |
| ---------------- | --------------------------------------------------- | ---------------------------------- | ------ | ------------- | ---------------------------------- | ------------------------------------------- |
| Page             | `--background-color` (+ grid horizon when decor on) | —                                  | —      | —             | —                                  | —                                           |
| `DataCard`       | `--card-color`                                      | `1px --border-color`               | `0`    | `--shadow-md` | 3px top bar, magenta→cyan gradient | border → `--primary-color` + `--decor-glow` |
| `MemberCard`     | `--card-color`                                      | left `2px --border-color`          | `0`    | none          | none                               | left border → `--secondary-color`           |
| Modal            | `--surface-raised`                                  | `1px --primary-color`              | `0`    | `--shadow-lg` | 3px top gradient bar               | —                                           |
| `AppHeader`      | `--background-color`                                | bottom `2px` magenta→cyan gradient | —      | none          | none                               | —                                           |
| `ListChips` chip | `--primary-transparent-10`                          | `1px --primary-color`              | `0`    | none          | none                               | fill → 20% + glow                           |
| `Pagination`     | transparent                                         | top `1px --border-color`           | —      | none          | none                               | —                                           |
| Form input       | `--input-bg`                                        | `1px --border-strong`              | `0`    | none          | none                               | border → `--secondary-color` + focus ring   |
| `LoginForm`      | `--card-color`                                      | `1px --primary-color`              | `0`    | `--shadow-lg` | 3px top gradient bar               | —                                           |
| Empty state      | transparent                                         | `1px dashed --border-strong`       | `0`    | none          | none                               | —                                           |
| Loading overlay  | `--card-bg-transparent-80`                          | —                                  | —      | —             | —                                  | —                                           |

## Motion

Fast and snappy — a switch, not a fade.

| Token             | Value                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `--duration-fast` | `100ms`                                                                                                        |
| `--duration-base` | `140ms`                                                                                                        |
| `--ease`          | `cubic-bezier(0.16, 1, 0.3, 1)` — sharp out                                                                    |
| `--transition`    | `all var(--duration-base) var(--ease)`                                                                         |
| Hover             | Glow ramp, no lift                                                                                             |
| Press             | `translateY(2px)`                                                                                              |
| Reduced motion    | `@media (prefers-reduced-motion: reduce)` → durations `0ms`; **also disables the scanline animation entirely** |

## Decorative layer

Opt-in behind `[data-decor='on']` on `<html>`. Off by default. This theme has the most to gain
and the most to lose here.

| Effect       | Token              | CSS                                                                                                                      | Default |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------- |
| Neon glow    | `--decor-glow`     | `0 0 12px var(--primary-transparent-30)` on hovered interactive elements                                                 | off     |
| Scanlines    | `--decor-overlay`  | `repeating-linear-gradient(180deg, rgba(0,0,0,.14) 0 1px, transparent 1px 3px)` on `body::after`, `pointer-events: none` | off     |
| Chrome sheen | `--decor-sheen`    | `linear-gradient(180deg, rgba(255,255,255,.22) 0%, transparent 40%)` on primary buttons                                  | off     |
| Grid horizon | `--decor-gradient` | Perspective grid in `--primary-transparent-10`, bottom 30vh of `body`, fixed                                             | off     |

**Performance.** Scanlines and the fixed grid horizon both create full-viewport composited
layers. Both must set `pointer-events: none` and should be behind `will-change: auto` — do not
promote them. If either causes scroll jank on the long `follows` list, drop the grid first.

## Token map

Paste into `:root` in `src/assets/styles/_variables.css`.

```css
:root {
  /* fonts */
  --font-display: 'Chakra Petch', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --font-kana: 'Zen Kaku Gothic New', var(--font-body);

  /* type scale */
  --text-xs: 0.563rem;
  --text-sm: 0.75rem;
  --text-base: 1rem;
  --text-lg: 1.333rem;
  --text-xl: 1.777rem;
  --text-2xl: 2.369rem;
  --text-3xl: 3.157rem;
  --leading-tight: 1.1;
  --leading-normal: 1.4;
  --leading-relaxed: 1.6;
  --tracking-normal: 0;
  --tracking-wide: 0.12em;
  --tracking-wider: 0.4em;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-bold: 700;

  /* surfaces */
  --background-color: #0a0614;
  --card-color: #150e24;
  --card-bg: var(--card-color);
  --surface-raised: #1e1433;
  --input-bg: #07040f;
  --hover-bg: rgba(255, 77, 166, 0.1);
  --border-color: #3a2260;
  --border-strong: #7a63a3;
  --border-style: 1px solid var(--border-color);

  /* content */
  --text-color: #f2e9ff;
  --text-light: #a896c9;
  --text-disabled: #7b6c99;
  --button-text-color: #0a0614;

  /* brand */
  --primary-color: #ff4da6;
  --primary-dark: #e8479a;
  --secondary-color: #35e8ff;
  --accent-color: #b96bff;

  /* status */
  --success-color: #3de8b0;
  --success-text: #3de8b0;
  --success-bg: rgba(61, 232, 176, 0.12);
  --error-color: #ff5c7a;
  --error-text: #ff5c7a;
  --error-bg: rgba(255, 92, 122, 0.12);
  --error-hover-color: #ff7d94;
  --disabled-color: #2a1b45;

  /* alpha */
  --primary-transparent-10: rgba(255, 77, 166, 0.1);
  --primary-transparent-15: rgba(255, 77, 166, 0.15);
  --primary-transparent-20: rgba(255, 77, 166, 0.2);
  --primary-transparent-30: rgba(255, 77, 166, 0.3);
  --secondary-transparent-10: rgba(53, 232, 255, 0.1);
  --secondary-transparent-50: rgba(53, 232, 255, 0.5);
  --accent-transparent-10: rgba(185, 107, 255, 0.1);
  --accent-transparent-50: rgba(185, 107, 255, 0.5);
  --card-bg-transparent-30: rgba(21, 14, 36, 0.3);
  --card-bg-transparent-50: rgba(21, 14, 36, 0.5);
  --card-bg-transparent-80: rgba(21, 14, 36, 0.8);
  --text-light-transparent-20: rgba(168, 150, 201, 0.2);
  --text-light-transparent-30: rgba(168, 150, 201, 0.3);
  --error-bg-transparent-10: rgba(255, 92, 122, 0.1);
  --card-shadow: rgba(0, 0, 0, 0.6);
  --spinner-bg: rgba(168, 150, 201, 0.15);

  /* gradients */
  --gradient-brand: linear-gradient(90deg, #ff4da6, #b96bff);
  --gradient-rule: linear-gradient(90deg, #ff4da6, #35e8ff);

  /* spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 40px;
  --space-7: 56px;
  --space-8: 80px;
  --card-padding: var(--space-4);
  --section-gap: var(--space-7);
  --page-gutter: var(--space-5);
  --content-max-width: 1240px;

  /* shape & elevation */
  --radius-sm: 0;
  --radius-md: 0;
  --border-radius: var(--radius-md);
  --shadow-sm: 0 1px 0 var(--card-shadow);
  --shadow-md: 0 4px 16px var(--card-shadow);
  --shadow-lg: 0 16px 48px var(--card-shadow);
  --shadow: var(--shadow-md);
  --focus-ring: 0 0 0 3px var(--primary-transparent-30);

  /* motion */
  --duration-fast: 100ms;
  --duration-base: 140ms;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --transition: all var(--duration-base) var(--ease);

  /* decoration (opt-in) */
  --decor-glow: 0 0 12px var(--primary-transparent-30);
  --decor-sheen: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.22) 0%,
    transparent 40%
  );
  --decor-overlay: repeating-linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.14) 0 1px,
    transparent 1px 3px
  );
  --decor-gradient: linear-gradient(
    180deg,
    transparent 70%,
    var(--primary-transparent-10) 100%
  );
}
```

## Preview

```
┌────────────────────────────────────────────────┐
│████████████████████████████████████████████████│ ← 3px magenta→cyan gradient
│  リスト                                          │ ← kana, 9px #35E8FF, +0.4em
│  D E S I G N   F O L K S                        │ ← Chakra Petch 700 21.3px
│                                                 │   uppercase, +0.12em #F2E9FF
│  42 members · updated 3d ago                    │ ← Plex Mono 12px #A896C9
│                                                 │
│  ┏━━━━━━━━━━━┓  ┏━━━━━━━━━━━┓                   │
│  ┃   VIEW    ┃  ┃  CURATE   ┃                   │ ← magenta→violet / outline
│  ┗━━━━━━━━━━━┛  ┗━━━━━━━━━━━┛                   │
└────────────────────────────────────────────────┘
   card #150E24 on page #0A0614, 1px #3A2260, r0
```

Swatches — `#0A0614` `#150E24` `#3A2260` `#7A63A3` `#A896C9` `#F2E9FF` · `#FF4DA6` `#E8479A`
`#35E8FF` `#B96BFF` · `#3DE8B0` `#FF5C7A`

## Migration notes

This theme requires the most work beyond a token swap.

- `app.css` — `body` moves to `--font-body`; add font preloads. With decoration on, `body`
  needs an `::after` scanline layer and a fixed grid-horizon background.
- `app-header.css` — the bottom border becomes a gradient, so `border-bottom` must be replaced
  with a `::after` bar (gradients cannot be used as `border-color`). **This is a real CSS
  change, not just a token swap.**
- `data-card.css` — same for `.data-card::before`: it already is a `::before` bar, so it only
  needs `background-color` → `background-image: var(--gradient-rule)`.
- `action-buttons.css` — `border-radius: 0` already matches. Primary buttons need a gradient
  `background-image` plus a `::after` sheen layer gated on `[data-decor='on']`.
- `data-display.css`, `dashboard.css` — the larger `--space-*` scale changes list density
  noticeably; these two files carry the most hard-coded padding and will need the most review.
- **Markup change required:** the gradient rules on `AppHeader` and the modal need a
  pseudo-element that does not exist yet, so `AppHeader.vue` may need an extra element if a
  pseudo-element is unavailable on the current structure.
- **Accessibility:** verify the scanline overlay does not trip
  `prefers-reduced-motion`; it is static, but any animated variant must be gated.
