# Contributing to Bluelist

Thanks for helping improve Bluelist! This guide covers local setup, project
conventions, and the development workflow. For a system overview, read
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Prerequisites

- Node.js (version compatible with Nuxt 4)
- [Yarn 1.x](https://classic.yarnpkg.com/) (the pinned package manager)
- An Anthropic **or** OpenAI API key (at least one is needed to exercise AI
  suggestions locally)

## Setup

```bash
yarn install
```

Copy `.env.example` to `.env.local` and fill in the values you need:

```bash
NUXT_ATP_SERVICE=https://bsky.social            # required
# Pick at least one AI provider:
# NUXT_ANTHROPIC_API_KEY=your_anthropic_key_here   (preferred)
# NUXT_OPENAI_API_KEY=your_openai_key_here
# NUXT_EXEMPT_DIDS=did:plc:xxxx,did:plc:yyyy       # optional, bypass daily limit
```

See `.env.example` for all available variables including opt-in dev-environment
profiles (HTTPS, corporate proxy).

### Local HTTPS (opt-in)

HTTPS is **disabled by default**. To enable it, set `NUXT_DEV_HTTPS=true` in
`.env.local` along with `NUXT_DEV_HOST`, `NUXT_DEV_PORT` (default `4430`), and
the paths to your mkcert certificates (`NUXT_DEV_SSL_KEY`, `NUXT_DEV_SSL_CERT`).
Add the host to `/etc/hosts`. See `.env.example` for the full profile.

## Scripts

All Nuxt commands are routed through `scripts/run.mjs`, which parses `.env.local`
and injects `NODE_EXTRA_CA_CERTS` before the Node TLS stack initialises (needed
for the corporate-proxy profile).

| Command         | Purpose                                   |
| --------------- | ----------------------------------------- |
| `yarn dev`      | Start the dev server (loads `.env.local`) |
| `yarn build`    | Production build                          |
| `yarn preview`  | Preview the production build locally      |
| `yarn generate` | Static generation                         |
| `yarn lint`     | Run ESLint over the repo                  |
| `yarn format`   | Format the repo with Prettier             |

## Code Style

- **TypeScript everywhere**, strict mode with `typeCheck: true`.
- **Vue:** Composition API with `<script setup>`; type component props with
  interfaces.
- **CSS:** BEM class names; one CSS file per component under
  `src/assets/styles/`, imported inside `<script setup>`
  (e.g. `import '~/src/assets/styles/data-card.css';`). Shared tokens live in
  `_variables.css`.
- **Imports:** use the `~` alias (`~/src/...`) and Nuxt aliases
  (`#imports`, `#app`).
- **Formatting/linting** are enforced by Prettier + ESLint and run automatically
  on staged files via Husky + lint-staged. Run `yarn lint` before pushing.

## Architecture Conventions

When adding features, follow the existing patterns (details in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)):

- Put Bluesky read/write logic in [src/lib/bskyService.ts](src/lib/bskyService.ts);
  always get the agent via `AtpService`, guard on `authStore.isLoggedIn`, and
  handle `'Token has expired'` with `authStore.handleSessionExpired()`.
- Return `{ displayData: DataObject, ...JSON }` from read functions and write the
  same data into the relevant Pinia store.
- Extend the `DataObject` union in [src/types/misc-types.ts](src/types/misc-types.ts)
  and add a matching branch in `DataCard.vue` for new view types.
- Register new list slugs with `addMapping(uri, name)` from
  [src/utils/slug-utils.ts](src/utils/slug-utils.ts).
- Keep server secrets in `runtimeConfig`; never expose them client-side.

## Commit Conventions

This repo uses [Conventional Commits](https://www.conventionalcommits.org),
enforced by commitlint:

```text
<type>(<optional scope>): <description>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`,
`perf`, `build`, `ci`. Examples:

```text
feat(lists): add batch removal of list members
fix(auth): reload session on expired token
docs(architecture): document the DataObject contract
```

## Branch & PR Workflow

- Branch from `main`; name branches after the issue you're addressing
  (e.g. `18-oauth-log-in`).
- Keep PRs focused and ensure `yarn lint` passes.
- Reference the related issue in the PR description.

## AI Dev Tooling

The repo ships customization files that improve AI-assisted development across
different tools:

| File / folder                            | Scope                    | Purpose                                                                                                                                            |
| ---------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](../AGENTS.md)              | All AI tools             | Always-on project instructions (stack, critical conventions, build commands). Recognized by GitHub Copilot, Claude Code, OpenAI Codex, and others. |
| `.github/instructions/*.instructions.md` | GitHub Copilot (VS Code) | Path-scoped instructions that load automatically for matching files (components, stores, services, server routes, types).                          |
| `.github/skills/`                        | GitHub Copilot (VS Code) | On-demand workflow guides (`add-bsky-feature`, `atproto-auth-debug`). Trigger via `/` in chat.                                                     |
| `.github/prompts/`                       | GitHub Copilot (VS Code) | Single-task prompt templates (scaffold component, add service function, review conventions). Trigger via `/` in chat.                              |
| `.github/agents/`                        | GitHub Copilot (VS Code) | Custom agent modes (`Feature Builder`, `Code Reviewer`). Select from the agent picker.                                                             |

When adding a new layer (e.g. new store shape, new service pattern), update
`AGENTS.md` if the convention is project-wide, or the relevant
`.github/instructions/` file if it is file-type-specific.

## Testing

There is no automated test suite yet (`@nuxt/test-utils` is installed but
unused). Contributions that add Vitest-based unit tests for `src/lib/` and
`src/utils/` are welcome — start with pure functions like
[src/utils/slug-utils.ts](src/utils/slug-utils.ts).
