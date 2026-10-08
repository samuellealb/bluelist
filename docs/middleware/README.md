# Middleware

## `router.ts`

`router.ts` is Nuxt route middleware that restores the client-side auth session
before applying auth-based redirects.

### Session initialization

- On the server, the middleware returns immediately and does not access auth
  state or redirect.
- In the browser, it obtains the Pinia auth store with `useAuthStore()`.
- When `authStore.initialized` is `false`, it awaits
  `authStore.checkLoginSession()` and then calls `authStore.setInitialized(true)`.
- A successful initialization is not repeated on later navigations while
  `initialized` remains `true`.

### Routing behavior

| Auth state | Destination         | Result                           |
| ---------- | ------------------- | -------------------------------- |
| Logged out | Any path except `/` | Replaces the route with `/`      |
| Logged in  | `/`                 | Replaces the route with `/lists` |
| Logged out | `/`                 | Allows navigation                |
| Logged in  | Any path except `/` | Allows navigation                |

Redirects use `navigateTo(..., { replace: true })`, so the redirected-away route
is not retained as a separate history entry.

### Dependencies

- `~/src/stores/auth`: supplies `useAuthStore()`, plus the `initialized`,
  `isLoggedIn`, `checkLoginSession()`, and `setInitialized()` auth-store API.
- Nuxt route-middleware APIs: `defineNuxtRouteMiddleware()` and `navigateTo()`.
- Nuxt runtime detection through `import.meta.server`.

### Failure behavior

If `checkLoginSession()` rejects, the middleware logs
`Error initializing auth session:` with the original error to the browser
console. It does not set `initialized` to `true`, so a later client-side
navigation attempts session initialization again. The middleware then evaluates
the redirect rules using the auth state currently held by the store; it does not
surface a route error or return a failure response.
