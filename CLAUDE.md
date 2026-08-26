# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Start with [AGENTS.md](AGENTS.md) — it has the always-on stack summary, build/verify
commands, and the critical conventions (ATP agent access, `bskyService` guard/expiry
pattern, `DataObject` contract, Pinia store access, slug registration, secrets).
This file adds detail AGENTS.md omits for brevity: the full data-flow picture, service
internals, store shapes, and conventions not covered there.

## Architecture: The Data Flow Pattern

```
Component (pages/store/*)
  → calls bskyService function
  → gets agent via AtpService
  → fetches from Bluesky/Anthropic API
  → writes to Pinia store + returns DataObject
  → Component renders store-backed data
```

Read functions in `bskyService.ts` return `{ displayData: DataObject, ...JSON }` AND
write the same data to the store — callers may use either. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full mermaid diagram and rationale.

## Key Services & Patterns

### `AtpService` (`src/lib/AtpService.ts`)

Singleton wrapper for `AtpAgent`:

- `getAgent()` / `getBskyAgent()` — lazily creates using `runtimeConfig.public.atpService`
- `setAuthToken(jwt)` — sets auth header
- `resetAgent()` — clears on logout

### `bskyService` (`src/lib/bskyService.ts`)

All Bluesky operations (timeline, follows, lists, list members, posts, add/remove users). Returns:

```ts
{
  displayData: DataObject,
  usersJSON | timelineJSON | listJSON | membersJSON | ...
}
```

### `aiSuggestions.ts` (client-side)

`curateUserLists()` orchestrates AI suggestions:

- Checks daily limit via `suggestionsStore.hasReachedLimit()` (5/day per DID, stored in localStorage)
- POSTs user+list data to `/api/suggestions`
- Server calls Anthropic (`claude-haiku-4-5-20251001`)
- Stores parsed suggestions in `suggestionsStore`

### Server Routes (`server/api/`)

- **`/api/suggestions`** POST — `{ users, lists }` → JSON suggestions
- **`/api/exemptUsers`** POST — `{ did }` → `{ isExempt }` (checks `NUXT_EXEMPT_DIDS`)

## State Stores (`src/stores/`)

| Store         | State                                                        |
| ------------- | ------------------------------------------------------------ |
| `auth`        | `isLoggedIn`, `did`, `initialized`, session restoration      |
| `follows`     | Paginated follows: `allFollows`, `cursor`, `itemsPerPage`    |
| `lists`       | Lists + members: separate `lists` and `members` slices       |
| `suggestions` | Daily request counts (localStorage per-DID), processing flag |
| `ui`          | Current view: `displayData` (DataObject), `timelineJSON`     |

Pagination uses cursor-based prefetch: when a requested page exceeds cache and a cursor exists, the service fetches the next batch and advances `prefetchedPages`.

## Code Organization

```
pages/                      # File-based routes; guard with middleware/router.ts
server/api/                 # Nitro endpoints (suggestions, exemptUsers)
src/
  components/               # PascalCase, <script setup>, BEM CSS classes
  lib/
    AtpService.ts           # Singleton AtpAgent manager
    bskyService.ts          # All AT Protocol operations
    aiSuggestions.ts        # AI suggestion orchestration
  stores/                   # Pinia (options API): auth, follows, lists, suggestions, ui
  types/                    # Domain-split TypeScript; re-exported from index.ts
  utils/slug-utils.ts       # List name ↔ URL slug bidirectional mapping (localStorage)
  assets/styles/            # Per-component CSS + _variables.css (shared tokens)
```

Import with `~` alias (`~/src/...`) or Nuxt aliases (`#imports`, `#app`).

## Authentication & Session

- **Method:** Credential-based (`agent.login({ identifier, password })`)
- **Identifier:** Email required (handles rejected to avoid rate limits)
- **Token:** `accessJwt` is set on agent + `loginData` persisted to localStorage
- **Restoration:** `middleware/router.ts` restores session once on app init, redirects unauth → `/`, auth → `/lists`
- **Expiry:** On `'Token has expired'` error, call `authStore.handleSessionExpired()` (clears storage + reloads)

(OAuth flow is in progress via `pages/oauth-callback.vue` + `public/client-metadata.json` but not yet wired.)

## AI Dev Tooling

Path-scoped, file-type-specific guidance also lives in `.github/instructions/` (bsky
services, Pinia stores, server API, types, Vue components) — check the matching file
when editing those layers. Project-wide conventions belong in `AGENTS.md`.

## Testing

No automated test suite exists yet (`@nuxt/test-utils` is installed but unused, and no
`*.test.ts`/`*.spec.ts` files are present). Vitest-based contributions for `src/lib/`
and `src/utils/` are welcome — start with pure functions like `src/utils/slug-utils.ts`.

## Environment Profiles (Optional)

All are opt-in via `.env.local`; no code changes required.

- **Default (WSL / clean machine):** HTTP on `localhost:3000`
- **macOS + HTTPS:** Set `NUXT_DEV_HTTPS=true`, `NUXT_DEV_HOST=bluelist-local.blue`, `NUXT_DEV_PORT=4430`, cert paths. Requires `/etc/hosts` entry + mkcert.
- **Corporate proxy:** Set `NODE_EXTRA_CA_CERTS=./certs/ca.pem`. The launcher (`scripts/run.mjs`) injects it before Node TLS initializes.

See `.env.example` for all variables.

## References

- **Always-on conventions:** [AGENTS.md](AGENTS.md)
- **Architecture + data flows:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Full setup & conventions:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Project overview & features:** [README.md](README.md)
