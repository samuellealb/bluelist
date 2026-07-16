---
description: 'Use when creating or editing Nuxt/Nitro server routes in Bluelist (server/**). Covers defineEventHandler, reading POST bodies, runtimeConfig secrets, error handling with createError, and the OpenAI curator endpoint.'
applyTo: 'server/**/*.ts'
---

# Server API Conventions (`server/api/`)

Endpoints are Nitro handlers created with `defineEventHandler`.

- **Read secrets from `runtimeConfig`**, never from the client:

  ```ts
  const config = useRuntimeConfig();
  const anthropicKey = config.anthropicApiKey; // server-only
  const openaiKey = config.openaiApiKey; // server-only
  ```

  Server-only secrets (`anthropicApiKey`, `openaiApiKey`, `exemptDids`) live at
  the root of `runtimeConfig`; only `public.*` values reach the client.

- **Read POST bodies** with `readBody(event)` and validate required fields,
  throwing `createError({ statusCode, message })` on bad input.
- **Return shapes are contracts** consumed by `src/lib/`:
  - `/api/openai` → JSON string `{ data: [...] }` (parsed by `openai.ts`).
  - `/api/exemptUsers` → `{ isExempt: boolean }`.
- The AI curator endpoint (`/api/openai`) prefers **Anthropic**
  (`claude-haiku-4-5-20251001`) when `anthropicApiKey` is set and falls back to
  **OpenAI** (`gpt-4o-mini`). The inline system prompt must keep the model
  constrained to **existing lists only** and force valid JSON output. Guard
  against oversized prompts (`userPrompt.length > 100000`) before calling either
  API.
- Log server errors with enough context, but never leak secrets or raw API keys
  in responses.
