# Japanese City Pop — Visual Research

Research backing the Bluelist visual redesign. Distils the city pop aesthetic into concrete
UI levers so the theme proposals in [`docs/themes/`](../themes/README.md) are grounded in
something other than taste.

## Context

City pop (シティ・ポップ) is a loosely defined Japanese pop genre that emerged mid-1970s and
peaked in the 1980s — "urban pop music for those with urban lifestyles" (Yutaka Kimura). It
was inextricably tied to Japan's tech-fuelled economic bubble and the wealthy new leisure
class it created: the Walkman, car cassette decks, the Yamaha CS-80, the TR-808.

Critically for us, **the genre is remembered visually as much as musically**. Its look was
established by illustrators — above all **Hiroshi Nagai** (永井博), whose covers for Eiichi
Ohtaki's _A Long Vacation_ (1981) and _Niagara Song Book_ define the canon: flat tropical
Americana, swimming pools, palms, gradient skies, hard-edged pop-art planes, drawn under a
declared David Hockney influence after travels through the US and Guam in 1973–75.

The 2010s revival (Mariya Takeuchi's "Plastic Love", Miki Matsubara's "Mayonaka no Door")
arrived through YouTube algorithms and carried a second visual layer with it: **vaporwave and
future funk** — Memphis-Milano geometry, VHS degradation, glitch art, fullwidth characters
(ＡＥＳＴＨＥＴＩＣ), 1990s web imagery, Greco-Roman statues. Future funk in particular samples
city pop directly and borrows 1980s–90s anime imagery.

Two distinct moods are therefore available to us, and they are not the same thing:

|         | Daytime lineage                     | Nighttime lineage                      |
| ------- | ----------------------------------- | -------------------------------------- |
| Source  | Nagai / Ohtaki / resort AOR         | Plastic Love / vaporwave / future funk |
| Palette | Aqua, coral, sun-yellow on sky blue | Magenta, cyan, violet on ink black     |
| Feeling | Optimistic, spacious, sunlit        | Nocturnal, electric, nostalgic         |
| Risk    | Can read as generic "flat design"   | Can read as meme / cliché              |

A third, quieter lineage sits underneath both: **Showa retro** (昭和レトロ) — the kissaten
coffee-shop, vinyl liner notes, 1970s Japanese print. Warm, literary, low-saturation. This is
the least-exploited and most UI-appropriate register.

## The eight actionable characteristics

Each characteristic is paired with the specific UI lever it maps to. The theme proposals are
scored against these.

### 1. Gradient skies and time-of-day light

Nagai's skies are vertical gradients — deep blue at the zenith falling to coral and gold at
the horizon. The time of day _is_ the mood.

**UI lever.** Page-background gradients, header washes, hero blocks. A theme picks a time of
day and commits: noon (light) or dusk/midnight (dark). Applies to `--background-color` and the
`AppHeader` surface.

### 2. Flat, hard-edged geometry

Pop-art flatness: solid colour planes, crisp boundaries, no texture inside a shape, no soft
shading. Buildings, pools and palms are cut-out silhouettes.

**UI lever.** Low or zero `border-radius`, solid fills over gradients on small elements,
minimal blur on shadows. Argues _against_ the current 10px radius and soft `0 4px 6px` shadow.

### 3. High-chroma tropical accents on a cool base

A restrained cool ground (navy, charcoal, ink) carrying two or three very saturated accents:
turquoise/aqua, coral/persimmon, sun-yellow, magenta.

**UI lever.** A three-role colour system — **primary = cool** (the interactive colour),
**secondary = warm** (counterpoint, emphasis), **tertiary/accent = highlight** (rare, high
attention). Bluelist currently has these tokens but uses them inconsistently.

### 4. Chrome, glass and water reflection

Pool surfaces, car chrome, glass towers. Light is reflected, not diffused.

**UI lever.** Subtle `linear-gradient` sheens on primary buttons and card headers — a single
highlight band, not a full glossy gradient. Used sparingly; this is the easiest lever to
overdo into skeuomorphism.

### 5. Bilingual typographic pairing

Sleeve typography pairs a Latin display face with Japanese kana/mincho, usually with wide
letter-spacing on the romaji and the Japanese set much smaller as a secondary label.

**UI lever.** A display font for headings with deliberate `letter-spacing`, plus optional
Japanese micro-labels. **Decision: kana appear only as decorative micro-labels in section
headers** — never as functional UI text, so no i18n burden is introduced.

### 6. Horizon lines, rules and perspective grids

Strong horizontal division of the frame; thin rules; the vaporwave perspective grid receding
to a vanishing point.

**UI lever.** Accent rules at the top of surfaces and between sections. Bluelist already has
this motif — [`.data-card::before`](../../src/assets/styles/data-card.css) draws a 2px
`--primary-color` bar across the top of every card. The redesign formalises it as a system
rather than a one-off.

### 7. Album-cover composition and negative space

One focal subject, asymmetric placement, generous emptiness. A 12-inch sleeve is a
low-density, high-impact format.

**UI lever.** A larger spacing scale, wider page gutters, more room around cards. Bluelist
currently hard-codes spacing per component (`0.75rem`, `1rem`, `16px`, `20px` all appear);
a shared scale is a prerequisite.

### 8. Analog nostalgia layer

VHS tracking artifacts, print halftone and grain, chromatic fringing, neon bleed at night.
This is the vaporwave contribution, and it is pure decoration.

**UI lever.** Optional overlays and glow shadows. **Decision: every decorative overlay is
opt-in behind a `[data-decor='on']` attribute on `<html>`**, defaulting to off. This keeps the
aesthetic from taxing readability or paint performance, and makes it trivially removable.

## Applying this to Bluelist specifically

Bluelist is a list-management tool for Bluesky follows — dense, repetitive, read-heavy
surfaces (`DataCard`, `MemberCard`, `ListChips`, `Pagination`). Two consequences:

- **The aesthetic must live in the chrome, not the content.** Headers, buttons, rules, empty
  states and accents carry the theme. Rows of handles and display names stay quiet and legible.
- **The current global monospace is the wrong signal.** [`app.css`](../../src/assets/styles/app.css)
  sets `body { font-family: var(--font-mono) }`, which reads as terminal/hacker, not as
  1980s Tokyo leisure. All three proposals retain mono for **data** (handles, DIDs, counts,
  URIs) and introduce a display face for headings and a humanist sans for body copy.

## Sources

- [City pop — Wikipedia](https://en.wikipedia.org/wiki/City_pop) — definitions, origins, the
  tech-boom context, the 21st-century resurgence.
- [Hiroshi Nagai — Wikipedia](https://en.wikipedia.org/wiki/Hiroshi_Nagai) — biography, the
  Hockney/pop-art influence, _A Long Vacation_, influence on vaporwave.
- [Vaporwave — Wikipedia](https://en.wikipedia.org/wiki/Vaporwave) — the visual aesthetic
  (glitch art, Memphis Milano geometry, VHS degradation, fullwidth type), future funk's
  sampling of city pop.
