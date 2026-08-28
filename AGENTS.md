# Bluelist — Project Instructions

Bluelist is a Nuxt 4 + Vue 3 app for organizing Bluesky (AT Protocol) follows into
lists, with optional Anthropic-powered suggestions. Read
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system overview and
[CONTRIBUTING.md](CONTRIBUTING.md) for setup and workflow. This file lists only
the always-on essentials.

## Stack

Nuxt 4, Vue 3 (`<script setup>`), Pinia (options API), TypeScript (strict),
`@atproto/api`, Anthropic (server-side), Yarn 1. ESLint +
Prettier + Husky + commitlint.

## Build & Verify

- Install: `yarn install`
- Dev: `yarn dev` (loads `.env.local`)
- Lint before pushing: `yarn lint`
- Format: `yarn format`

## Critical Conventions (do not violate)

- **ATP agent:** always obtain the agent via `authStore.getAgent()` (the
  OAuth-authenticated `Agent`, or `null` if not logged in). Never construct an
  `AtpAgent`/`Agent` directly elsewhere — a standalone agent has no session and
  every call will 401.
- **Bluesky logic** belongs in [src/lib/bskyService.ts](src/lib/bskyService.ts).
  Every operation guards `authStore.isLoggedIn`, and on error checks
  `message === 'Token has expired'` → `authStore.handleSessionExpired()`.
- **Read functions** return `{ displayData: DataObject, ...JSON }` AND write the
  same data into the relevant Pinia store. Keep both in sync.
- **`DataObject`** (in [src/types/misc-types.ts](src/types/misc-types.ts)) is the
  discriminated union rendered by `DataCard.vue`. New view types require extending
  the union AND adding a card branch.
- **Stores** use Pinia options API. Access other stores by calling their composable
  inside an action (e.g. `useSuggestionsStore()`).
- **Slugs:** register list URIs with `addMapping(uri, name)` from
  [src/utils/slug-utils.ts](src/utils/slug-utils.ts) for URL routing.
- **AI limit:** suggestions are capped at 5/day per DID (localStorage), with
  `NUXT_EXEMPT_DIDS` override via `/api/exemptUsers`.
- **Secrets** (`anthropicApiKey`, `exemptDids`) stay in
  `runtimeConfig` server-side; never expose to the client.

## Style

PascalCase component files, `<script setup>` with typed props, BEM CSS, one CSS
file per component under `src/assets/styles/` imported in `<script setup>`. Use the
`~` alias (`~/src/...`) and Nuxt aliases (`#imports`, `#app`). Conventional Commits.

## Tickets, Commits & PRs

- **Tickets:** open them in `samuellealb/bluelist` and always add them to
  project 5: <https://github.com/users/samuellealb/projects/5>
  (`gh project item-add 5 --owner samuellealb --url <issue-url>`).
- **Conventional Commits:** always use Conventional Commit format — for commit
  messages, ticket titles, and PR titles alike.
- **PRs:** always mention the related ticket(s) in the PR description, and
  mention the PR in the related ticket(s). If a PR is opened with no
  associated ticket, create one first.
