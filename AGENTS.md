# Bluelist Agent Instructions

## Read First

- Start with [docs/README.md](docs/README.md), then read the local guide for the
  branch being changed.
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system contracts and
  [CONTRIBUTING.md](CONTRIBUTING.md) for setup and workflow.
- Before editing, follow every applicable path-scoped rule in
  [`.github/instructions/`](.github/instructions/).

## Non-Negotiable Rules

- Obtain Bluesky clients only through `authStore.getAgent()`; never construct an
  `AtpAgent` or `Agent` directly.
- Keep Bluesky operations in `src/lib/bskyService.ts`. Reads must synchronize
  their Pinia store and return `{ displayData, ...JSON }`.
- When adding a `DataObject` view, update both the union and its `DataCard.vue`
  rendering branch.
- Keep secrets in server-side `runtimeConfig`; do not expose them to browser code.

## Verification

- Install: `yarn install`
- Run locally: `yarn dev`
- Before delivery: `yarn lint` and the narrowest relevant check.

## Delivery

Use Conventional Commits. When creating tickets or pull requests, follow the
repository's issue, project, and cross-reference requirements in
[CONTRIBUTING.md](CONTRIBUTING.md).
