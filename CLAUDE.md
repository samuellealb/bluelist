# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Stack:** Nuxt 4, Vue 3 (`<script setup>`), Pinia (options API), TypeScript (strict), @atproto/api, Anthropic/OpenAI (server-side), Yarn 1.

**Common commands:**

- `yarn install` — install dependencies
- `yarn dev` — start dev server (loads `.env.local`)
- `yarn lint` — run ESLint
- `yarn format` — format with Prettier
- `yarn build` — production build
- `yarn preview` — preview production build locally

**Setup:** Copy `.env.example` to `.env.local`, fill in `NUXT_ATP_SERVICE` (required) and at least one AI provider key (`NUXT_ANTHROPIC_API_KEY` or `NUXT_OPENAI_API_KEY`).

## Architecture: The Data Flow Pattern

Bluelist follows a strict unidirectional pattern:

```
Component (pages/store/*)
  → calls bskyService function
  → gets agent via AtpService
  → fetches from Bluesky/OpenAI API
  → writes to Pinia store + returns DataObject
  → Component renders store-backed data
```

**This matters:** read functions MUST return `{ displayData: DataObject, ...JSON }` AND write the same data to the store. Keep these in sync. Callers can use either the return value or store reactivity.

## Critical Conventions (Do Not Violate)

1. **ATP Agent:** Always obtain via `AtpService.getAgent()` or `getBskyAgent()` (in `src/lib/AtpService.ts`). Never construct `AtpAgent` directly elsewhere.

2. **Bluesky logic:** All AT Protocol read/writes live in `src/lib/bskyService.ts`. Every function:
   - Guards: `if (!authStore.isLoggedIn) throw new Error('Please login first')`
   - Gets agent: `AtpService.getAgent()`
   - Handles expiry: `if ((error as Error).message === 'Token has expired') authStore.handleSessionExpired()`
3. **DataObject contract:** The discriminated union in `src/types/misc-types.ts` defines all renderable types (`timeline`, `lists`, `follows`, `list-posts`, `list-members`, `error`, `loading`). New view types require:

   - Extending the union + data field
   - Adding a matching branch in `DataCard.vue`
   - Returning from the service function

4. **Stores:** Use Pinia options API. Access other stores by calling their composable inside actions (e.g., `useSuggestionsStore()` inside `auth.login()`). Do not directly import + call store actions.

5. **Slugs:** List URIs must be registered with `addMapping(uri, name)` from `src/utils/slug-utils.ts` whenever lists are fetched, so `/list/my-cool-list/posts` routes resolve correctly.

6. **Secrets:** `anthropicApiKey`, `openaiApiKey`, `exemptDids` stay in `runtimeConfig` server-side. Never expose to the client.

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

### `openai.ts` (client-side)

`curateUserLists()` orchestrates AI suggestions:

- Checks daily limit via `suggestionsStore.hasReachedLimit()` (5/day per DID, stored in localStorage)
- POSTs user+list data to `/api/openai`
- Server prefers Anthropic (`claude-haiku-4-5-20251001`), falls back to OpenAI `gpt-4o-mini`
- Stores parsed suggestions in `suggestionsStore`

### Server Routes (`server/api/`)

- **`/api/openai`** POST — `{ users, lists }` → JSON suggestions
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
server/api/                 # Nitro endpoints (openai, exemptUsers)
src/
  components/               # PascalCase, <script setup>, BEM CSS classes
  lib/
    AtpService.ts           # Singleton AtpAgent manager
    bskyService.ts          # All AT Protocol operations
    openai.ts               # AI suggestion orchestration
  stores/                   # Pinia (options API): auth, follows, lists, suggestions, ui
  types/                    # Domain-split TypeScript; re-exported from index.ts
  utils/slug-utils.ts       # List name ↔ URL slug bidirectional mapping (localStorage)
  assets/styles/            # Per-component CSS + _variables.css (shared tokens)
```

Import with `~` alias (`~/src/...`) or Nuxt aliases (`#imports`, `#app`).

## Component & Style Conventions

- **Files:** PascalCase (`DataCard.vue`, `AuthForm.vue`)
- **Script:** `<script setup>` with typed props (interfaces, not type aliases)
- **CSS:** BEM class names (e.g., `.data-card`, `.data-card__item`, `.data-card__item--active`)
- **Import CSS:** One file per component under `src/assets/styles/`, imported inside `<script setup>` (e.g., `import '~/src/assets/styles/data-card.css'`)

## Authentication & Session

- **Method:** Credential-based (`agent.login({ identifier, password })`)
- **Identifier:** Email required (handles rejected to avoid rate limits)
- **Token:** `accessJwt` is set on agent + `loginData` persisted to localStorage
- **Restoration:** `middleware/router.ts` restores session once on app init, redirects unauth → `/`, auth → `/lists`
- **Expiry:** On `'Token has expired'` error, call `authStore.handleSessionExpired()` (clears storage + reloads)

(OAuth flow is in progress via `pages/oauth-callback.vue` + `public/client-metadata.json` but not yet wired.)

## TypeScript

Strict mode with `typeCheck: true`. When adding new features:

- Use interfaces for component props (not `type`)
- Add new types to `src/types/` split by domain, re-export from `index.ts`
- Extend `DataObject` union for new view types

## Commits & PRs

Use [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <description>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`, `perf`, `build`, `ci`.

Examples:

```
feat(lists): add batch removal of list members
fix(auth): reload session on expired token
docs(architecture): update DataObject contract
```

Commits are enforced by commitlint. Format with `yarn format` before pushing.

## AI Dev Tooling

The repo provides guidance for AI tools across multiple files:

- **`AGENTS.md`** — project-wide instructions (recognized by GitHub Copilot, Claude Code, OpenAI Codex)
- **`docs/ARCHITECTURE.md`** — full system design, data flows, patterns
- **`CONTRIBUTING.md`** — setup, code style, workflow

When adding new layers (e.g., new store shape, new service pattern), update `AGENTS.md` for project-wide changes or `.github/instructions/` for file-type-specific guidance.

## Testing

No automated test suite yet (`@nuxt/test-utils` installed but unused). Vitest-based contributions for `src/lib/` and `src/utils/` are welcome — start with pure functions like `src/utils/slug-utils.ts`.

## Environment Profiles (Optional)

All are opt-in via `.env.local`; no code changes required.

- **Default (WSL / clean machine):** HTTP on `localhost:3000`
- **macOS + HTTPS:** Set `NUXT_DEV_HTTPS=true`, `NUXT_DEV_HOST=bluelist-local.blue`, `NUXT_DEV_PORT=4430`, cert paths. Requires `/etc/hosts` entry + mkcert.
- **Corporate proxy:** Set `NODE_EXTRA_CA_CERTS=./certs/ca.pem`. The launcher (`scripts/run.mjs`) injects it before Node TLS initializes.

See `.env.example` for all variables.

## References

- **Architecture + data flows:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Full setup & conventions:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Project overview & features:** [README.md](README.md)
