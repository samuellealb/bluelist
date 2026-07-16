---
description: 'Use when creating or editing Bluelist service logic in src/lib (bskyService, AtpService, openai). Covers the AtpService agent singleton, the DataObject return contract, auth guards, token-expiry handling, and store synchronization.'
applyTo: 'src/lib/**/*.ts'
---

# Service Layer Conventions (`src/lib/`)

All Bluesky and AI logic lives here, framework-agnostic where possible.

## Getting the ATP agent

Always obtain the agent through `AtpService` — never construct `AtpAgent`
directly:

```ts
import { AtpService } from '~/src/lib/AtpService';
const agent = AtpService.getAgent(); // or getBskyAgent() for graph APIs
```

## Standard function shape (bskyService)

Every Bluesky operation must:

1. Guard authentication:

   ```ts
   const authStore = useAuthStore();
   if (!authStore.isLoggedIn) throw new Error('Please login first');
   ```

2. Perform the request via the agent inside a `try` block.
3. Handle expired sessions in `catch`:

   ```ts
   if ((error as Error).message === 'Token has expired') {
     authStore.handleSessionExpired();
   }
   ```

4. **Read functions** return `{ displayData: DataObject, ...JSON }` **and** write
   the same data into the relevant store via `store.$patch({...})`. Keep the
   structured data and the JSON string field in sync.

## Pagination

Use cursor-based pagination with prefetch: fetch the next batch only when the
requested page exceeds cached pages and a `cursor` exists; append to the store's
`all*` array and advance `prefetchedPages`. Respect the store's `isFetching`
flag to avoid concurrent fetches.

## AI (`openai.ts`)

`curateUserLists()` must check `suggestionsStore.hasReachedLimit()` before
calling `/api/openai`, and must not embed the OpenAI key client-side — that stays
in the server route. Register list slugs with `addMapping(uri, name)` when
lists are fetched.
