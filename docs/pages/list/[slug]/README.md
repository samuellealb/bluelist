# Dynamic List Pages

This directory defines the two views for a selected Bluesky list. Both pages
are protected by the `router` middleware and render `Dashboard` inside Nuxt's
`<client-only>` boundary.

## Routes

| Page file     | Route                 | Dashboard default view |
| ------------- | --------------------- | ---------------------- |
| `members.vue` | `/list/:slug/members` | `list-members`         |
| `posts.vue`   | `/list/:slug/posts`   | `list-posts`           |

`slug` is the dynamic route parameter. Each page expects it to be a single
string and resolves it to a list URI with `slugUtils.getUriBySlug(slug)`.

## Data Loading

After mount, and whenever `route.params.slug` changes, each page calls the
exposed `Dashboard.loadView()` method for its configured view. Before loading,
the resolved URI is written to local storage as
`bluelist_current_list_uri` for legacy dashboard consumers.

When the slug cannot be resolved, the pages fall back to the stored URI:

- If the URI matches a list in `useListsStore().lists.allLists`, the page
  recreates the slug mapping and replaces the URL with the restored route.
- If a stored URI exists but is not in the store, the page loads its dashboard
  view using that URI.
- If neither a valid slug nor a stored URI is available, the page redirects to
  `/lists`.

`members.vue` uses `loadViewWithRetry()` to retry a rejected
`Dashboard.loadView('list-members')` call up to three times, with an
exponentially increasing delay starting at 500 ms. `posts.vue` invokes
`Dashboard.loadView('list-posts')` once at the page level. Both views also use
the retry built into `Dashboard.loadView()`, which schedules another attempt
after an error is caught there.

## Rendered UI

The route pages do not render member rows or posts directly. They render the
shared `Dashboard` component, whose selected default view displays either the
current list's members or posts. The pages hold a component ref only to invoke
the dashboard's view-loading method after client-side route setup.
