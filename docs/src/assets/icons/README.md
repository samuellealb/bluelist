# Icons

This directory contains the two 24 by 24 SVG glyphs used for theme state.
Both icons use `currentColor` strokes, so their rendered color is inherited
from the consuming element's CSS.

| File       | Visual role                                                      | Use relationship                                                                                                                            |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `moon.svg` | Outlined crescent moon glyph for the dark-theme state or action. | Uses a single rounded `currentColor` path; intended to inherit its color from the surrounding theme-control styling.                        |
| `sun.svg`  | Outlined sun glyph for the light-theme state or action.          | Uses `currentColor` for its center circle and eight rounded rays; intended to inherit its color from the surrounding theme-control styling. |

The glyphs share the same view box and dimensions, so they can be swapped
without changing the control's layout.
