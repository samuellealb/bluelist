# Theme C — Bayside Neon 湾岸ネオン · Light

> **Mood:** the mall at midday, 1991. Chrome, glass, lilac-white tile, magenta signage.
> The daylight side of the vaporwave lineage — bright, synthetic, unashamed.

|           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family    | C — Bayside Neon (湾岸ネオン, "bayside neon")                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Mode      | Light                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Intensity | **Maximalist** — highest risk, highest personality                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Lineage   | The nighttime lineage inverted — mallsoft, chrome, Memphis geometry                                                                                                                                                                                                                                                                                                                                                                                                    |
| Leans on  | [#3 tropical accents](../design/city-pop-aesthetics.md#3-high-chroma-tropical-accents-on-a-cool-base), [#4 chrome](../design/city-pop-aesthetics.md#4-chrome-glass-and-water-reflection), [#5 bilingual type](../design/city-pop-aesthetics.md#5-bilingual-typographic-pairing), [#6 grids & horizons](../design/city-pop-aesthetics.md#6-horizon-lines-rules-and-perspective-grids), [#8 analog nostalgia](../design/city-pop-aesthetics.md#8-analog-nostalgia-layer) |
| Avoids    | Nothing. This is the loud one.                                                                                                                                                                                                                                                                                                                                                                                                                                         |

> **Risk note.** Light mode is where this family is hardest to pull off — neon relies on a
> dark ground to glow. The translation used here is **chrome instead of glow**: hard offset
> shadows, gradient rules, and deeply saturated ink-magenta rather than luminous magenta.
> The glow token is deliberately near-inert in this mode.

## Typography

Identical to the dark variant — typography does not change between modes.

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
| Scale ratio                        | **1.333** (perfect fourth)                                           |
| `--text-3xl`                       | `3.157rem` / 50.5px                                                  |
| `--text-2xl`                       | `2.369rem` / 37.9px                                                  |
| `--text-xl`                        | `1.777rem` / 28.4px                                                  |
| `--text-lg`                        | `1.333rem` / 21.3px                                                  |
| `--text-base`                      | `1rem` / 16px                                                        |
| `--text-sm`                        | `0.750rem` / 12px                                                    |
| `--text-xs`                        | `0.563rem` / 9px                                                     |
| Line height                        | Headings `1.1` · body `1.6`                                          |
| Tracking                           | Display `0.12em` · body `0` · kana label `0.4em`                     |
| Casing                             | All display headings `uppercase`                                     |

**Fullwidth note.** The `ＡＥＳＴＨＥＴＩＣ` fullwidth convention is deliberately _not_ used — it
breaks screen readers and text selection. Wide tracking achieves the look safely.

## Colour

Ratios measured against `--background-color` and `--card-color`; the lower is shown.

### Surfaces

| Token                        | Value                 | Role                       | Contrast | Verdict    |
| ---------------------------- | --------------------- | -------------------------- | -------- | ---------- |
| `--background-color`         | `#F6F0FA`             | Page — lilac-white tile    | —        | —          |
| `--card-color` / `--card-bg` | `#FFFFFF`             | Card, panel — chrome white | —        | —          |
| `--surface-raised`           | `#FFFFFF`             | Modal, dropdown            | —        | —          |
| `--input-bg`                 | `#FFFFFF`             | Field fill                 | —        | —          |
| `--hover-bg`                 | `rgba(194,0,94,0.06)` | Neutral hover wash         | —        | —          |
| `--border-color`             | `#E2D0F0`             | Decorative separators      | 1.29     | decorative |
| `--border-strong`            | `#9585A8`             | Form-control borders       | **3.03** | ✅ AA      |

### Content

| Token                 | Value     | Role                    | Contrast  | Verdict |
| --------------------- | --------- | ----------------------- | --------- | ------- |
| `--text-color`        | `#1A0E2E` | Body — violet-black ink | **16.37** | ✅ AA   |
| `--text-light`        | `#6B5B85` | Metadata, handles       | **5.42**  | ✅ AA   |
| `--text-disabled`     | `#7E7095` | Inactive                | **4.04**  | ✅ (≥3) |
| `--button-text-color` | `#FFFFFF` | On ink-magenta fill     | **6.08**  | ✅ AA   |

### Brand roles

The dark variant's `#FF4DA6` reaches only ≈2.3:1 on a light ground, so light mode drops the
magenta into ink territory. The cyan likewise becomes a deep teal.

| Token               | Value     | Role                      | Contrast | Verdict |
| ------------------- | --------- | ------------------------- | -------- | ------- |
| `--primary-color`   | `#C2005E` | Ink magenta — interactive | **5.43** | ✅ AA   |
| `--primary-dark`    | `#99004A` | Pressed / hover fill      | **7.65** | ✅ AA   |
| `--secondary-color` | `#006B85` | Deep cyan — counterpoint  | **5.45** | ✅ AA   |
| `--accent-color`    | `#6D28D9` | Violet — rare highlight   | **6.35** | ✅ AA   |

### Status

| Token                                | Value     | Contrast | Verdict   |
| ------------------------------------ | --------- | -------- | --------- |
| `--success-color` / `--success-text` | `#0F6B4F` | **5.80** | ✅ AA     |
| `--success-bg`                       | `#E2F2EC` | —        | —         |
| `--error-color` / `--error-text`     | `#B3123C` | **6.11** | ✅ AA     |
| `--error-bg`                         | `#FBE4EA` | —        | —         |
| `--error-hover-color`                | `#8E0D30` | —        | fill only |
| `--disabled-color`                   | `#EBE0F4` | —        | —         |

### Alpha variants

| Token                                        | Value                                   |
| -------------------------------------------- | --------------------------------------- |
| `--primary-transparent-10 / -15 / -20 / -30` | `rgba(194,0,94, .10 / .15 / .20 / .30)` |
| `--secondary-transparent-10 / -50`           | `rgba(0,107,133, .10 / .50)`            |
| `--accent-transparent-10 / -50`              | `rgba(109,40,217, .10 / .50)`           |
| `--card-bg-transparent-30 / -50 / -80`       | `rgba(255,255,255, .30 / .50 / .80)`    |
| `--text-light-transparent-20 / -30`          | `rgba(107,91,133, .20 / .30)`           |
| `--error-bg-transparent-10`                  | `rgba(179,18,60,0.10)`                  |
| `--card-shadow`                              | `rgba(26,14,46,0.16)`                   |
| `--spinner-bg`                               | `rgba(107,91,133,0.15)`                 |

## Buttons

Zero radius, hard edges, **hard offset shadow instead of glow** — the chrome translation.

| Variant     | Fill                                       | Border                | Text              | Radius | Padding     | Hover                                    | Active                              | Focus                     |
| ----------- | ------------------------------------------ | --------------------- | ----------------- | ------ | ----------- | ---------------------------------------- | ----------------------------------- | ------------------------- |
| Primary     | `linear-gradient(90deg, #C2005E, #6D28D9)` | none                  | `#FFFFFF`         | `0`    | `12px 22px` | offset shadow `3px 3px 0 --accent-color` | `translate(2px,2px)`, shadow → none | `0 0 0 3px` @ 30% magenta |
| Secondary   | `--primary-transparent-10`                 | `1px --primary-color` | `--primary-color` | `0`    | `12px 22px` | fill → 20% + offset shadow               | `translate(2px,2px)`                | same                      |
| Ghost       | transparent                                | `1px --border-strong` | `--text-color`    | `0`    | `12px 22px` | fill → `--hover-bg`                      | `translate(2px,2px)`                | same                      |
| Destructive | `--error-color`                            | none                  | `#FFFFFF`         | `0`    | `12px 22px` | fill → `--error-hover-color`             | `translate(2px,2px)`                | `0 0 0 3px` @ 30% red     |
| Disabled    | `--disabled-color`                         | none                  | `--text-disabled` | `0`    | `12px 22px` | none                                     | none                                | none                      |
| Icon-only   | transparent                                | none                  | `--text-light`    | `0`    | `8px`       | `--hover-bg`, text → `--secondary-color` | —                                   | same                      |

## Spacing & layout

Identical to the dark variant.

| Token                     | Value                                               |
| ------------------------- | --------------------------------------------------- |
| Base unit                 | `8px`                                               |
| `--space-1` … `--space-8` | `4 · 8 · 16 · 24 · 32 · 40 · 56 · 80px`             |
| `--card-padding`          | `--space-4` (24px)                                  |
| `--section-gap`           | `--space-7` (56px)                                  |
| `--page-gutter`           | `--space-5` (32px), `--space-3` (16px) below 1100px |
| `--content-max-width`     | `1240px`                                            |
| Card list gap             | `--space-2` (8px)                                   |
| Breakpoints               | `1100px`, `720px`                                   |

## Blocks & surfaces

| Block            | Background                                          | Border                             | Radius | Shadow        | Accent rule                        | Hover                                      |
| ---------------- | --------------------------------------------------- | ---------------------------------- | ------ | ------------- | ---------------------------------- | ------------------------------------------ |
| Page             | `--background-color` (+ grid horizon when decor on) | —                                  | —      | —             | —                                  | —                                          |
| `DataCard`       | `--card-color`                                      | `1px --border-color`               | `0`    | `--shadow-sm` | 3px top bar, magenta→cyan gradient | border → `--primary-color` + offset shadow |
| `MemberCard`     | `--card-color`                                      | left `2px --border-color`          | `0`    | none          | none                               | left border → `--secondary-color`          |
| Modal            | `--surface-raised`                                  | `1px --primary-color`              | `0`    | `--shadow-lg` | 3px top gradient bar               | —                                          |
| `AppHeader`      | `--card-color`                                      | bottom `2px` magenta→cyan gradient | —      | `--shadow-sm` | none                               | —                                          |
| `ListChips` chip | `--primary-transparent-10`                          | `1px --primary-color`              | `0`    | none          | none                               | fill → 20%                                 |
| `Pagination`     | transparent                                         | top `1px --border-color`           | —      | none          | none                               | —                                          |
| Form input       | `--input-bg`                                        | `1px --border-strong`              | `0`    | none          | none                               | border → `--secondary-color` + focus ring  |
| `LoginForm`      | `--card-color`                                      | `1px --primary-color`              | `0`    | `--shadow-lg` | 3px top gradient bar               | —                                          |
| Empty state      | transparent                                         | `1px dashed --border-strong`       | `0`    | none          | none                               | —                                          |
| Loading overlay  | `--card-bg-transparent-80`                          | —                                  | —      | —             | —                                  | —                                          |

## Motion

Identical to the dark variant.

| Token             | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| `--duration-fast` | `100ms`                                                                      |
| `--duration-base` | `140ms`                                                                      |
| `--ease`          | `cubic-bezier(0.16, 1, 0.3, 1)`                                              |
| `--transition`    | `all var(--duration-base) var(--ease)`                                       |
| Hover             | Offset-shadow appear, no lift                                                |
| Press             | `translate(2px, 2px)`, shadow collapses — the button "presses into" the page |
| Reduced motion    | `@media (prefers-reduced-motion: reduce)` → durations `0ms`                  |

## Decorative layer

Opt-in behind `[data-decor='on']` on `<html>`. Off by default.

| Effect        | Token              | CSS                                                                                                               | Default |
| ------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- | ------- |
| Chrome offset | `--decor-glow`     | `3px 3px 0 var(--accent-color)` on hovered interactive elements — replaces the dark mode's neon glow              | off     |
| Halftone      | `--decor-overlay`  | `radial-gradient` dot grid at `opacity: .04`, `mix-blend-mode: multiply` on `body::after`, `pointer-events: none` | off     |
| Chrome sheen  | `--decor-sheen`    | `linear-gradient(180deg, rgba(255,255,255,.35) 0%, transparent 40%)` on primary buttons                           | off     |
| Grid horizon  | `--decor-gradient` | Perspective grid in `--primary-transparent-10`, bottom 30vh of `body`, fixed                                      | off     |

**Performance.** Halftone and the fixed grid horizon both create full-viewport composited
layers. Both must set `pointer-events: none`. If either causes scroll jank on the long
`follows` list, drop the grid first.

## Token map

Paste into `.light-theme` in `src/assets/styles/_variables.css`.

```css
.light-theme {
  /* surfaces */
  --background-color: #f6f0fa;
  --card-color: #ffffff;
  --card-bg: var(--card-color);
  --surface-raised: #ffffff;
  --input-bg: #ffffff;
  --hover-bg: rgba(194, 0, 94, 0.06);
  --border-color: #e2d0f0;
  --border-strong: #9585a8;
  --border-style: 1px solid var(--border-color);

  /* content */
  --text-color: #1a0e2e;
  --text-light: #6b5b85;
  --text-disabled: #7e7095;
  --button-text-color: #ffffff;

  /* brand */
  --primary-color: #c2005e;
  --primary-dark: #99004a;
  --secondary-color: #006b85;
  --accent-color: #6d28d9;

  /* status */
  --success-color: #0f6b4f;
  --success-text: #0f6b4f;
  --success-bg: #e2f2ec;
  --error-color: #b3123c;
  --error-text: #b3123c;
  --error-bg: #fbe4ea;
  --error-hover-color: #8e0d30;
  --disabled-color: #ebe0f4;

  /* alpha */
  --primary-transparent-10: rgba(194, 0, 94, 0.1);
  --primary-transparent-15: rgba(194, 0, 94, 0.15);
  --primary-transparent-20: rgba(194, 0, 94, 0.2);
  --primary-transparent-30: rgba(194, 0, 94, 0.3);
  --secondary-transparent-10: rgba(0, 107, 133, 0.1);
  --secondary-transparent-50: rgba(0, 107, 133, 0.5);
  --accent-transparent-10: rgba(109, 40, 217, 0.1);
  --accent-transparent-50: rgba(109, 40, 217, 0.5);
  --card-bg-transparent-30: rgba(255, 255, 255, 0.3);
  --card-bg-transparent-50: rgba(255, 255, 255, 0.5);
  --card-bg-transparent-80: rgba(255, 255, 255, 0.8);
  --text-light-transparent-20: rgba(107, 91, 133, 0.2);
  --text-light-transparent-30: rgba(107, 91, 133, 0.3);
  --error-bg-transparent-10: rgba(179, 18, 60, 0.1);
  --card-shadow: rgba(26, 14, 46, 0.16);
  --spinner-bg: rgba(107, 91, 133, 0.15);

  /* gradients */
  --gradient-brand: linear-gradient(90deg, #c2005e, #6d28d9);
  --gradient-rule: linear-gradient(90deg, #c2005e, #006b85);

  /* shape & elevation */
  --shadow-sm: 0 1px 0 var(--card-shadow);
  --shadow-md: 0 4px 16px var(--card-shadow);
  --shadow-lg: 0 16px 48px var(--card-shadow);
  --shadow: var(--shadow-md);
  --focus-ring: 0 0 0 3px var(--primary-transparent-30);

  /* decoration (opt-in) */
  --decor-glow: 3px 3px 0 var(--accent-color);
  --decor-sheen: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.35) 0%,
    transparent 40%
  );
  --decor-overlay: radial-gradient(
    circle,
    rgba(26, 14, 46, 0.5) 0.5px,
    transparent 0.5px
  );
  --decor-gradient: linear-gradient(
    180deg,
    transparent 70%,
    var(--primary-transparent-10) 100%
  );
}
```

Font, type-scale, spacing, radius and motion tokens are inherited from `:root` — they are
mode-independent and are not redeclared here.

## Preview

```
┌────────────────────────────────────────────────┐
│████████████████████████████████████████████████│ ← 3px magenta→cyan gradient
│  リスト                                          │ ← kana, 9px #006B85, +0.4em
│  D E S I G N   F O L K S                        │ ← Chakra Petch 700 21.3px
│                                                 │   uppercase, +0.12em #1A0E2E
│  42 members · updated 3d ago                    │ ← Plex Mono 12px #6B5B85
│                                                 │
│  ┏━━━━━━━━━━━┓                                   │
│  ┃   VIEW    ┃▟  ← 3px offset shadow #6D28D9    │
│  ┗━━━━━━━━━━━┛▟                                  │
└────────────────────────────────────────────────┘
   card #FFFFFF on page #F6F0FA, 1px #E2D0F0, r0
```

Swatches — `#F6F0FA` `#FFFFFF` `#E2D0F0` `#9585A8` `#6B5B85` `#1A0E2E` · `#C2005E` `#99004A`
`#006B85` `#6D28D9` · `#0F6B4F` `#B3123C`

## Migration notes

Same structural work as the dark variant.

- `app.css` — `body` moves to `--font-body`; add font preloads. With decoration on, `body`
  needs an `::after` halftone layer and a fixed grid-horizon background.
- `app-header.css` — the bottom border becomes a gradient, so `border-bottom` must be replaced
  with a `::after` bar (gradients cannot be used as `border-color`). **This is a real CSS
  change, not just a token swap.**
- `data-card.css` — `.data-card::before` only needs `background-color` →
  `background-image: var(--gradient-rule)`.
- `action-buttons.css` — `border-radius: 0` already matches. Primary buttons need a gradient
  `background-image`, a `::after` sheen gated on `[data-decor='on']`, and the offset-shadow
  hover/press pair.
- `data-display.css`, `dashboard.css` — the larger `--space-*` scale changes list density
  noticeably; these two carry the most hard-coded padding.
- **Markup change required:** the gradient rules on `AppHeader` and the modal need a
  pseudo-element that does not exist yet.
- **Watch out:** the offset-shadow press interaction moves the button by 2px. Verify it does
  not cause layout shift inside `ButtonsPanel`'s flex column — it should not, since `transform`
  does not affect layout, but the shadow does extend the visual bounding box.
