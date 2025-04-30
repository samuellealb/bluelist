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
    if (forceRefresh) {
      listsStore.setListsJSON('');
      listsStore.resetPagination();
    }

    if (!forceRefresh && !page && listsStore.listsJSON) {
      uiStore.setDisplayData(JSON.parse(listsStore.listsJSON));
      return;
    }

    setLoading();
    const result = await getLists(
      page || listsStore.lists.currentPage,
      forceRefresh
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
 * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the data
 */
const displayListPosts = async (listUri: string, _forceRefresh = false) => {
  try {
    if (!listUri) {
      throw new Error('List URI is required');
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

    if (import.meta.client) {
      localStorage.setItem('bluelist_current_list_uri', listUri);
    }

    setLoading();
    const { getListMembers } = await import('~/src/lib/bskyService');
    const result = await getListMembers(listUri, page, forceRefresh);
    uiStore.setDisplayData(result.displayData);
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
