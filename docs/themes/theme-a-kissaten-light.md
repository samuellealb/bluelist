# Theme A — Kissaten 喫茶店 · Light

> **Mood:** aged paper and ink. A 1970s Japanese magazine spread or vinyl liner note, read in
> daylight. Warm, quiet, literary.

|           |                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family    | A — Kissaten (喫茶店, "coffee house")                                                                                                                                                                                                                                                                                                                                        |
| Mode      | Light                                                                                                                                                                                                                                                                                                                                                                        |
| Intensity | **Restrained / editorial** — lowest risk of the three                                                                                                                                                                                                                                                                                                                        |
| Lineage   | Showa retro (昭和レトロ) — vinyl liner notes, 1970s Japanese print                                                                                                                                                                                                                                                                                                           |
| Leans on  | [#2 flat geometry](../design/city-pop-aesthetics.md#2-flat-hard-edged-geometry), [#5 bilingual type](../design/city-pop-aesthetics.md#5-bilingual-typographic-pairing), [#6 horizon rules](../design/city-pop-aesthetics.md#6-horizon-lines-rules-and-perspective-grids), [#7 negative space](../design/city-pop-aesthetics.md#7-album-cover-composition-and-negative-space) |
| Avoids    | Gradients, glow, chrome, scanlines                                                                                                                                                                                                                                                                                                                                           |

## Typography

Identical to the dark variant — typography does not change between modes.

| Element                            | Value                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Display / headings                 | `Shippori Mincho B1` — serif, covers Latin + kana                      |
| Body                               | `Inter`                                                                |
| Data (handles, DIDs, counts, URIs) | `IBM Plex Mono`                                                        |
| Fallback stack                     | `Georgia, serif` / `system-ui, sans-serif` / `ui-monospace, monospace` |
| Weights loaded                     | Mincho 400/600 · Inter 400/500/600 · Plex Mono 400                     |
| Delivery                           | Self-hosted WOFF2, `font-display: swap`, subset to Latin + kana used   |
| Base size                          | `16px`                                                                 |
| Scale ratio                        | **1.200** (minor third)                                                |
| `--text-3xl`                       | `2.074rem` / 33px                                                      |
| `--text-2xl`                       | `1.728rem` / 27.6px                                                    |
| `--text-xl`                        | `1.440rem` / 23px                                                      |
| `--text-lg`                        | `1.200rem` / 19.2px                                                    |
| `--text-base`                      | `1rem` / 16px                                                          |
| `--text-sm`                        | `0.833rem` / 13.3px                                                    |
| `--text-xs`                        | `0.694rem` / 11.1px                                                    |
| Line height                        | Headings `1.25` · body `1.7`                                           |
| Tracking                           | Display `0.02em` · body `0` · kana label `0.24em`                      |
| Casing                             | No uppercase transforms                                                |

**Note.** Mincho's thin horizontal strokes are more fragile on light backgrounds than dark.
Headings use weight `600` in light mode where dark mode can use `400`.

## Colour

Ratios measured against `--background-color` and `--card-color`; the lower is shown.

### Surfaces

| Token                        | Value                  | Role                      | Contrast | Verdict    |
| ---------------------------- | ---------------------- | ------------------------- | -------- | ---------- |
| `--background-color`         | `#F5EFE3`              | Page — aged paper         | —        | —          |
| `--card-color` / `--card-bg` | `#FFFBF2`              | Card, panel — fresh paper | —        | —          |
| `--surface-raised`           | `#FFFFFF`              | Modal, dropdown           | —        | —          |
| `--input-bg`                 | `#FFFFFF`              | Field fill                | —        | —          |
| `--hover-bg`                 | `rgba(138,84,22,0.06)` | Neutral hover wash        | —        | —          |
| `--border-color`             | `#DDD2BE`              | Decorative separators     | 1.31     | decorative |
| `--border-strong`            | `#8A7D66`              | Form-control borders      | **3.52** | ✅ AA      |

### Content

| Token                 | Value     | Role                       | Contrast  | Verdict |
| --------------------- | --------- | -------------------------- | --------- | ------- |
| `--text-color`        | `#211C15` | Body — warm near-black ink | **14.77** | ✅ AA   |
| `--text-light`        | `#6B6155` | Metadata, handles          | **5.29**  | ✅ AA   |
| `--text-disabled`     | `#877C6C` | Inactive                   | **3.57**  | ✅ (≥3) |
| `--button-text-color` | `#FFFBF2` | On amber fill              | **5.79**  | ✅ AA   |

### Brand roles

The amber is pushed much deeper than the dark variant's `#E8A33D` — that value only reaches
4.27:1 on paper, so it was darkened to `#8A5416` to clear AA for body-size text.

| Token               | Value     | Role                          | Contrast | Verdict |
| ------------------- | --------- | ----------------------------- | -------- | ------- |
| `--primary-color`   | `#8A5416` | Deep amber — interactive      | **5.46** | ✅ AA   |
| `--primary-dark`    | `#6B400F` | Pressed / hover fill          | **7.75** | ✅ AA   |
| `--secondary-color` | `#2F6B62` | Deep teal — counterpoint      | **5.39** | ✅ AA   |
| `--accent-color`    | `#9C3A22` | Persimmon 柿 — rare highlight | **6.03** | ✅ AA   |

### Status

| Token                                | Value     | Contrast | Verdict   |
| ------------------------------------ | --------- | -------- | --------- |
| `--success-color` / `--success-text` | `#2F6B3A` | **5.58** | ✅ AA     |
| `--success-bg`                       | `#E4EFE2` | —        | —         |
| `--error-color` / `--error-text`     | `#A32620` | **6.42** | ✅ AA     |
| `--error-bg`                         | `#F7E4E2` | —        | —         |
| `--error-hover-color`                | `#831C17` | —        | fill only |
| `--disabled-color`                   | `#E5DCCB` | —        | —         |

### Alpha variants

| Token                                        | Value                                    |
| -------------------------------------------- | ---------------------------------------- |
| `--primary-transparent-10 / -15 / -20 / -30` | `rgba(138,84,22, .10 / .15 / .20 / .30)` |
| `--secondary-transparent-10 / -50`           | `rgba(47,107,98, .10 / .50)`             |
| `--accent-transparent-10 / -50`              | `rgba(156,58,34, .10 / .50)`             |
| `--card-bg-transparent-30 / -50 / -80`       | `rgba(255,251,242, .30 / .50 / .80)`     |
| `--text-light-transparent-20 / -30`          | `rgba(107,97,85, .20 / .30)`             |
| `--error-bg-transparent-10`                  | `rgba(163,38,32,0.10)`                   |
| `--card-shadow`                              | `rgba(60,45,25,0.12)`                    |
| `--spinner-bg`                               | `rgba(107,97,85,0.15)`                   |

## Buttons

| Variant     | Fill                       | Border                | Text              | Radius | Padding     | Hover                                  | Active            | Focus                   |
| ----------- | -------------------------- | --------------------- | ----------------- | ------ | ----------- | -------------------------------------- | ----------------- | ----------------------- |
| Primary     | `--primary-color`          | none                  | `#FFFBF2`         | `2px`  | `10px 18px` | fill → `--primary-dark`                | `translateY(1px)` | `0 0 0 2px` @ 30% amber |
| Secondary   | `--primary-transparent-10` | `1px --primary-color` | `--primary-color` | `2px`  | `10px 18px` | fill → 20%                             | `translateY(1px)` | same                    |
| Ghost       | transparent                | `1px --border-strong` | `--text-color`    | `2px`  | `10px 18px` | fill → `--hover-bg`                    | `translateY(1px)` | same                    |
| Destructive | `--error-color`            | none                  | `#FFFBF2`         | `2px`  | `10px 18px` | fill → `--error-hover-color`           | `translateY(1px)` | `0 0 0 2px` @ 30% red   |
| Disabled    | `--disabled-color`         | none                  | `--text-disabled` | `2px`  | `10px 18px` | none                                   | none              | none                    |
| Icon-only   | transparent                | none                  | `--text-light`    | `2px`  | `6px`       | `--hover-bg`, text → `--primary-color` | —                 | same                    |

## Spacing & layout

Identical to the dark variant — spacing does not change between modes.

| Token                     | Value                                               |
| ------------------------- | --------------------------------------------------- |
| Base unit                 | `4px`                                               |
| `--space-1` … `--space-8` | `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64px`             |
| `--card-padding`          | `--space-5` (24px)                                  |
| `--section-gap`           | `--space-7` (48px)                                  |
| `--page-gutter`           | `--space-6` (32px), `--space-4` (16px) below 1100px |
| `--content-max-width`     | `1100px`                                            |
| Card list gap             | `--space-3` (12px)                                  |
| Breakpoints               | `1100px`, `720px`                                   |

## Blocks & surfaces

| Block            | Background                 | Border                      | Radius | Shadow        | Accent rule                    | Hover                      |
| ---------------- | -------------------------- | --------------------------- | ------ | ------------- | ------------------------------ | -------------------------- |
| Page             | `--background-color`       | —                           | —      | —             | —                              | —                          |
| `DataCard`       | `--card-color`             | `1px --border-color`        | `2px`  | `--shadow-sm` | 2px top bar, `--primary-color` | border → `--primary-color` |
| `MemberCard`     | `--card-color`             | `1px --border-color`        | `2px`  | none          | none                           | `--hover-bg`               |
| Modal            | `--surface-raised`         | `1px --border-strong`       | `2px`  | `--shadow-lg` | none                           | —                          |
| `AppHeader`      | `--card-color`             | bottom `1px --border-color` | —      | none          | none                           | —                          |
| `ListChips` chip | `--primary-transparent-10` | `1px --primary-color`       | `2px`  | none          | none                           | fill → 20%                 |
| `Pagination`     | transparent                | top `1px --border-color`    | —      | none          | none                           | —                          |
| Form input       | `--input-bg`               | `1px --border-strong`       | `2px`  | none          | none                           | border → `--primary-color` |
| `LoginForm`      | `--card-color`             | `1px --border-color`        | `2px`  | `--shadow-md` | 2px top bar, `--primary-color` | —                          |
| Empty state      | transparent                | `1px dashed --border-color` | `2px`  | none          | none                           | —                          |
| Loading overlay  | `--card-bg-transparent-80` | —                           | —      | —             | —                              | —                          |

## Motion

Identical to the dark variant.

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
| Paper grain  | `--decor-overlay` | Tiled SVG `feTurbulence`, `opacity: .05`, `mix-blend-mode: multiply` on `body::after` | off     |
| Section rule | `--decor-sheen`   | `linear-gradient(90deg, --primary-color, transparent)` on section `::before`          | off     |
| Gradient     | —                 | _not used by this theme_                                                              | —       |
| Glow         | —                 | _not used by this theme_                                                              | —       |

Grain is slightly stronger and uses `multiply` rather than `overlay` here — on paper it reads
as print texture rather than noise.

## Token map

Paste into `.light-theme` in `src/assets/styles/_variables.css`.

```css
.light-theme {
  /* surfaces */
  --background-color: #f5efe3;
  --card-color: #fffbf2;
  --card-bg: var(--card-color);
  --surface-raised: #ffffff;
  --input-bg: #ffffff;
  --hover-bg: rgba(138, 84, 22, 0.06);
  --border-color: #ddd2be;
  --border-strong: #8a7d66;
  --border-style: 1px solid var(--border-color);

  /* content */
  --text-color: #211c15;
  --text-light: #6b6155;
  --text-disabled: #877c6c;
  --button-text-color: #fffbf2;

  /* brand */
  --primary-color: #8a5416;
  --primary-dark: #6b400f;
  --secondary-color: #2f6b62;
  --accent-color: #9c3a22;

  /* status */
  --success-color: #2f6b3a;
  --success-text: #2f6b3a;
  --success-bg: #e4efe2;
  --error-color: #a32620;
  --error-text: #a32620;
  --error-bg: #f7e4e2;
  --error-hover-color: #831c17;
  --disabled-color: #e5dccb;

  /* alpha */
  --primary-transparent-10: rgba(138, 84, 22, 0.1);
  --primary-transparent-15: rgba(138, 84, 22, 0.15);
  --primary-transparent-20: rgba(138, 84, 22, 0.2);
  --primary-transparent-30: rgba(138, 84, 22, 0.3);
  --secondary-transparent-10: rgba(47, 107, 98, 0.1);
  --secondary-transparent-50: rgba(47, 107, 98, 0.5);
  --accent-transparent-10: rgba(156, 58, 34, 0.1);
  --accent-transparent-50: rgba(156, 58, 34, 0.5);
  --card-bg-transparent-30: rgba(255, 251, 242, 0.3);
  --card-bg-transparent-50: rgba(255, 251, 242, 0.5);
  --card-bg-transparent-80: rgba(255, 251, 242, 0.8);
  --text-light-transparent-20: rgba(107, 97, 85, 0.2);
  --text-light-transparent-30: rgba(107, 97, 85, 0.3);
  --error-bg-transparent-10: rgba(163, 38, 32, 0.1);
  --card-shadow: rgba(60, 45, 25, 0.12);
  --spinner-bg: rgba(107, 97, 85, 0.15);

  /* shape & elevation */
  --shadow-sm: 0 1px 2px var(--card-shadow);
  --shadow-md: 0 2px 6px var(--card-shadow);
  --shadow-lg: 0 8px 28px var(--card-shadow);
  --shadow: var(--shadow-md);
  --focus-ring: 0 0 0 2px var(--primary-transparent-30);

  /* decoration (opt-in) */
  --decor-overlay: none;
  --decor-sheen: linear-gradient(90deg, var(--primary-color), transparent);
}
```

Font, type-scale, spacing, radius and motion tokens are inherited from `:root` — they are
mode-independent and are not redeclared here.

## Preview

```
┌────────────────────────────────────────────────┐
│▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ ← 2px #8A5416
│  リスト                                          │ ← kana micro-label, 11px
│  Design Folks                                   │ ← Mincho 600 19.2px #211C15
│                                                 │
│  42 members · updated 3d ago                    │ ← Plex Mono 13.3px #6B6155
│                                                 │
│  ┌───────────┐  ┌───────────┐                   │
│  │   View    │  │  Curate   │                   │ ← amber fill / amber outline
│  └───────────┘  └───────────┘                   │
└────────────────────────────────────────────────┘
   card #FFFBF2 on page #F5EFE3, 1px #DDD2BE, r2
```

Swatches — `#F5EFE3` `#FFFBF2` `#DDD2BE` `#8A7D66` `#6B6155` `#211C15` · `#8A5416` `#6B400F`
`#2F6B62` `#9C3A22` · `#2F6B3A` `#A32620`

## Migration notes

Beyond swapping the token block:

- `app.css` — `body` must move from `--font-mono` to `--font-body`; heading rules need
  `font-weight: 600` in light mode (mincho hairlines thin out on paper).
- `data-card.css` — `--card-bg` and `--hover-bg` now resolve, so the modal and card action
  hover states will render for the first time.
- `list-form.css` — `--input-bg` now resolves; inputs get a white fill against the paper page,
  which is what the existing rule always intended.
- `action-buttons.css` — `.action-button` hard-codes `border-radius: 0`; switch to
  `var(--radius-sm)`.
- **No component markup changes required**, except the optional kana `<span>`.
