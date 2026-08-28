# Theme B — Poolside プールサイド · Dark

> **Mood:** Hiroshi Nagai's pool at dusk. Deep sky navy, lit water, a coral sun going down.
> Bright and optimistic without being loud.

|           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family    | B — Poolside (プールサイド)                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Mode      | Dark                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Intensity | **Balanced** — the default recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Lineage   | Nagai / Ohtaki / resort AOR — the daytime lineage, after sundown                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Leans on  | [#1 gradient skies](../design/city-pop-aesthetics.md#1-gradient-skies-and-time-of-day-light), [#2 flat geometry](../design/city-pop-aesthetics.md#2-flat-hard-edged-geometry), [#3 tropical accents](../design/city-pop-aesthetics.md#3-high-chroma-tropical-accents-on-a-cool-base), [#4 chrome & water](../design/city-pop-aesthetics.md#4-chrome-glass-and-water-reflection), [#6 horizon rules](../design/city-pop-aesthetics.md#6-horizon-lines-rules-and-perspective-grids) |
| Avoids    | Scanlines, glitch, neon glow                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## Typography

Geometric sans with wide tracking on headings — the sleeve-lettering register, without the
commitment of a serif.

| Element                            | Value                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Display / headings                 | `Outfit` — geometric sans, Latin                                           |
| Body                               | `Inter`                                                                    |
| Data (handles, DIDs, counts, URIs) | `IBM Plex Mono`                                                            |
| Fallback stack                     | `system-ui, sans-serif` throughout                                         |
| Weights loaded                     | Outfit 500/700 · Inter 400/500/600 · Plex Mono 400                         |
| Delivery                           | `@nuxt/fonts` — self-hosted, subset, `font-display: swap`                  |
| Base size                          | `16px`                                                                     |
| Scale ratio                        | **1.250** (major third) — more contrast than A, less than C                |
| `--text-3xl`                       | `2.441rem` / 39px — page title                                             |
| `--text-2xl`                       | `1.953rem` / 31.2px — h2                                                   |
| `--text-xl`                        | `1.563rem` / 25px — h3                                                     |
| `--text-lg`                        | `1.250rem` / 20px — h4, card title                                         |
| `--text-base`                      | `1rem` / 16px — body                                                       |
| `--text-sm`                        | `0.800rem` / 12.8px — metadata                                             |
| `--text-xs`                        | `0.640rem` / 10.2px — fine print                                           |
| Line height                        | Headings `1.2` · body `1.6`                                                |
| Tracking                           | Display `0.06em` · body `0`                                                |
| Casing                             | Display headings `uppercase` at `--text-lg` and below; sentence case above |

**Latin only.** Japanese micro-labels were considered and dropped — the aesthetic is
carried by colour, type and layout without them.

## Colour

Ratios measured against `--background-color` and `--card-color`; the lower is shown.
Target ≥ 4.5:1 for text and brand roles, ≥ 3:1 for disabled text and control borders.

### Surfaces

| Token                        | Value                   | Role                  | Contrast | Verdict    |
| ---------------------------- | ----------------------- | --------------------- | -------- | ---------- |
| `--background-color`         | `#0E1B2A`               | Page — deep dusk navy | —        | —          |
| `--card-color` / `--card-bg` | `#16283C`               | Card, panel           | —        | —          |
| `--surface-raised`           | `#1E344C`               | Modal, dropdown       | —        | —          |
| `--input-bg`                 | `#0A1522`               | Field fill — recessed | —        | —          |
| `--hover-bg`                 | `rgba(69,208,224,0.08)` | Neutral hover wash    | —        | —          |
| `--border-color`             | `#2A4767`               | Decorative separators | 1.82     | decorative |
| `--border-strong`            | `#5F7C99`               | Form-control borders  | **3.44** | ✅ AA      |

### Content

| Token                 | Value     | Role                  | Contrast  | Verdict |
| --------------------- | --------- | --------------------- | --------- | ------- |
| `--text-color`        | `#E6F1F7` | Body — cool off-white | **13.04** | ✅ AA   |
| `--text-light`        | `#93AFC6` | Metadata, handles     | **6.55**  | ✅ AA   |
| `--text-disabled`     | `#6D8AA1` | Inactive              | **4.13**  | ✅ (≥3) |
| `--button-text-color` | `#0E1B2A` | On aqua fill          | **8.09**  | ✅ AA   |

### Brand roles

The clearest expression of [characteristic 3](../design/city-pop-aesthetics.md#3-high-chroma-tropical-accents-on-a-cool-base):
cool primary, warm secondary, high-attention tertiary.

| Token               | Value     | Role                        | Contrast  | Verdict |
| ------------------- | --------- | --------------------------- | --------- | ------- |
| `--primary-color`   | `#45D0E0` | Pool aqua — interactive     | **8.09**  | ✅ AA   |
| `--primary-dark`    | `#2AA7B6` | Pressed / hover fill        | **5.20**  | ✅ AA   |
| `--secondary-color` | `#FF8A6B` | Coral sunset — counterpoint | **6.49**  | ✅ AA   |
| `--accent-color`    | `#FFD166` | Sun yellow — rare highlight | **10.38** | ✅ AA   |

### Status

| Token                                | Value                    | Contrast | Verdict   |
| ------------------------------------ | ------------------------ | -------- | --------- |
| `--success-color` / `--success-text` | `#4FD1A0`                | **7.81** | ✅ AA     |
| `--success-bg`                       | `rgba(79,209,160,0.12)`  | —        | —         |
| `--error-color` / `--error-text`     | `#FF6B6B`                | **5.39** | ✅ AA     |
| `--error-bg`                         | `rgba(255,107,107,0.12)` | —        | —         |
| `--error-hover-color`                | `#E04E4E`                | —        | fill only |
| `--disabled-color`                   | `#2A4767`                | —        | —         |

### Alpha variants

| Token                                        | Value                                     |
| -------------------------------------------- | ----------------------------------------- |
| `--primary-transparent-10 / -15 / -20 / -30` | `rgba(69,208,224, .10 / .15 / .20 / .30)` |
| `--secondary-transparent-10 / -50`           | `rgba(255,138,107, .10 / .50)`            |
| `--accent-transparent-10 / -50`              | `rgba(255,209,102, .10 / .50)`            |
| `--card-bg-transparent-30 / -50 / -80`       | `rgba(22,40,60, .30 / .50 / .80)`         |
| `--text-light-transparent-20 / -30`          | `rgba(147,175,198, .20 / .30)`            |
| `--error-bg-transparent-10`                  | `rgba(255,107,107,0.10)`                  |
| `--card-shadow`                              | `rgba(0,10,20,0.45)`                      |
| `--spinner-bg`                               | `rgba(147,175,198,0.15)`                  |

## Buttons

4px radius. Primary carries a single reflective sheen band —
[characteristic 4](../design/city-pop-aesthetics.md#4-chrome-glass-and-water-reflection) — but
only when decoration is enabled.

| Variant     | Fill                                  | Border                | Text              | Radius | Padding     | Hover                                  | Active            | Focus                  |
| ----------- | ------------------------------------- | --------------------- | ----------------- | ------ | ----------- | -------------------------------------- | ----------------- | ---------------------- |
| Primary     | `--primary-color` (+ `--decor-sheen`) | none                  | `#0E1B2A`         | `4px`  | `11px 20px` | fill → `--primary-dark`                | `translateY(1px)` | `0 0 0 3px` @ 30% aqua |
| Secondary   | `--primary-transparent-10`            | `1px --primary-color` | `--primary-color` | `4px`  | `11px 20px` | fill → 20%                             | `translateY(1px)` | same                   |
| Ghost       | transparent                           | `1px --border-strong` | `--text-color`    | `4px`  | `11px 20px` | fill → `--hover-bg`                    | `translateY(1px)` | same                   |
| Destructive | `--error-color`                       | none                  | `#0E1B2A`         | `4px`  | `11px 20px` | fill → `--error-hover-color`           | `translateY(1px)` | `0 0 0 3px` @ 30% red  |
| Disabled    | `--disabled-color`                    | none                  | `--text-disabled` | `4px`  | `11px 20px` | none                                   | none              | none                   |
| Icon-only   | transparent                           | none                  | `--text-light`    | `4px`  | `7px`       | `--hover-bg`, text → `--primary-color` | —                 | same                   |

## Spacing & layout

| Token                     | Value                                               |
| ------------------------- | --------------------------------------------------- |
| Base unit                 | `4px`                                               |
| `--space-1` … `--space-8` | `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64px`             |
| `--card-padding`          | `--space-5` (24px)                                  |
| `--section-gap`           | `--space-6` (32px)                                  |
| `--page-gutter`           | `--space-6` (32px), `--space-4` (16px) below 1100px |
| `--content-max-width`     | `1200px` — unchanged from today                     |
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

| Token             | Value                                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| `--duration-fast` | `140ms`                                                                    |
| `--duration-base` | `200ms`                                                                    |
| `--ease`          | `cubic-bezier(0.2, 0.8, 0.2, 1)` — slight overshoot, buoyant               |
| `--transition`    | `all var(--duration-base) var(--ease)`                                     |
| Hover             | `translateY(-2px)` + shadow step on cards                                  |
| Press             | `translateY(1px)`                                                          |
| Reduced motion    | `@media (prefers-reduced-motion: reduce)` → durations `0ms`, no transforms |

## Decorative layer

Opt-in behind `[data-decor='on']` on `<html>`. Off by default.

| Effect            | Token              | CSS                                                                              | Default |
| ----------------- | ------------------ | -------------------------------------------------------------------------------- | ------- |
| Dusk sky gradient | `--decor-gradient` | `linear-gradient(180deg, #0A1522 0%, #0E1B2A 55%, #1A2438 100%)` fixed on `body` | off     |
| Header sky wash   | `--decor-gradient` | Same gradient, `background-attachment: fixed` on `.app__header`                  | off     |
| Button sheen      | `--decor-sheen`    | `linear-gradient(180deg, rgba(255,255,255,.18) 0%, transparent 45%)` overlay     | off     |
| Horizon rule      | —                  | 1px `--secondary-color` full-bleed rule between page sections                    | off     |
| Glow / scanlines  | —                  | _not used by this theme_                                                         | —       |

## Token map

Paste into `:root` in `src/assets/styles/_variables.css`.

```css
:root {
  /* fonts */
  --font-display: 'Outfit', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  /* type scale */
  --text-xs: 0.64rem;
  --text-sm: 0.8rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.563rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
  --tracking-normal: 0;
  --tracking-wide: 0.06em;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-bold: 700;

  /* surfaces */
  --background-color: #0e1b2a;
  --card-color: #16283c;
  --card-bg: var(--card-color);
  --surface-raised: #1e344c;
  --input-bg: #0a1522;
  --hover-bg: rgba(69, 208, 224, 0.08);
  --border-color: #2a4767;
  --border-strong: #5f7c99;
  --border-style: 1px solid var(--border-color);

  /* content */
  --text-color: #e6f1f7;
  --text-light: #93afc6;
  --text-disabled: #6d8aa1;
  --button-text-color: #0e1b2a;

  /* brand */
  --primary-color: #45d0e0;
  --primary-dark: #2aa7b6;
  --secondary-color: #ff8a6b;
  --accent-color: #ffd166;

  /* status */
  --success-color: #4fd1a0;
  --success-text: #4fd1a0;
  --success-bg: rgba(79, 209, 160, 0.12);
  --error-color: #ff6b6b;
  --error-text: #ff6b6b;
  --error-bg: rgba(255, 107, 107, 0.12);
  --error-hover-color: #e04e4e;
  --disabled-color: #2a4767;

  /* alpha */
  --primary-transparent-10: rgba(69, 208, 224, 0.1);
  --primary-transparent-15: rgba(69, 208, 224, 0.15);
  --primary-transparent-20: rgba(69, 208, 224, 0.2);
  --primary-transparent-30: rgba(69, 208, 224, 0.3);
  --secondary-transparent-10: rgba(255, 138, 107, 0.1);
  --secondary-transparent-50: rgba(255, 138, 107, 0.5);
  --accent-transparent-10: rgba(255, 209, 102, 0.1);
  --accent-transparent-50: rgba(255, 209, 102, 0.5);
  --card-bg-transparent-30: rgba(22, 40, 60, 0.3);
  --card-bg-transparent-50: rgba(22, 40, 60, 0.5);
  --card-bg-transparent-80: rgba(22, 40, 60, 0.8);
  --text-light-transparent-20: rgba(147, 175, 198, 0.2);
  --text-light-transparent-30: rgba(147, 175, 198, 0.3);
  --error-bg-transparent-10: rgba(255, 107, 107, 0.1);
  --card-shadow: rgba(0, 10, 20, 0.45);
  --spinner-bg: rgba(147, 175, 198, 0.15);

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
  --section-gap: var(--space-6);
  --page-gutter: var(--space-6);
  --content-max-width: 1200px;

  /* shape & elevation */
  --radius-sm: 4px;
  --radius-md: 4px;
  --border-radius: var(--radius-md);
  --shadow-sm: 0 1px 2px var(--card-shadow);
  --shadow-md: 0 4px 12px var(--card-shadow);
  --shadow-lg: 0 12px 32px var(--card-shadow);
  --shadow: var(--shadow-md);
  --focus-ring: 0 0 0 3px var(--primary-transparent-30);

  /* motion */
  --duration-fast: 140ms;
  --duration-base: 200ms;
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --transition: all var(--duration-base) var(--ease);

  /* decoration (opt-in) */
  --decor-gradient: linear-gradient(
    180deg,
    #0a1522 0%,
    #0e1b2a 55%,
    #1a2438 100%
  );
  --decor-sheen: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.18) 0%,
    transparent 45%
  );
}
```

## Preview

```
┌────────────────────────────────────────────────┐
│▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ ← 2px #45D0E0

│  D E S I G N   F O L K S                        │ ← Outfit 700 20px, +0.06em
│                                                 │
│  42 members · updated 3d ago                    │ ← Plex Mono 12.8px #93AFC6
│                                                 │
│  ╭───────────╮  ╭───────────╮                   │
│  │   View    │  │  Curate   │                   │ ← aqua fill / aqua outline
│  ╰───────────╯  ╰───────────╯                   │
└────────────────────────────────────────────────┘
   card #16283C on page #0E1B2A, 1px #2A4767, r4
```

Swatches — `#0E1B2A` `#16283C` `#2A4767` `#5F7C99` `#93AFC6` `#E6F1F7` · `#45D0E0` `#2AA7B6`
`#FF8A6B` `#FFD166` · `#4FD1A0` `#FF6B6B`

## Migration notes

Beyond swapping the token block:

- `app.css` — `body` must move from `--font-mono` to `--font-body`; add font preloads. If
  decoration is enabled, `body` also needs `background-image: var(--decor-gradient)` and
  `background-attachment: fixed`.
- `app-header.css` — currently `background-color: var(--card-color)`; gains an optional
  gradient layer.
- `data-card.css` — `--card-bg` and `--hover-bg` now resolve. The existing `translateY(-2px)`
  hover already matches this theme's motion spec; only the easing changes.
- `action-buttons.css` — `.action-button` hard-codes `border-radius: 0`; switch to
  `var(--radius-sm)`. The sheen is an extra `::after` layer, gated on `[data-decor='on']`.
- **No component markup changes required.**
