---
description: 'Use when creating or editing Pinia stores in Bluelist (src/stores/**). Covers the options-API store shape, cross-store access, pagination slices, session handling, and localStorage patterns.'
applyTo: 'src/stores/**/*.ts'
---

# Pinia Store Conventions

Stores use the **options API**: `defineStore('name', { state, getters, actions })`.

- **Cross-store access:** call the other store's composable _inside_ an action,
  not at module top level — e.g. `const suggestionsStore = useSuggestionsStore();`.
- **State mutations:** prefer explicit action methods (e.g. `setFollows`,
  `setCursor`) over mutating state from outside the store.
- **Pagination slices:** paginated data (follows, lists, members) follows a
  consistent shape:

  ```ts
  {
    allItems: [] as Item[],
    currentPage: 1,
    hasMorePages: false,
    cursor: null as string | null,
    prefetchedPages: 0,
    itemsPerPage: 10,      // follows use 20
    isFetching: false,
  }
  ```

  Guard concurrent fetches with `isFetching`.

- **localStorage:** persist per-user data keyed by DID
  (e.g. `suggestionRequests_${did}`, `loginData`, `bluelist_slug_mappings`).
  Wrap reads/writes in try/catch and reset to a safe default on parse failure.
- **Session expiry:** the `auth` store owns `handleSessionExpired()`; services
  call it. Don't duplicate reload/logout logic elsewhere.
- Keep the JSON string fields (e.g. `listsJSON`, `usersJSON`, `timelineJSON`) in
  sync with their structured counterparts when a service updates the store.
