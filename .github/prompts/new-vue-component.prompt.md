---
description: 'Scaffold a new Vue component for Bluelist following project conventions (script setup, typed props, BEM, per-component CSS).'
agent: 'agent'
argument-hint: 'Component name and purpose'
---

Create a new Vue component in `src/components/` following Bluelist conventions:

- PascalCase filename; `<script setup lang="ts">`.
- Type props with an interface and `defineProps<Props>()`.
- Read state via Pinia stores and logic via `src/lib/` services — never call
  `AtpAgent` directly.
- If it renders `DataObject` items, switch on `item.type` and reuse existing
  item types.
- Use BEM class names (`block__element--modifier`).
- Create a matching CSS file in `src/assets/styles/` and import it in
  `<script setup>` (e.g. `import '~/src/assets/styles/my-component.css';`);
  reference tokens from `_variables.css`.

Ask for the component name and its responsibility if not provided, then generate
the `.vue` file and its CSS file.
