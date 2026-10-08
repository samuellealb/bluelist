# Utilities

This directory currently contains the client-side list URL slug utility.

## `slug-utils.ts`

Maintains a bidirectional mapping between a Bluesky list URI and the slug used
in list-detail routes such as `/list/<slug>/posts` and
`/list/<slug>/members`.

### Public API

| Export                                            | Purpose                                                                                                                                                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createSlug(name: string): string`                | Lowercases a name, replaces each run of non-alphanumeric characters with `-`, trims leading and trailing hyphens, and limits the result to 60 characters.                                                      |
| `init(): void`                                    | Loads persisted URI/slug mappings into the module maps when running in the browser. The module calls this automatically on client-side import.                                                                 |
| `addMapping(uri: string, name: string): string`   | Registers a list URI and returns its stable slug. It reuses an existing slug for the URI; otherwise it derives one from the name, disambiguates collisions with `-1`, `-2`, and so on, then persists the maps. |
| `getUriBySlug(slug: string): string \| undefined` | Resolves a route slug to its list URI.                                                                                                                                                                         |
| `getSlugByUri(uri: string): string \| undefined`  | Resolves a list URI to its registered slug.                                                                                                                                                                    |

### Persistence And Edge Cases

- Mappings live in module-level `Map` instances and are persisted in browser `localStorage` under `bluelist_slug_mappings` as both `slugToUri` and `uriToSlug` objects.
- Storage reads and writes run only when both `window` and `import.meta.client` are available. Server-side rendering has no persisted mappings.
- Invalid JSON and storage errors are caught and logged with `console.error`; the utility does not throw for those failures.
- `addMapping` throws when `uri` is empty or otherwise falsy.
- An existing URI keeps its original slug even when called again with a different name.
- Falsy names use `untitled`. A truthy name containing no letters or digits can produce an empty base slug; the utility preserves that behavior and still applies collision suffixes if needed.
- `init()` merges saved mappings into the current maps and does not clear mappings that are already in memory.

### Direct Call-Site Roles

- `src/components/DataCard.vue` registers a mapping before navigating from a list card to the list posts or members route, while also writing the URI to the legacy `bluelist_current_list_uri` key.
- `pages/list/[slug]/posts.vue` and `pages/list/[slug]/members.vue` resolve the route slug. When it is absent, they use the legacy current-URI key and re-register a mapping when the list is available in the store.
- `src/components/Dashboard.vue` resolves route slugs while loading and refreshing list posts or members, then falls back to query parameters or the legacy current-URI key.
