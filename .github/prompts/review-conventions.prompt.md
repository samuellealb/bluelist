---
description: "Review the current uncommitted changes (or a specified diff) against Bluelist's architecture and conventions before committing."
agent: 'agent'
tools: [search, read, execute]
argument-hint: 'Optional: files or area to focus on'
---

Review the current changes against Bluelist conventions and report findings.

1. Inspect the diff (e.g. `git --no-pager diff` and `git --no-pager diff --staged`).
2. Check for convention violations:
   - Bluesky logic goes through `AtpService` (no direct `new AtpAgent`) and lives
     in `src/lib/bskyService.ts`.
   - Services guard `authStore.isLoggedIn` and handle
     `'Token has expired' → handleSessionExpired()`.
   - Read functions return `{ displayData: DataObject, ...JSON }` and sync the store.
   - New `DataObject` types have a matching `DataCard.vue` branch and updated union.
   - Pinia stores use the options API; cross-store access happens inside actions.
   - Server secrets stay in `runtimeConfig` (never client-exposed).
   - Components: `<script setup>`, typed props, BEM CSS, per-component CSS import.
   - Conventional Commit message.
3. Flag security concerns (leaked secrets, unsanitized HTML — note `dompurify` is
   available) and any `any` types under strict TypeScript.
4. Report issues grouped by severity with file/line references and concrete
   fixes. Do not modify code unless asked; suggest running `yarn lint`.
