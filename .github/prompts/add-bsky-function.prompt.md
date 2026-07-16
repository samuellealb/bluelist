---
description: "Add a new function to src/lib/bskyService.ts following Bluelist's auth-guard, agent, DataObject return, and store-sync conventions."
agent: 'agent'
argument-hint: 'Describe the Bluesky operation to add'
---

Add a new function to [src/lib/bskyService.ts](../../src/lib/bskyService.ts)
following the standard shape:

1. Guard auth: `if (!authStore.isLoggedIn) throw new Error('Please login first');`
2. Get the agent via `AtpService.getAgent()` / `getBskyAgent()` (never
   `new AtpAgent`).
3. Wrap the request in try/catch; on error check
   `message === 'Token has expired' → authStore.handleSessionExpired()` then
   rethrow a descriptive error.
4. For **reads**: build a `DataObject`, `$patch` the relevant store, and return
   `{ displayData, ...JSON }` (keep the JSON string in sync).
5. For **writes**: update the affected store slice and any caches; call
   `addMapping(uri, name)` for list operations.
6. Add/extend types in `src/types/` and re-export from `src/types/index.ts`;
   if it's a new view type, add a `DataCard.vue` branch.

Ask what data is read/written and which view renders it if unclear, then
implement the function. Finish by suggesting `yarn lint`.
