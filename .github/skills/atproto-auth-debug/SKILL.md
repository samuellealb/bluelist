---
name: atproto-auth-debug
description: 'Diagnose and fix Bluesky/AT Protocol authentication issues in Bluelist — login failures, expired-token loops, session restore problems, agent/header issues, and the in-progress OAuth callback flow. Use when a user reports being logged out unexpectedly, login errors, redirect loops, or 401/expired-token errors.'
argument-hint: 'Describe the auth symptom (e.g. "keeps redirecting to login")'
---

# AT Protocol Auth Debugging

Use this skill to systematically diagnose authentication problems in Bluelist.

## Key Files

- [src/lib/AtpService.ts](../../../src/lib/AtpService.ts) — agent singleton,
  `setAuthToken`, `resetAgent`.
- [src/stores/auth.ts](../../../src/stores/auth.ts) — `loginUser`,
  `checkLoginSession`, `handleSessionExpired`, `getJwtExpiry`.
- [middleware/router.ts](../../../middleware/router.ts) — route guard + session
  restore.
- `pages/oauth-callback.vue`, `public/client-metadata.json` — in-progress OAuth.

## How Auth Works Today

- Credential login: `agent.login({ identifier, password })` where `identifier`
  must be an **email** (handles are rejected to avoid rate limits).
- On success: `accessJwt` is set via `AtpService.setAuthToken`, and `loginData`
  is persisted to `localStorage`.
- On navigation, `router.ts` calls `checkLoginSession()` once to restore state.
- Expired tokens trigger `handleSessionExpired()` → clears `loginData` +
  `window.location.reload()`.

## Diagnostic Procedure

1. **Reproduce & classify** the symptom: login failure, redirect loop, or
   mid-session logout (expired token).

2. **Login failures**

   - Confirm an email (not handle) is used — check the guard in `loginUser`.
   - Check for `'Rate Limit Exceeded'` handling.
   - Verify `NUXT_ATP_SERVICE` is set (used by `AtpService.getAgent`).

3. **Redirect loops** (`/` ↔ `/lists`)

   - Inspect `router.ts`: `initialized` must be set after `checkLoginSession`.
   - Confirm `isLoggedIn` reflects a restored session; a failed restore leaves
     the user on `/`.

4. **Mid-session logout / expired token**

   - Confirm services check `message === 'Token has expired'` and call
     `handleSessionExpired()`.
   - Inspect `getJwtExpiry` decoding; a malformed/absent `loginData` will fail
     restore.
   - Watch for reload loops caused by `handleSessionExpired` firing repeatedly.

5. **Agent/header issues**

   - Ensure the agent is the singleton from `AtpService` and that
     `setAuthToken` ran after login. `resetAgent()` on logout clears headers.

6. **OAuth (in progress)**
   - The OAuth callback page and `client-metadata.json` exist but are not yet
     wired into `AtpService`/`auth`. Treat OAuth work as additive; don't assume
     it drives current sessions.

## Fix & Verify

- Apply the minimal fix at the correct layer (service vs store vs middleware).
- Reproduce in `yarn dev`, confirm the session persists across reloads, and run
  `yarn lint`.
