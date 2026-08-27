---
description: 'Use when creating or editing TypeScript types in Bluelist (src/types/**). Covers the domain-split type files, the central index barrel, and the DataObject discriminated union that drives rendering.'
applyTo: 'src/types/**/*.ts'
---

# Type Conventions (`src/types/`)

Types are split by domain and re-exported from a central barrel.

- **One domain per file:** `auth-types.ts`, `bsky-types.ts`, `follows-types.ts`,
  `lists-types.ts`, `suggestions-types.ts`, `misc-types.ts`. Re-export everything
  through [src/types/index.ts](../../src/types/index.ts) so consumers import from
  `~/src/types` or `~/src/types/index`.
- **`DataObject`** (in `misc-types.ts`) is the discriminated union rendered by
  `DataCard.vue`. When adding a view type:
  1. Add the new string literal to `DataObject['type']`.
  2. Add its item type to the `data` union (and define that item type in the
     appropriate domain file).
  3. Add a matching render branch in `DataCard.vue`.
- Keep `pagination` and `listInfo` optional and consistent with existing views.
- Prefer explicit `interface` declarations for object shapes; use `import('./x')`
  type-only references sparingly, matching the existing style in `misc-types.ts`.
- Avoid `any`; the project runs strict TypeScript with `typeCheck: true`.
