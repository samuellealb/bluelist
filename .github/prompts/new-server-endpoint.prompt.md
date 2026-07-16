---
description: 'Scaffold a new Nuxt/Nitro server API endpoint for Bluelist with defineEventHandler, body validation, runtimeConfig secrets, and createError handling.'
agent: 'agent'
argument-hint: 'Endpoint path, method, and purpose'
---

Create a new server endpoint under `server/api/` for Bluelist:

- Export `defineEventHandler(async (event) => { ... })`.
- Read POST bodies with `readBody(event)` and validate required fields, throwing
  `createError({ statusCode, message })` on invalid input.
- Read secrets from `useRuntimeConfig()` server-side only (e.g.
  `config.openaiApiKey`, `config.exemptDids`); never expose them to the client.
- Define a clear, documented return shape (JSON) that `src/lib/` can consume.
- Handle and log errors without leaking secrets.

Ask for the route path, HTTP method, request body, and response shape if not
provided, then generate the endpoint file.
