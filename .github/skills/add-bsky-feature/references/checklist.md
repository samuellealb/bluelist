# Completion Checklist

## Types

- [ ] Item type defined/updated in the correct `src/types/*-types.ts` file.
- [ ] For a new view: literal added to `DataObject['type']` and item type added
      to the `data` union in `misc-types.ts`.
- [ ] New types re-exported through `src/types/index.ts`.

## Service (`src/lib/bskyService.ts`)

- [ ] Agent obtained via `AtpService.getAgent()` / `getBskyAgent()` (not `new AtpAgent`).
- [ ] Guards `authStore.isLoggedIn` and throws `'Please login first'`.
- [ ] try/catch handles `'Token has expired' → authStore.handleSessionExpired()`.
- [ ] Read fn returns `{ displayData: DataObject, ...JSON }` AND `$patch`es the store.
- [ ] Write fn updates the affected store slice and any caches (e.g. `memberCountsCache`).
- [ ] List operations call `addMapping(uri, name)`.

## Store (`src/stores/`)

- [ ] New state/actions/getters added; pagination slice shape matches existing ones.
- [ ] `isFetching` guards concurrent fetches (paginated data).
- [ ] Cross-store access happens inside actions via composables.
- [ ] JSON string field kept in sync with structured data.

## UI (`src/components/`, `pages/`)

- [ ] `DataCard.vue` has a branch for any new `DataObject` type.
- [ ] Trigger wired to the service; loading/error surfaced via `ui.displayData`.
- [ ] BEM classes + a per-component CSS file imported in `<script setup>`.

## Verify

- [ ] `yarn lint` passes.
- [ ] Manual check of the new flow in `yarn dev`.
