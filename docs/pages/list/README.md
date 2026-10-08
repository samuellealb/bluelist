# List Routes

This directory is the file-based routing branch for routes that operate on one
Bluelist list. It contains no page component of its own; the dynamic `[slug]`
directory supplies the list identifier and groups that list's detail views.

## Direct Child Route Branch

`[slug]/` represents a single list selected by its URL slug. Its direct route
pages are:

| Page file     | Route                 |
| ------------- | --------------------- |
| `members.vue` | `/list/:slug/members` |
| `posts.vue`   | `/list/:slug/posts`   |

The implementation details for those views are documented within the
`[slug]/` branch.
