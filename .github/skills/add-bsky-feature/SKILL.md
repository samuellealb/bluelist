---
name: add-bsky-feature
description: 'Implement a new Bluesky feature in Bluelist end-to-end across the service, store, types, DataObject, and UI layers. Use when adding a new Bluesky read/write operation or a new data view (e.g. new list action, new feed type, batch operation) and you need it wired through the full stack correctly.'
argument-hint: 'Describe the feature (e.g. "batch-remove members from a list")'
---

# Add a Bluesky Feature (Full Stack)

Use this skill to add a Bluesky-backed feature that flows through Bluelist's
layers consistently. Read [data-flow.md](./references/data-flow.md) for the
architecture and use [checklist.md](./references/checklist.md) to verify nothing
is missed.

## When to Use

- Adding a new Bluesky read (a new view/`DataObject` type) or write operation.
- Adding list/member actions (create, update, delete, add/remove, batch).
- Any feature that must touch service → store → types → component.

## Procedure

1. **Clarify the feature** — what data is read/written, which view renders it,
   and whether it is a new `DataObject` type or reuses an existing one.

2. **Types first** (`src/types/`)

   - Define/extend item types in the right domain file.
   - If it's a new view, add the literal to `DataObject['type']` and the item
     type to the `data` union in `misc-types.ts`.
   - Re-export via `src/types/index.ts`.

3. **Service** (`src/lib/bskyService.ts`)

   - Add the function following the standard shape: guard `isLoggedIn`, get the
     agent via `AtpService`, wrap in try/catch with the
     `'Token has expired' → handleSessionExpired()` check.
   - For reads, return `{ displayData: DataObject, ...JSON }` and `$patch` the
     store. For writes, update the affected store slice and any caches.
   - For lists, call `addMapping(uri, name)` so slugs resolve.

4. **Store** (`src/stores/`)

   - Add state/actions/getters needed (pagination slice if paginated).
   - Access other stores via their composable inside actions.

5. **UI** (`src/components/`, `pages/`)

   - If a new `DataObject` type: add a render branch in `DataCard.vue`.
   - Wire the trigger (button/page) to the service function; reflect
     loading/error via the `ui` store's `displayData`.

6. **Verify** — walk [checklist.md](./references/checklist.md), then run
   `yarn lint`.

## Reference

- [Data flow & contracts](./references/data-flow.md)
- [Completion checklist](./references/checklist.md)
