# Icons

This directory contains the two 24 by 24 SVG glyphs used for theme state.
Both icons use `currentColor` strokes. `ThemeToggle.vue` loads them through
`<img>` elements, so its CSS filters determine their rendered color rather than
CSS color inheritance from the consuming element.

| File       | Visual role                                                      | Use relationship                                                                                                    |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `moon.svg` | Outlined crescent moon glyph for the dark-theme state or action. | Uses a single rounded `currentColor` path; displayed through the theme-toggle image filters.                        |
| `sun.svg`  | Outlined sun glyph for the light-theme state or action.          | Uses `currentColor` for its center circle and eight rounded rays; displayed through the theme-toggle image filters. |

The glyphs share the same view box and dimensions, so they can be swapped
without changing the control's layout.
