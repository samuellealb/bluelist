---
description: 'Use when creating or editing Bluelist service logic in src/lib (bskyService, OAuthService, aiSuggestions). Covers getting the OAuth-authenticated agent, the DataObject return contract, auth guards, and store synchronization.'
applyTo: 'src/lib/**/*.ts'
---

# Service Layer Conventions (`src/lib/`)

All Bluesky and AI logic lives here, framework-agnostic where possible.

## Getting the ATP agent

Always obtain the agent through `authStore.getAgent()` — never construct
`AtpAgent`/`Agent` directly; a standalone agent has no OAuth session and every
call will 401:

```ts
import { useAuthStore } from '~/src/stores/auth';
const authStore = useAuthStore();
const agent = authStore.getAgent(); // null if not logged in
```

## Standard function shape (bskyService)

Every Bluesky operation must:

1. Guard authentication:

   ```ts
   const authStore = useAuthStore();
   if (!authStore.isLoggedIn) throw new Error('Please login first');
   ```

2. Perform the request via the agent inside a `try` block.
3. On error, log and rethrow a user-facing error. Session expiry is handled
   centrally via the OAuth client's `'deleted'` event
   (`OAuthService.onSessionDeleted` → `authStore.handleSessionExpired()`), not
   per call site.
4. **Read functions** return `{ displayData: DataObject, ...JSON }` **and** write
   the same data into the relevant store via `store.$patch({...})`. Keep the
   structured data and the JSON string field in sync.

## Pagination

Use cursor-based pagination with prefetch: fetch the next batch only when the
requested page exceeds cached pages and a `cursor` exists; append to the store's
`all*` array and advance `prefetchedPages`. Respect the store's `isFetching`
flag to avoid concurrent fetches.

## AI (`aiSuggestions.ts`)

`curateUserLists()` must check `suggestionsStore.hasReachedLimit()` before
calling `/api/suggestions`, and must not embed the Anthropic key client-side —
that stays in the server route. Register list slugs with `addMapping(uri, name)`
when lists are fetched.
