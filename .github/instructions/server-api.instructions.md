---
description: 'Use when creating or editing Nuxt/Nitro server routes in Bluelist (server/**). Covers defineEventHandler, reading POST bodies, runtimeConfig secrets, error handling with createError, and the Anthropic curator endpoint.'
applyTo: 'server/**/*.ts'
---

# Server API Conventions (`server/api/`)

Endpoints are Nitro handlers created with `defineEventHandler`.

- **Read secrets from `runtimeConfig`**, never from the client:

  ```ts
  const config = useRuntimeConfig();
  const anthropicKey = config.anthropicApiKey; // server-only
  ```

  Server-only secrets (`anthropicApiKey`, `exemptDids`) live at
  the root of `runtimeConfig`; only `public.*` values reach the client.

- **Read POST bodies** with `readBody(event)` and validate required fields,
  throwing `createError({ statusCode, message })` on bad input.
- **Return shapes are contracts** consumed by `src/lib/`:
  - `/api/suggestions` → JSON string `{ data: [...] }` (parsed by `aiSuggestions.ts`).
  - `/api/exemptUsers` → `{ isExempt: boolean }`.
- The AI curator endpoint (`/api/suggestions`) calls **Anthropic**
  (`claude-haiku-4-5-20251001`) using `anthropicApiKey`. Existing-lists-only and
  valid-JSON-output are enforced structurally via a per-request JSON Schema
  (`output_config.format`) built from the actual follow/list names in each
  request — the system prompt only needs to state curation-judgment rules, not
  formatting or list-name constraints. Guard against oversized prompts
  (`userPrompt.length > 100000`) before calling the API.
- Log server errors with enough context, but never leak secrets or raw API keys
  in responses.
