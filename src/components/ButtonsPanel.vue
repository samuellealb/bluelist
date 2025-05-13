<template>
  <div
    class="buttons-panel"
    :class="{
      'buttons-panel--disabled': suggestionsStore.isProcessingSuggestions,
    }"
  >
    <NuxtLink v-slot="{ navigate }" to="/lists" custom>
      <ActionButton icon="[#]" label="Lists" @click="() => navigate()" />
    </NuxtLink>
    <NuxtLink v-slot="{ navigate }" to="/follows" custom>
      <ActionButton icon="[o]" label="Follows" @click="() => navigate()" />
    </NuxtLink>
    <!-- <NuxtLink v-slot="{ navigate }" to="/feed" custom>
      <ActionButton icon="[≡]" label="Feed" @click="() => navigate()" />
    </NuxtLink> -->
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/action-buttons.css';
import { getTimeline, getLists, getFollows } from '~/src/lib/bskyService';
import { useFollowsStore } from '~/src/stores/follows';
import { useListsStore } from '~/src/stores/lists';
import { useUiStore } from '~/src/stores/ui';
import { useSuggestionsStore } from '~/src/stores/suggestions';
import ActionButton from '~/src/components/ActionButton.vue';
import type { DataObject } from '~/src/types/index';

defineOptions({
  name: 'ButtonsPanel',
});

const followsStore = useFollowsStore();
const listsStore = useListsStore();
const uiStore = useUiStore();
const suggestionsStore = useSuggestionsStore();

const setLoading = () => {
  uiStore.setDisplayData({
    type: 'loading',
    data: [],
  } as DataObject);
};

const setError = (error: Error) => {
  uiStore.setDisplayData({
    type: 'error',
    data: [{ message: error.message }],
  } as unknown as DataObject);
};

/**
 * Display feed from the user's timeline
 * @param forceRefresh Whether to refresh data even if cached
 */
const displayFeed = async (forceRefresh = false) => {
  try {
    if (forceRefresh) {
      uiStore.setTimelineJSON('');
    }

    if (!forceRefresh && uiStore.timelineJSON) {
      uiStore.setDisplayData(JSON.parse(uiStore.timelineJSON));
      return;
    }

    setLoading();
    const result = await getTimeline();
    uiStore.setDisplayData(result.displayData);
    uiStore.setTimelineJSON(result.timelineJSON);
  } catch (error) {
    setError(error as Error);
    console.error(error);
  }
};

/**
 * Display lists with pagination support
 * @param forceRefresh Whether to refresh data even if cached
 * @param page Optional page number to fetch
 */
const displayLists = async (forceRefresh = false, page?: number) => {
  try {
    // Check if we have too few lists (only one or none) - this could indicate we just came from a single list detail page
    const hasTooFewLists = listsStore.lists.allLists.length <= 1;

    const shouldForceRefresh =
      forceRefresh || listsStore.membersCacheDirty || hasTooFewLists;

    if (shouldForceRefresh) {
      listsStore.setListsJSON('');
      listsStore.resetPagination();
      if (listsStore.membersCacheDirty) {
        listsStore.setMembersCacheDirty(false);
      }
    }

    const needsRefresh = shouldForceRefresh || !listsStore.listsJSON;

    if (!needsRefresh && !page && listsStore.listsJSON) {
      uiStore.setDisplayData(JSON.parse(listsStore.listsJSON));
      return;
    }

    setLoading();
    const result = await getLists(
      page || listsStore.lists.currentPage,
      shouldForceRefresh
    );
    uiStore.setDisplayData(result.displayData);
    listsStore.setListsJSON(result.listsJSON);
  } catch (error) {
    setError(error as Error);
    console.error('Error displaying lists:', error);
  }
};

/**
 * Display follows with pagination support
 * @param forceRefresh Whether to refresh data even if cached
 * @param page Optional page number to fetch
 */
const displayFollows = async (forceRefresh = false, page?: number) => {
  try {
    if (forceRefresh) {
      followsStore.setUsersJSON('');
      followsStore.resetPagination();
    }

    if (!forceRefresh && !page && followsStore.usersJSON) {
      uiStore.setDisplayData(JSON.parse(followsStore.usersJSON));
      return;
    }

    setLoading();
    const result = await getFollows(
      page || followsStore.follows.currentPage,
      forceRefresh
    );
    uiStore.setDisplayData(result.displayData);
    followsStore.setUsersJSON(result.usersJSON);
  } catch (error) {
    setError(error as Error);
    console.error('Error displaying follows:', error);
  }
};

/**
 * Display posts from a specific list
 * @param {string} listUri - The URI of the list to display posts from
 * @param {boolean} [_forceRefresh=false] - Whether to force a refresh of the data (unused)
 */
const displayListPosts = async (listUri: string, _forceRefresh = false) => {
  try {
    if (!listUri) {
      throw new Error('List URI is required');
    }

    // Store the URI for legacy components and potential slug mapping
    if (import.meta.client) {
      localStorage.setItem('bluelist_current_list_uri', listUri);
    }

    setLoading();
    const { getListPosts } = await import('~/src/lib/bskyService');
    const result = await getListPosts(listUri);
    uiStore.setDisplayData(result.displayData);
  } catch (error) {
    setError(error as Error);
    console.error('Error displaying list posts:', error);
  }
};

/**
 * Display members from a specific list with pagination support
 * @param {string} listUri - The URI of the list to display members from
 * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the data
 * @param {number} [page] - Optional page number to fetch (defaults to current page in state)
 */
const displayListMembers = async (
  listUri: string,
  forceRefresh = false,
  page?: number
) => {
  try {
    if (!listUri) {
      throw new Error('List URI is required');
    }

    // Store the URI for legacy components and potential slug mapping
    if (import.meta.client) {
      localStorage.setItem('bluelist_current_list_uri', listUri);
    }

    setLoading();

    // First fetch the list details to ensure the list name is available
    const { fetchListDetails, getListMembers } = await import(
      '~/src/lib/bskyService'
    );

    try {
      // Pre-fetch the list details to ensure we have the list name
      await fetchListDetails(listUri);
    } catch (err) {
      console.warn('Error pre-fetching list details:', err);
      // Continue even if list details fetch fails
    }

    // Try fetching list members with retry logic
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        result = await getListMembers(listUri, page, forceRefresh);
        break;
      } catch (err) {
        retryCount++;
        if (
          retryCount >= maxRetries ||
          !(err instanceof Error) ||
          err.message !== 'Already fetching list members data'
        ) {
          // If we've reached max retries or got an error different from the race condition, rethrow
          throw err;
        }
        console.warn(
          `Retry ${retryCount}/${maxRetries} for list members, waiting a bit...`
        );
        // Wait with exponential backoff before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, 300 * Math.pow(2, retryCount))
        );
      }
    }

    if (result) {
      uiStore.setDisplayData(result.displayData);
    }
  } catch (error) {
    setError(error as Error);
    console.error('Error displaying list members:', error);
  }
};

defineExpose({
  displayFeed,
  displayLists,
  displayFollows,
  displayListPosts,
  displayListMembers,
});
</script>
