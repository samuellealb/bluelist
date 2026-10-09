# Assets

This directory contains the application's shared visual resources. Its immediate
children separate small reusable visual files from the stylesheet system that
defines how those resources and the interface are presented.

| Directory | Boundary                                | Consumption                                                                                                                                                                                           |
| --------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icons/`  | Theme-control SVG glyphs only.          | `moon.svg` and `sun.svg` share 24 by 24 dimensions and use `currentColor`; `ThemeToggle.vue` loads them as images and applies theme-specific CSS filters while swapping them without changing layout. |
| `styles/` | Global tokens and component-scoped CSS. | `app.css` imports `_variables.css` to establish the shared theme. Vue components import their matching BEM-scoped stylesheet, which consumes those global custom properties.                          |

## Thematic Role

The stylesheet system gives Bluelist a dark-first, monospace, terminal-like
appearance. `_variables.css` defines the dark defaults and the `.light-theme`
overrides for shared colors, typography, borders, shadows, and transitions.
`app.css` applies those tokens to the document and application shell, while the
remaining stylesheets isolate component presentation through BEM selector
namespaces. The theme toggle combines the two directories: its styles control
the icon container and theme-specific image filtering for the SVGs.
