# Components

This directory contains the Vue components that render the authenticated
workspace, load and display Bluesky data, and manage list membership actions.

## Component Reference

### `ActionButton.vue`

Reusable navigation/action button. It accepts `icon` and `label` props, emits
`click`, and disables itself while `useSuggestionsStore().isProcessingSuggestions`
is true.

### `AppHeader.vue`

Renders the application title, theme control, and authenticated-user status.
It reads `useAuthStore()` and composes `ThemeToggle` and `LogoutButton`.

### `ButtonsPanel.vue`

Provides list and follow navigation controls and owns the data-loading
operations exposed to other components:

- `displayFeed(forceRefresh?)`
- `displayLists(forceRefresh?, page?)`
- `displayFollows(forceRefresh?, page?)`
- `displayListPosts(listUri, forceRefresh?)`
- `displayListMembers(listUri, forceRefresh?, page?)`

It uses `getTimeline`, `getLists`, `getFollows`, `getListPosts`,
`getListMembers`, and `fetchListDetails` from `bskyService`. Results and loading
or error states are written to `useUiStore()`, while cached JSON and pagination
state are managed through `useFollowsStore()` and `useListsStore()`. It also
uses `useSuggestionsStore()` to disable navigation while suggestions are being
processed.

### `Dashboard.vue`

Coordinates the authenticated workspace. Its optional `defaultView` prop
selects `lists`, `follows`, `feed`, `list-posts`, or `list-members` and defaults
to `lists`. It reads `useAuthStore()` and `useUiStore()`, renders `LoginForm`
when signed out, and otherwise composes `ButtonsPanel` with `DataDisplay`.

`Dashboard` calls the methods exposed by `ButtonsPanel` to load the requested
view. It receives `DataDisplay`'s `refresh(type, page?)` event and delegates
the refresh or pagination request back to the appropriate exposed method.

### `DataCard.vue`

Renders one indexed item from a `DataObject`. Required props are `item` and
`index`. It supports timeline, list, follow, and list-post views.

For list cards, it fetches member counts with `getListMemberCount`, caches them
in `useListsStore()`, navigates to list detail views, and can delete a list with
`deleteList`. It composes `ListForm` for editing and `ListChips` for assigning a
follow to a list. It emits `list-updated`, `list-deleted`, and `add-to-list`.

Its exposed `toggleFollowAllLists(enable?, invertEach?)` and
`followEnabledLists` let `DataDisplay` control and apply follow-to-list
assignments in bulk. It reads `useSuggestionsStore()` to present processing
state.

### `DataDisplay.vue`

The central data renderer. Its required `data` prop accepts `DataObject | null`
and it emits `refresh(type, page?)` for manual refreshes and pagination.

It renders loading, error, empty, timeline, lists, follows, list-posts, and
list-members states. It composes `DataCard`, `MemberCard`, `Pagination`, and
`ListForm`. The component reads `useFollowsStore()`, `useListsStore()`, and
`useSuggestionsStore()` for pagination, list state, and suggestion limits; it
also writes a temporary create-list state through `useUiStore()`.

For follow data, it invokes `curateUserLists()` and calls `addUserToList` for
batch assignments. For member data, it coordinates selected `MemberCard`
instances and invokes `removeUsersFromList` for batch removal. It refreshes in
response to list edits, deletions, creation, or individual member removal.

### `ListChips.vue`

Displays selectable list chips for one profile. Its required `profileDid` prop
identifies the profile; optional props are `profileName`, `lists`, `title`,
`showNoListsMessage`, and `hideWarningButShowLists`.

It obtains available lists from `useListsStore()` when no suggestions are
provided. A chip calls `addUserToList`; the component emits
`add-to-list(profileDid, listName, success)` and
`update:enabledLists(enabledLists)`. Its exposed `toggleAllLists(enable?,
invertEach?)` enables bulk selection by `DataCard`.

### `ListForm.vue`

Creates or edits a list. Optional props are `isEditMode`,
`showCancelInCreateMode`, and `listData` (`uri`, `name`, and `description`). It
validates the name and description, then calls `createList` or `updateList`.

It emits `list-created`, `list-updated`, `list-deleted`, `delete-requested`,
and `cancel-edit`. Deletion is intentionally requested from its embedding
component rather than performed directly here.

### `LoginForm.vue`

Collects and validates a dotted Bluesky handle, then calls
`useAuthStore().signInWithHandle(handle)`. It reads and clears the auth store's
login error; it has no public props or emitted events.

### `LogoutButton.vue`

Displays only for an authenticated user. It removes the persisted login data,
calls `useAuthStore().logout()`, clears `useUiStore()` display data, and
navigates to the sign-in state. It has no public props or emitted events.

### `MemberCard.vue`

Renders one list member. Its required `item` prop contains the member profile
and membership URI. A normal click calls `removeUserFromList`; the checkbox
toggles selection for bulk removal.

It emits `remove-success`, `remove-error(error)`, and
`toggle-selected(selected, itemUri)`. Its exposed `isSelected` state is used by
`DataDisplay` for batch selection control.

### `Pagination.vue`

Displays first, previous, next, and last-loaded-page controls. Required props
are `currentPage`, `totalPages`, `isLoading`, and `hasMorePages`; optional props
are `totalItems`, `isTop`, and `dataType`. It emits `pageChange(page)`.

It reads `useFollowsStore()` and `useListsStore()` to calculate the last loaded
page for follows, lists, and list members, and uses `useSuggestionsStore()` to
disable pagination while suggestions are processing.

### `ThemeToggle.vue`

Switches between dark and light themes. It stores the selected theme in local
storage and applies the `light-theme` class to the document root. It has no
public props or emitted events.

## Cooperation

`Dashboard` selects a view and calls the exposed loader on `ButtonsPanel`.
`ButtonsPanel` fetches data and updates the UI state consumed by `DataDisplay`.
`DataDisplay` chooses `DataCard` or `MemberCard` for each item, forwards
refresh and pagination intent to `Dashboard`, and coordinates bulk operations.

For follow management, `DataCard` hosts `ListChips`; their selection state is
exposed back to `DataDisplay`, which can apply suggested or manually enabled
list assignments in bulk. For lists, `DataCard` hosts `ListForm` to edit an
individual list, while `DataDisplay` hosts it to create a list. Both paths emit
success events that cause the displayed list data to refresh.
