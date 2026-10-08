# Service Layer

`src/lib` contains the client-side service boundary for Bluelist. UI-facing
callers use these modules to authenticate with AT Protocol, read or mutate
Bluesky list data, and request AI list-curation suggestions.

## Modules

| File               | Public responsibility                                                                                                                                | Key callers and dependencies                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OAuthService.ts`  | Creates and owns the browser OAuth client, starts sign-in, restores sessions, creates authenticated `Agent` instances, and reports deleted sessions. | Used by authentication/session flows. Depends on `@atproto/oauth-client-browser`, `@atproto/api`, browser `window` and `crypto`, and `OAUTH_SCOPE`.             |
| `oauthScope.ts`    | Exports `OAUTH_SCOPE`, the space-delimited AT Protocol OAuth grants required by the Bluesky operations.                                              | Consumed by `OAuthService`; must reflect the AT Protocol methods used by `bskyService.ts`.                                                                      |
| `bskyService.ts`   | Provides authenticated Bluesky timeline, follows, list, list-member, and list-feed reads plus list and list-member mutations.                        | Called by UI data and list-management flows. Depends on the auth, follows, lists, and UI Pinia stores, shared types, and the OAuth-authenticated Bluesky agent. |
| `aiSuggestions.ts` | Sends the current follows page and available lists to the server-side curator API, then converts and stores the returned suggestions.                | Called by the AI-curation UI flow. Depends on `ofetch`, auth/follows/lists/suggestions stores, shared types, and `POST /api/suggestions`.                       |

## Authentication Contract

All public operations in `bskyService.ts` require an active auth-store session.
They first reject unauthenticated calls with `Please login first`, then obtain
the agent through `authStore.getAgent()`. A missing agent is treated as an
unavailable authentication session. Service code must not construct a separate
`Agent` or `AtpAgent`; `OAuthService.createAgent()` is the one place that turns
an OAuth session into an authenticated agent.

`OAuthService` is a singleton-like module with this lifecycle:

1. `initialize()` creates one browser OAuth client. It uses a loopback client on
   localhost and loads `${origin}/client-metadata.json` on deployed origins.
2. `initSession()` processes the OAuth callback/session state.
3. `signIn(handle, options?)` begins authorization, and `restoreSession(did)`
   recovers a stored OAuth session.
4. `createAgent(session)` produces the agent returned by the auth layer.
5. `onSessionDeleted(callback)` lets the auth layer handle refresh/session
   invalidation; `reset()` clears module state.

## Bluesky Data Flow

`bskyService.ts` converts AT Protocol responses to Bluelist view data. Its read
operations follow a dual-output contract: return a typed `displayData` value
and a serialized JSON field, while updating the relevant Pinia state used by
the interface.

| Read operation                                     | Returns                          | Store effects                                                                                              |
| -------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `getTimeline()`                                    | `{ displayData, timelineJSON }`  | Updates the UI store's displayed data and timeline JSON.                                                   |
| `getFollows(page?, refresh?, prefetchOnly?)`       | `{ displayData, usersJSON }`     | Maintains follows pagination/cache and, unless prefetching only, updates UI display data and follows JSON. |
| `getLists(page?, refresh?, prefetchOnly?)`         | `{ displayData, listsJSON }`     | Maintains list pagination/cache and, unless prefetching only, updates UI display data and lists JSON.      |
| `getListPosts(listUri, limit?)`                    | `{ displayData, listPostsJSON }` | Returns list-feed display data and JSON.                                                                   |
| `getListMembers(listUri, page?, refresh?, limit?)` | `{ displayData, membersJSON }`   | Maintains the active-list member cache/pagination and updates UI display data.                             |
| `fetchListDetails(listUri)`                        | `ListItem                        | null`                                                                                                      | Performs no direct store update; it is used when list metadata is needed. |
| `getListMemberCount(listUri)`                      | `number`                         | Performs no direct store update.                                                                           |

`displayData` is the shared `DataObject` union. The read functions produce the
corresponding `timeline`, `follows`, `lists`, `list-posts`, or `list-members`
variant. Follows, lists, and members use cursor-based prefetching: cached pages
are reused, a new batch is requested only when needed, and each slice's
fetching flag prevents overlapping requests.

### Mutations

| Operation                            | Responsibility                                                                      | Result                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `addUserToList(userDid, listUri)`    | Adds one profile unless it is already present.                                      | Success/status string; marks the member cache dirty when a record is created.      |
| `addUsersToLists(usersToLists)`      | Adds several profiles to one or more lists and continues after individual failures. | Per-profile/list result array; marks the member cache dirty for successful writes. |
| `createList(name, description)`      | Creates an `app.bsky.graph.list` record.                                            | `{ uri, success, message }`.                                                       |
| `updateList(uri, name, description)` | Replaces a list record using the URI's record key.                                  | `{ success, message }`.                                                            |
| `deleteList(uri)`                    | Deletes a list record using the URI's record key.                                   | `{ success, message }`.                                                            |
| `removeUserFromList(itemUri)`        | Deletes one list-item record.                                                       | `{ success, message }`; marks the member cache dirty.                              |
| `removeUsersFromList(itemUris)`      | Deletes several list-item records and continues after individual failures.          | Per-item result array; marks the member cache dirty for successful writes.         |

Read errors are logged and surfaced as user-facing errors. Batch mutations
record failures in their result arrays so other requested mutations can still
finish.

## AI Curation Flow

`curateUserLists()` requires both an authenticated agent/session and fetched
follows and lists. It uses the currently selected follows page, simplifies the
profiles and lists, and posts their JSON strings to `/api/suggestions`.

Before the request, it awaits `suggestionsStore.hasReachedLimit()`. The limit is
therefore enforced by store state before the server call. On success it tracks
the request, parses the API's JSON string, restores list URIs and follower DIDs
from locally available data, and writes `suggestionsJSON` to the suggestions
store. The Anthropic credential is not present in this module; the server route
owns that secret and provider call.

## Maintaining This Directory

- Add each newly exported service API to this README with its auth, return, and
  state-update behavior.
- When a Bluesky API method changes, update `OAUTH_SCOPE` with the needed
  granular `rpc:` or `repo:` permission.
- Preserve the read-operation dual-output contract: update the appropriate
  store and return matching `DataObject` and JSON data.
- Keep OAuth/session invalidation centralized through `OAuthService` rather
  than creating independent clients or agents in feature code.
