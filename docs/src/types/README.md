# Type Contracts

This directory defines the TypeScript contracts shared by Bluelist's services,
stores, and UI. Each direct file owns one domain. Consumers should import from
the central barrel:

```ts
import type { DataObject, FollowItem, ListItem } from '~/src/types';
```

## Domain Files

### `auth-types.ts`

Authentication and auth-store contracts.

- `BskyLoginResponse`: Bluesky credential-login response containing the DID,
  handle, access token, and refresh token.
- `AuthStore`: inferred return type of `useAuthStore`.

### `bsky-types.ts`

Bluesky API shapes and shared presentation-friendly domain models.

- `Author`: post author identity and optional display name.
- `TimelineItem`: normalized timeline post data.
- `BskyTimelineResponse`: raw timeline response shape.
- `BskyAgent`: subset of the authenticated agent methods used by the app,
  including graph, feed, repository, profile, login, and header APIs.
- `DetailedResult`: outcome of a list membership operation.
- `SimplifiedUser`: AI-curation input for a followed account.
- `SimplifiedList`: AI-curation input for a Bluesky list.

### `follows-types.ts`

Followed-account data and follows-store contract.

- `FollowItem`: normalized followed account data.
- `BskyFollowsResponse`: raw paginated follows response shape.
- `FollowsStore`: inferred return type of `useFollowsStore`.

### `lists-types.ts`

List metadata, list membership, repository-write, and lists-store contracts.

- `ListItem`: normalized list metadata.
- `BskyListsResponse`: raw paginated lists response shape.
- `BskyListItemsResponse`: raw list-member response, including optional list
  metadata.
- `RepoCreateRecordParams`: repository record creation payload for a list item.
- `ListMemberItem`: normalized list-member profile data.
- `ListsStore`: inferred return type of `useListsStore`.

### `suggestions-types.ts`

Anthropic suggestion data and local daily request-count tracking.

- `SuggestedList`: a list proposed for a user.
- `SuggestionItem`: a user with their suggested lists.
- `RequestCounts`: per-date request counts keyed by date string.

### `misc-types.ts`

Cross-domain display and generic API response contracts.

- `DataObject`: the discriminated display payload consumed by `DataCard.vue`.
  Its `type` selects timeline, lists, follows, error, loading, list posts, or
  list members data; optional `pagination` and `listInfo` add view context.
- `ApiResponseList`: a compact list reference.
- `ApiResponseItem`: an API user result with optional matching lists.
- `ApiResponse`: a result collection with an optional error message.

When adding a `DataObject` view type, extend its `type` and `data` unions and
add the corresponding `DataCard.vue` render branch.

## Barrel Export

`index.ts` re-exports every contract from the six domain files above. It is the
public import boundary for this directory; avoid importing individual type
modules unless a local implementation specifically requires it.
