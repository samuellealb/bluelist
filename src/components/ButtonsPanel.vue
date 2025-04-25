<template>
  <div
    class="buttons-panel"
    :class="{ 'buttons-panel--disabled': state.isProcessingSuggestions }"
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
import { getTimeline, getLists, getFollows } from '~/src/lib/bsky';
import { state } from '~/src/store';
import ActionButton from '~/src/components/ActionButton.vue';
import type { DataObject } from '~/src/types/index';

defineOptions({
  name: 'ButtonsPanel',
});

const setLoading = () => {
  state.displayData = {
    type: 'loading',
    data: [],
  } as DataObject;
};

const setError = (error: Error) => {
  state.displayData = {
    type: 'error',
    data: [{ message: error.message }],
  } as unknown as DataObject;
};

const displayFeed = async (forceRefresh = false) => {
  try {
    if (!forceRefresh && state.timelineJSON) {
      state.displayData = JSON.parse(state.timelineJSON);
      return;
    }

    setLoading();
    const result = await getTimeline();
    state.displayData = result.displayData;
    state.timelineJSON = result.timelineJSON;
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
    if (!forceRefresh && !page && state.listsJSON) {
      state.displayData = JSON.parse(state.listsJSON);
      return;
    }

    setLoading();
    const result = await getLists(
      page || state.lists.currentPage,
      forceRefresh
    );
    state.displayData = result.displayData;
    state.listsJSON = result.listsJSON;
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
    if (!forceRefresh && !page && state.usersJSON) {
      state.displayData = JSON.parse(state.usersJSON);
      return;
    }

    setLoading();
    const result = await getFollows(
      page || state.follows.currentPage,
      forceRefresh
    );
    state.displayData = result.displayData;
    state.usersJSON = result.usersJSON;
  } catch (error) {
    setError(error as Error);
    console.error('Error displaying follows:', error);
  }
};

defineExpose({
  displayFeed,
  displayLists,
  displayFollows,
});
</script>
