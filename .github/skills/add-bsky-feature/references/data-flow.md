# Data Flow & Contracts

## Layered flow

```text
Page / Component
  → src/lib/bskyService.ts (service fn)
      → AtpService.getAgent() → AtpAgent → Bluesky PDS
      → store.$patch({ displayData, ...JSON })   (writes results into Pinia)
  → DataDisplay.vue renders store `displayData`
  → DataCard.vue switches on item.type
```

## The `DataObject` contract (`src/types/misc-types.ts`)

```ts
interface DataObject {
  type:
    | 'timeline'
    | 'lists'
    | 'follows'
    | 'list-posts'
    | 'list-members'
    | 'error'
    | 'loading';
  data:
    | TimelineItem[]
    | ListItem[]
    | FollowItem[]
    | SuggestionItem[]
    | { message: string }[];
  pagination?: { currentPage?; totalPages?; totalPrefetched?; hasMorePages? };
  listInfo?: { name: string; description?: string; uri: string };
}
```

- A new view type means: new literal in `type`, new item type in `data`, and a
  new branch in `DataCard.vue`.

## Service return convention

Read functions return `{ displayData: DataObject, ...JSON }` **and** write the
same payload to the store:

```ts
uiStore.$patch({ displayData, timelineJSON: json });
return { displayData, timelineJSON: json };
```

Keep the structured data and the JSON string field in sync.

## Error / auth handling

```ts
if (!authStore.isLoggedIn) throw new Error('Please login first');
// ...
catch (error) {
  if ((error as Error).message === 'Token has expired') {
    authStore.handleSessionExpired();
  }
  throw new Error('Descriptive message');
}
```

## Pagination

Cursor-based with prefetch. Fetch a new batch only when the requested page
exceeds cached pages and a `cursor` exists; append to `all*`, advance
`prefetchedPages`, and gate with `isFetching`.

## Stores involved

`auth` (session/DID), `follows`, `lists` (lists + members slices),
`suggestions` (AI daily limit), `ui` (`displayData`). Access one store from
another only inside an action.
