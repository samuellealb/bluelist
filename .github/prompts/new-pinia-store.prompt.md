---
description: 'Scaffold a new Pinia options-API store for Bluelist with the standard state/actions/getters and pagination slice pattern.'
agent: 'agent'
argument-hint: 'Store name and what it manages'
---

Create a new Pinia store in `src/stores/` using the **options API**:

```ts
export const useXStore = defineStore('x', {
  state: () => ({
    /* ... */
  }),
  getters: {
    /* ... */
  },
  actions: {
    /* ... */
  },
});
```

Requirements:

- Provide explicit action methods for state changes (no external mutation).
- If the store holds paginated data, use the standard slice shape
  (`allItems`, `currentPage`, `hasMorePages`, `cursor`, `prefetchedPages`,
  `itemsPerPage`, `isFetching`).
- Access other stores via their composable inside actions.
- Persist per-user data to `localStorage` keyed by DID when relevant, wrapped in
  try/catch.
- Add any needed types to `src/types/` and re-export from `src/types/index.ts`.

Ask what the store manages if not provided, then generate the store file.
