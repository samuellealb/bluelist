# Pages

This directory defines Bluelist's file-based Nuxt routes. All direct page
components except the OAuth callback use the global `router` middleware. The
middleware restores the OAuth session once, redirects unauthenticated requests
to `/`, and sends authenticated users away from `/` to `/lists`.

| File                 | Route             | Responsibility                                                                                                                                                         | Route guard and data dependencies                                                                                                                                                                       | Child-route relationship                                                                                                          |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `index.vue`          | `/`               | Renders `LoginForm` while logged out and displays the OAuth callback failure message when `error=oauth_callback_failed` is present. Navigates to `/lists` after login. | Uses `useAuthStore()` for `isLoggedIn`; reads `useRoute().query.error`; uses `router` middleware. Persists `bluelist_just_logged_in` before navigating after a successful login.                        | Entry route only; it is not a parent layout for other pages.                                                                      |
| `feed.vue`           | `/feed`           | Renders the client-only `Dashboard` with `default-view="feed"`.                                                                                                        | Uses `router` middleware. The `Dashboard` owns loading and presenting the selected feed view and its data.                                                                                              | Sibling dashboard route; no child routes in this directory.                                                                       |
| `follows.vue`        | `/follows`        | Renders the client-only `Dashboard` with `default-view="follows"`.                                                                                                     | Uses `router` middleware. The `Dashboard` owns loading and presenting the selected follows view and its data.                                                                                           | Sibling dashboard route; no child routes in this directory.                                                                       |
| `lists.vue`          | `/lists`          | Renders the client-only `Dashboard` with `default-view="lists"`. This is the authenticated landing route selected by the middleware and successful OAuth flow.         | Uses `router` middleware. The `Dashboard` owns loading and presenting the selected lists view and its data.                                                                                             | Parent path for the separate `list/[slug]` route subtree. This page itself is not a Nuxt parent component for those child routes. |
| `oauth-callback.vue` | `/oauth-callback` | Displays a temporary callback status, restores the OAuth session, then redirects to `/lists` on success or `/?error=oauth_callback_failed` on failure.                 | Does not declare `router` middleware and disables the default layout. On mount, it calls `useAuthStore().checkLoginSession()`, then marks the auth store initialized before deciding where to navigate. | Callback endpoint only; it does not host child routes.                                                                            |

## Route Tree

The direct files provide top-level entry points. The `list/` directory contains
the slug-scoped routes beneath `/list/:slug`; it is intentionally documented
separately from this direct-page overview.

```text
/
/feed
/follows
/lists
/oauth-callback
/list/:slug/...
```
