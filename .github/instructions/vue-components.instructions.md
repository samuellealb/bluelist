---
description: 'Use when creating or editing Vue components or pages in Bluelist (src/components/**/*.vue, pages/**/*.vue). Covers <script setup>, typed props, BEM CSS, per-component CSS imports, and store/service usage.'
applyTo: ['src/components/**/*.vue', 'pages/**/*.vue', 'app.vue', 'error.vue']
---

# Vue Component & Page Conventions

- Use `<script setup lang="ts">` with the Composition API. Type props with an
  interface and `defineProps<Props>()`.
- Component filenames are **PascalCase** (e.g. `DataCard.vue`).
- Access state through Pinia stores (`useAuthStore`, `useUiStore`, etc.) and
  business logic through `src/lib/` services — never call `AtpAgent` directly.
- Render list/follow/timeline data via the shared `DataObject` union; switch on
  `item.type`. If you introduce a new `type`, extend the union in
  [src/types/misc-types.ts](../../src/types/misc-types.ts) and add a matching
  branch in `DataCard.vue`.

## CSS

- Use **BEM** class names: `block__element--modifier`
  (e.g. `data-card__action-button--edit`).
- Put styles in a dedicated file under `src/assets/styles/` and import it inside
  `<script setup>`:

  ```ts
  import '~/src/assets/styles/data-card.css';
  ```

- Shared design tokens live in `src/assets/styles/_variables.css`; reference CSS
  variables rather than hardcoding colors.

## Imports

Use the `~` alias for source (`~/src/stores/auth`) and Nuxt aliases
(`#imports`, `#app`) for framework composables like `navigateTo` and
`useRuntimeConfig`.
