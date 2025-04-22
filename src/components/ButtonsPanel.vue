<template>
  <div class="action-buttons">
    <ActionButton icon="📋" label="Display Feed" @click="displayFeed" />
    <ActionButton icon="📑" label="Display Lists" @click="displayLists" />
    <ActionButton icon="👥" label="Display Follows" @click="displayFollows" />
    <ActionButton
      icon="✨"
      label="Display Suggestions"
      @click="displaySuggestions"
    />
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/action-buttons.css';
import { getTimeline, getLists, getFollows } from '~/src/lib/bsky';
import { curateUserLists } from '~/src/lib/openai';
import { state } from '~/src/store';
import ActionButton from '~/src/components/ActionButton.vue';
import type { DataObject } from '~/src/types';

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

const displayFeed = async () => {
  try {
    setLoading();
    const result = await getTimeline();
    state.displayData = result.displayData;
    state.timelineJSON = result.timelineJSON;
  } catch (error) {
    setError(error as Error);
    console.error(error);
  }
};

const displayLists = async () => {
  try {
    setLoading();
    const result = await getLists();
    state.displayData = result.displayData;
    state.listsJSON = result.listsJSON;
  } catch (error) {
    setError(error as Error);
    console.error(error);
  }
};

const displayFollows = async () => {
  try {
    setLoading();
    const result = await getFollows();
    state.displayData = result.displayData;
    state.usersJSON = result.usersJSON;
  } catch (error) {
    setError(error as Error);
    console.error(error);
  }
};

const displaySuggestions = async () => {
  try {
    setLoading();
    const result = await curateUserLists();
    state.displayData = result.displayData;
    state.suggestionsJSON = result.suggestionsJSON;
  } catch (error) {
    setError(error as Error);
    console.error('Error in displaySuggestions:', error);
  }
};
</script>
