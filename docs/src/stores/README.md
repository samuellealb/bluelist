# Stores

Bluelist uses Pinia Options API stores. Store mutations are exposed through
actions; services and components read store state through the corresponding
`use*Store` composable.

## `auth.ts`

`useAuthStore` owns OAuth authentication and the active AT Protocol agent.

**State**

- `formInfo` and `loginError`: user-facing authentication status strings.
- `did`: the authenticated user's DID.
- `isLoggedIn` and `initialized`: authentication and startup status.
- `currentSession`: the active `OAuthSession`, or `null`.
- `currentAgent`: the OAuth-authenticated `Agent`, or `null`.

**Actions**

- Basic setters: `setFormInfo`, `setLoginError`, `setDid`, and `setInitialized`.
- Session lifecycle: `login`, `logout`, `initializeOAuth`, `signInWithHandle`,
  `restoreSession`, and `checkLoginSession`.
- `getAgent` returns the current authenticated agent for Bluesky service calls.
- `handleSessionExpired` records a session-expired message, logs out, and reloads
  the page.
- Legacy compatibility methods: `loginUser`, `getJwtExpiry`, `decodeBase64`, and
  `isTokenExpiringSoon`.

`login` creates the agent through `OAuthService` and asks the suggestions store
to load the newly authenticated user's quota data. `logout` resets OAuthService;
this store does not write session data to `localStorage` directly.

## `follows.ts`

`useFollowsStore` holds the follows response JSON and cursor-paginated follows.

**State**

- `usersJSON`: serialized follows response data.
- `follows`: `allFollows`, `currentPage`, `itemsPerPage` (20), `cursor`,
  `hasMorePages`, `prefetchedPages`, and `isFetching`.

**Getters**

- `getCurrentPageFollows`: the cached follows for the current page.
- `totalPages`: cached page count, with one additional possible page while a
  cursor indicates more data.

**Actions**

- Data updates: `setUsersJSON`, `setFollows`, and `addFollows`.
- Pagination updates: `setCursor`, `setHasMorePages`, `setCurrentPage`,
  `setPrefetchedPages`, `setIsFetching`, and `resetPagination`.

This store has no direct cross-store dependencies or persistence. Its JSON and
structured follow data are intended to be updated together by the Bluesky
service.

## `lists.ts`

`useListsStore` manages separate cursor-paginated collections for owned lists
and members of the active list, plus member-count cache state.

**State**

- `listsJSON`: serialized lists response data.
- `lists`: `allLists`, `currentPage`, `itemsPerPage` (10), `cursor`,
  `hasMorePages`, `prefetchedPages`, and `isFetching`.
- `members`: `allMembers`, matching pagination state with `itemsPerPage` (10),
  and `activeListUri`.
- `membersCacheDirty` and `memberCountsCache`: invalidation flag and cached
  member totals keyed by list URI.

**Getters**

- `hasLists`: whether at least one list is cached.
- `totalPages`: cached lists page count, with one additional possible page when
  a cursor is present.
- `activeList`: the cached active list, a loading placeholder for an uncached
  active URI, or an unknown-list placeholder.

**Actions**

- List updates: `setListsJSON`, `setLists`, `addLists`, `setCursor`,
  `setHasMorePages`, `setCurrentPage`, `setPrefetchedPages`, `setIsFetching`,
  and `resetPagination`.
- Member updates: `setMembers`, `addMembers`, `setActiveListUri`,
  `setMembersCurrentPage`, `setMembersCursor`, `setMembersHasMorePages`,
  `setMembersPrefetchedPages`, `setMembersIsFetching`, `getCurrentPageMembers`,
  `getMembersTotalPages`, `resetMembersPagination`, and `resetAllMembersData`.
- Member-count cache: `setMembersCacheDirty`, `setMemberCount`,
  `getMemberCount`, and `clearMemberCountsCache`.

Setting the member-cache dirty flag to `true` clears all cached counts. This
store has no direct cross-store dependencies or persistence.

## `suggestions.ts`

`useSuggestionsStore` tracks AI suggestion activity and enforces a daily,
per-user request limit.

**State**

- `isProcessingSuggestions`: whether a suggestion request is in progress.
- `requestCounts`: daily request counts keyed by ISO date.
- `suggestionsJSON`: serialized suggestions response data.

**Actions**

- Status and response updates: `setIsProcessing` and `setSuggestionsJSON`.
- Persistence: `loadRequestCounts` and `saveRequestCounts`.
- Limit handling: `trackRequest`, `hasReachedLimit`, `getRemainingRequests`, and
  `resetCounts`.

Request counts persist in `localStorage` under `suggestionRequests_<did>`.
Reads reset to an empty object when stored JSON cannot be parsed; write failures
are logged. All DID-dependent actions obtain `useAuthStore()` within the action.
Before counting or checking a limit, the store calls `/api/exemptUsers` for the
current DID; exempt users bypass the five-request daily limit.

## `ui.ts`

`useUiStore` holds the currently selected renderable data and serialized
timeline response data.

**State**

- `displayData`: the current `DataObject`, or `null`.
- `timelineJSON`: serialized timeline response data.

**Actions**

- `setDisplayData` updates the active data view.
- `setTimelineJSON` updates the serialized timeline response.

This store has no direct cross-store dependencies or persistence. Services keep
its JSON and `displayData` in sync when presenting timeline data.

## Data Flow

Bluesky service reads populate the follows and lists stores and update the UI
store with the relevant `DataObject` for rendering. Pagination actions preserve
the cached items, cursor, and page state used by those reads. Authentication is
the upstream dependency: the auth store provides the active agent, and its
successful login triggers suggestions quota loading. The suggestions store then
uses the authenticated DID for storage and the exemption check.
