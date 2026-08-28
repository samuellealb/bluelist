# Bluelist Architecture

Bluelist is a [Nuxt 4](https://nuxt.com) single-page application that helps Bluesky
users organize the accounts they follow into [AT Protocol](https://atproto.com)
lists, with optional AI-assisted suggestions. This document describes how the app
is structured so that both humans and AI assistants can navigate and extend it
confidently.

## Tech Stack

| Concern         | Choice                                                            |
| --------------- | ----------------------------------------------------------------- |
| Framework       | Nuxt 4 (Vue 3, `<script setup>`)                                  |
| State           | Pinia (options-store style)                                       |
| Bluesky API     | `@atproto/api` (`AtpAgent`)                                       |
| AI              | Anthropic `claude-haiku-4-5` (server route)                       |
| Language        | TypeScript (strict, `typeCheck: true`)                            |
| Package manager | Yarn 1.x                                                          |
| Tooling         | ESLint (`@nuxt/eslint`), Prettier, Husky, lint-staged, commitlint |

## Directory Map

```text
app.vue, error.vue          # Root app + error boundary
middleware/router.ts        # Global auth route guard
scripts/run.mjs             # Cross-platform Nuxt launcher (injects NODE_EXTRA_CA_CERTS early)
pages/                      # File-based routes (index, feed, follows, lists, list/[slug]/*)
server/api/                 # Nitro endpoints (suggestions, exemptUsers)
public/                     # Static assets (client-metadata.json, robots.txt)
src/
  components/               # Vue components (PascalCase)
  lib/                      # Framework-agnostic services
    OAuthService.ts         #   OAuth client init/session management
    bskyService.ts          #   All Bluesky read/write operations
    aiSuggestions.ts        #   AI suggestion orchestration (client side)
  stores/                   # Pinia stores (auth, follows, lists, suggestions, ui)
  types/                    # Domain-split TypeScript types
  utils/slug-utils.ts       # List name <-> URL slug mapping
  assets/styles/            # Per-component CSS + shared _variables.css
```

## Core Data Flow

The central pattern: **components call service functions, services fetch from
Bluesky/Anthropic and write results into Pinia stores, and components render the
store-backed `DataObject`.**

```mermaid
flowchart LR
    C[Component / Page] -->|calls| S[src/lib/bskyService.ts]
    S -->|authStore.getAgent| A[Agent]
    A -->|AT Protocol| BSKY[(Bluesky PDS)]
    S -->|$patch displayData| ST[Pinia stores]
    ST -->|reactive DataObject| DD[DataDisplay.vue]
    DD --> DC[DataCard.vue]
```

### The `DataObject` contract

Almost every view renders a single discriminated union defined in
[src/types/misc-types.ts](../src/types/misc-types.ts):

```ts
interface DataObject {
  type:
    | 'timeline'
    | 'lists'
    | 'follows'
    | 'list-posts'
    | 'list-members'
    | 'error'
    | 'loading';
  data:
    | TimelineItem[]
    | ListItem[]
    | FollowItem[]
    | SuggestionItem[]
    | { message: string }[];
  pagination?: { currentPage?; totalPages?; totalPrefetched?; hasMorePages? };
  listInfo?: { name: string; description?: string; uri: string };
}
```

`DataCard.vue` switches on `item.type` to decide how to render each row. When you
add a new view type, extend the union **and** add a matching branch in the card.

### Service return convention

Read functions in [src/lib/bskyService.ts](../src/lib/bskyService.ts) return a
`{ displayData: DataObject, usersJSON | timelineJSON | ... }` object **and** write
the same data into the relevant store via `store.$patch(...)`. Callers can either
use the return value directly or rely on store reactivity. Keep both in sync when
adding functions.

## Services (`src/lib/`)

### `bskyService`

All Bluesky operations live here (reads: timeline, follows, lists, list members,
list posts; writes: add/remove users, create/update/delete lists). Every function:

1. Guards with `if (!authStore.isLoggedIn) throw new Error('Please login first')`.
2. Gets the agent via `authStore.getAgent()` — the OAuth-authenticated `Agent`.
   Never instantiate `AtpAgent`/`Agent` directly elsewhere; it would have no
   session and every call would 401.
3. On error, logs and rethrows a user-facing error. Unrecoverable session
   invalidation is handled centrally via the OAuth client's `'deleted'` event
   (see `OAuthService.onSessionDeleted` → `authStore.handleSessionExpired()`),
   not per call site.

### `aiSuggestions.ts` (client)

`curateUserLists()` orchestrates AI suggestions: it enforces the daily limit via
`suggestionsStore.hasReachedLimit()`, gathers the current-page follows and all
lists, POSTs them to `/api/suggestions`, and stores the parsed suggestions.

## State Management (`src/stores/`)

| Store         | Responsibility       | Notable state                                                              |
| ------------- | -------------------- | -------------------------------------------------------------------------- |
| `auth`        | Login/session/DID    | `isLoggedIn`, `did`, `initialized`, `handleSessionExpired()`               |
| `follows`     | Paginated follows    | `follows.allFollows`, `cursor`, `itemsPerPage: 20`                         |
| `lists`       | Lists + list members | separate `lists` (10/pg) and `members` (10/pg) slices, `memberCountsCache` |
| `suggestions` | AI request tracking  | `requestCounts` (localStorage, per-DID daily), `isProcessingSuggestions`   |
| `ui`          | Current view data    | `displayData` (`DataObject`), `timelineJSON`                               |

Stores use Pinia's **options API** (`state`, `getters`, `actions`). Cross-store
access is done by calling the other store's composable inside an action
(e.g. `useSuggestionsStore()` inside `auth.login()`).

### Pagination + prefetch

Follows/lists/members use cursor-based pagination with a prefetch strategy: when a
requested page exceeds what is cached and a `cursor` exists, the service fetches
the next batch, appends it to `all*` arrays, and advances `prefetchedPages`. The
`isFetching` flag prevents concurrent fetches for the same slice.

## Authentication

Auth is **OAuth-based** (AT Proto OAuth, via `@atproto/oauth-client-browser`),
the sole login path — password/`createSession` login has been removed:

- The user enters a Bluesky handle; [`OAuthService`](../src/lib/OAuthService.ts)
  builds a loopback client (localhost) or a discoverable client (deployed,
  metadata served dynamically at [`/client-metadata.json`](../server/routes/client-metadata.json.ts))
  and redirects to the provider for consent.
- [`pages/oauth-callback.vue`](../pages/oauth-callback.vue) completes the
  callback and checks `authStore.isLoggedIn` before routing to `/lists` or back
  to `/` with an error.
- [middleware/router.ts](../middleware/router.ts) restores the session once per
  app load (`checkLoginSession`), redirects unauthenticated users to `/`, and
  redirects authenticated users away from `/` to `/lists`.
- Unrecoverable session invalidation (refresh failure) fires the OAuth client's
  `'deleted'` event, which calls `authStore.handleSessionExpired()`.

## AI Suggestions Pipeline

```mermaid
flowchart LR
    U[User] --> CL[aiSuggestions.ts curateUserLists]
    CL -->|check limit| SG[suggestions store]
    CL -->|POST users+lists| API[/server/api/suggestions/]
    API -->|NUXT_ANTHROPIC_API_KEY required| ANT[(Anthropic claude-haiku-4-5)]
    API -->|JSON string| CL
    CL -->|store suggestions| SG
```

- **Anthropic-only:** the server route calls Anthropic
  (`claude-haiku-4-5-20251001`); `NUXT_ANTHROPIC_API_KEY` is required.
- **Daily limit:** 5 requests/user/day, tracked per-DID in `localStorage`.
- **Exemption:** `POST /api/exemptUsers` checks `NUXT_EXEMPT_DIDS` and can bypass
  the limit.
- **Prompt:** the curator system prompt is defined inline in
  [server/api/suggestions.ts](../server/api/suggestions.ts) and constrains the
  model to existing lists only, returning a strict JSON shape.

## Server API (`server/api/`)

| Route              | Method | Body                             | Returns                                                    |
| ------------------ | ------ | -------------------------------- | ---------------------------------------------------------- |
| `/api/suggestions` | POST   | `{ users, lists }` (stringified) | JSON string `{ data: [{ name, did, lists: [{ name }] }] }` |
| `/api/exemptUsers` | POST   | `{ did }`                        | `{ isExempt: boolean }`                                    |

Secrets (`anthropicApiKey`, `exemptDids`) are read from
`runtimeConfig` server-side only; never expose them to the client.

## Slug System

[src/utils/slug-utils.ts](../src/utils/slug-utils.ts) maps human-readable list
names to URL slugs and back, so routes like `/list/my-cool-list/posts` resolve to
an AT-URI. Mappings live in a bidirectional `Map` and are persisted to
`localStorage` (`bluelist_slug_mappings`). Call `addMapping(uri, name)` whenever
lists are fetched so the slug is available for navigation.

## Conventions At A Glance

- **Components:** PascalCase filenames, `<script setup>` + typed props, BEM CSS
  class names, and a per-component CSS file imported from
  `src/assets/styles/` inside `<script setup>`
  (e.g. `import '~/src/assets/styles/data-card.css';`).
- **Utilities/services:** kebab-case filenames for utils; import via the `~` alias
  (`~/src/...`) or Nuxt aliases (`#imports`, `#app`).
- **Types:** split by domain under `src/types/` and re-exported from
  `src/types/index.ts`.
- **Commits:** Conventional Commits, enforced by commitlint.

## Design System

Theming is CSS-custom-property driven: `:root` (dark) and `.light-theme` blocks in
[`src/assets/styles/_variables.css`](../src/assets/styles/_variables.css), toggled by
`ThemeToggle.vue`.

- [Design token audit & target schema](design/token-schema.md) — current token defects and the
  schema theme work targets.
- [City pop visual research](design/city-pop-aesthetics.md) — aesthetic research backing the
  proposed redesign.
- [Theme proposals](themes/README.md) — six specs (3 families × dark/light) awaiting a
  selection. Not yet implemented. Live previews: `open docs/themes/index.html`.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for setup and workflow details.
