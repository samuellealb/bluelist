# Bluelist Theme Proposals — City Pop Redesign

Six specifications: three theme families × dark and light. **Pick one family.** Nothing here
has been applied to `src/` — these are proposals only.

## ▶ Start here — live previews

Open these in a browser. They render the real tokens on mock Bluelist surfaces, with working
dark/light and decoration toggles.

|                                                        |                                                            |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| **[index.html](index.html)**                           | All six variants side by side — the fastest way to compare |
| [theme-a-kissaten.html](theme-a-kissaten.html)         | Theme A, full preview                                      |
| [theme-b-poolside.html](theme-b-poolside.html)         | Theme B, full preview                                      |
| [theme-c-bayside-neon.html](theme-c-bayside-neon.html) | Theme C, full preview                                      |

```sh
open docs/themes/index.html
```

Each preview includes palette swatches with measured contrast, a type specimen, every button
state, a mock header/card/member-row/chips/pagination/form, the spacing scale, and the full
contrast record. The previews load fonts from Google Fonts for convenience; production is
self-hosted WOFF2.

Background reading:

- [City pop visual research](../design/city-pop-aesthetics.md) — the eight characteristics
  every proposal is scored against.
- [Token audit & target schema](../design/token-schema.md) — current defects and the contract
  all six proposals fill.

## The six artifacts

| Family                          | Dark                                                         | Light                                                          |
| ------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| **A — Kissaten** 喫茶店         | [theme-a-kissaten-dark.md](theme-a-kissaten-dark.md)         | [theme-a-kissaten-light.md](theme-a-kissaten-light.md)         |
| **B — Poolside** プールサイド   | [theme-b-poolside-dark.md](theme-b-poolside-dark.md)         | [theme-b-poolside-light.md](theme-b-poolside-light.md)         |
| **C — Bayside Neon** 湾岸ネオン | [theme-c-bayside-neon-dark.md](theme-c-bayside-neon-dark.md) | [theme-c-bayside-neon-light.md](theme-c-bayside-neon-light.md) |

Each artifact has the same eleven sections in the same order, so diffing any two shows only
value changes.

## Comparison matrix

|                            | **A — Kissaten**                               | **B — Poolside**                     | **C — Bayside Neon**                   |
| -------------------------- | ---------------------------------------------- | ------------------------------------ | -------------------------------------- |
| Intensity                  | Restrained / editorial                         | **Balanced**                         | Maximalist                             |
| Reference                  | Showa kissaten, vinyl liner notes, 1970s print | Hiroshi Nagai pools & gradient skies | Midnight Tokyo, vaporwave, future funk |
| Mood                       | Warm, quiet, literary                          | Bright, optimistic, spacious         | Electric, nocturnal, synthetic         |
| Dark page                  | `#15120E` warm charcoal                        | `#0E1B2A` dusk navy                  | `#0A0614` ink violet-black             |
| Light page                 | `#F5EFE3` aged paper                           | `#EAF6FA` pale sky                   | `#F6F0FA` lilac-white                  |
| Primary (dark · light)     | `#E8A33D` · `#8A5416` amber                    | `#45D0E0` · `#00707F` aqua           | `#FF4DA6` · `#C2005E` magenta          |
| Secondary                  | `#5FA398` · `#2F6B62` teal                     | `#FF8A6B` · `#C2410C` coral          | `#35E8FF` · `#006B85` cyan             |
| Tertiary                   | `#D4674A` · `#9C3A22` persimmon                | `#FFD166` · `#8A5406` sun            | `#B96BFF` · `#6D28D9` violet           |
| Display font               | Shippori Mincho B1 (serif)                     | Outfit (geometric sans)              | Chakra Petch (wide techno)             |
| Type scale                 | 1.200 minor third                              | 1.250 major third                    | 1.333 perfect fourth                   |
| Radius                     | `2px`                                          | `4px`                                | `0`                                    |
| Spacing base               | `4px`                                          | `4px`                                | `8px`                                  |
| Elevation                  | Hairline borders, near-flat                    | Soft shadow, 2px card lift           | Glow (dark) / hard offset (light)      |
| Motion                     | `160ms`, colour only                           | `200ms`, buoyant lift                | `140ms`, sharp, no lift                |
| Decoration                 | Paper grain                                    | Sky gradients, sheen                 | Scanlines, glow, grid horizon          |
| CSS work beyond token swap | Minimal                                        | Small                                | **Significant**                        |
| Risk                       | Lowest                                         | Low                                  | Highest                                |

## How to choose

Some questions that actually discriminate between these:

**Should Bluelist feel like a document or an interface?** A treats the app as a printed page —
serif headings, generous leading, hairlines. C treats it as signage. B sits between.

**How much of the app is dense list content?** Bluelist is mostly repeating rows —
`MemberCard`, `follows`, `Pagination`. The louder the theme, the more that repetition costs.
A and B degrade gracefully at high density; C needs its decoration left off to do so.

**Do you want the aesthetic legible to someone who doesn't know the reference?** B reads as
"nice, bright, tropical" to anyone. A reads as "tasteful" without announcing itself. C reads
as "vaporwave" specifically — which is either the point or the problem.

**How much CSS work is acceptable?** A and B are essentially token swaps. C needs real
structural changes: gradient rules can't be `border-color`, so `AppHeader` and the modal need
new pseudo-elements, and the larger spacing scale reflows list density.

If undecided, **B — Poolside** is the recommendation. It carries the most city pop
characteristics (five of eight, including the gradient skies and tropical-accent structure
that most define Nagai's work) at a cost close to A's.

## What all six share

Decisions applied uniformly, so they are not differentiators:

- **Monospace is demoted.** Today `body` is `--font-mono`, which reads terminal, not city pop.
  All three families keep mono for **data only** — handles, DIDs, counts, URIs, timestamps —
  and add a display face for headings plus Inter for body copy.
- **Latin only.** Japanese micro-labels were proposed and then dropped during implementation;
  the aesthetic is carried by colour, type and layout. Themes A and C below still describe
  them, as originally proposed.
- **Decoration is opt-in.** Every gradient, grain, glow, scanline and sheen sits behind
  `[data-decor='on']` on `<html>` and defaults to off.
- **Fonts are self-hosted** via the `@nuxt/fonts` module — subset, `font-display: swap`,
  no third-party request at runtime.
- **All text clears WCAG AA.** Body and brand colours ≥ 4.5:1 against both page and card;
  disabled text and form-control borders ≥ 3:1.
- **The audit bugs are fixed as a side effect.** Every proposal derives its alpha variants from
  its own base colour and defines all ten currently-undefined tokens. See the
  [audit](../design/token-schema.md#audit-findings).

## Verified contrast

Every value was computed with the WCAG 2.1 relative-luminance formula against that theme's own
`--background-color` and `--card-color`; the reported figure is the **lower** of the two. All
six palettes pass. Several values were adjusted during authoring specifically to clear the
thresholds:

| Adjustment                                        | Reason                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| All six `--border-strong` values introduced       | No existing border reached 3:1; form-control borders need it (SC 1.4.11)                     |
| Four light-mode `--text-disabled` values darkened | Original picks sat at 2.4–2.8:1                                                              |
| A-light primary `#B4762A` → `#8A5416`             | 4.27:1 was large-text only                                                                   |
| B-light accent `#A16207` → `#8A5406`              | Marginal at 4.47:1                                                                           |
| C-dark `--primary-dark` `#D62E85` → `#E8479A`     | 4.37:1; brightened rather than darkened, since a darker pressed state vanishes on near-black |
| A-dark error `#D9584E` → `#E0655A`                | Landed exactly on the 4.50 boundary                                                          |

## Next step

Choose a family. Implementation is then:

1. Replace the `:root` and `.light-theme` blocks in
   [`_variables.css`](../../src/assets/styles/_variables.css) with that family's two token maps.
2. Add the self-hosted fonts and switch `body` in
   [`app.css`](../../src/assets/styles/app.css) from `--font-mono` to `--font-body`.
3. Work through the chosen artifact's **Migration notes** section.
4. Sweep the twelve component stylesheets for hard-coded spacing and radius.

No change to [`ThemeToggle.vue`](../../src/components/ThemeToggle.vue) is needed — it toggles
the `light-theme` class, which is exactly the mechanism these proposals target. A runtime
switcher offering more than one family at once would be a separate piece of work.
