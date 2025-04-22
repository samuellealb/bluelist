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

defineOptions({
  name: 'ButtonsPanel',
});

const displayFeed = async () => {
  try {
    state.displayData = 'loading';
    const timelineData = await getTimeline();
    state.displayData = timelineData;
  } catch (error) {
    state.displayData = (error as Error).message;
    console.error(error);
  }
};

const displayLists = async () => {
  try {
    state.displayData = 'loading';
    const result = await getLists();
    state.displayData = result.displayData;
    state.listsJSON = result.listsJSON;
  } catch (error) {
    state.displayData = (error as Error).message;
    console.error(error);
  }
};

const displayFollows = async () => {
  try {
    state.displayData = 'loading';
    const result = await getFollows();
    state.displayData = result.displayData;
    state.usersJSON = result.usersJSON;
  } catch (error) {
    state.displayData = (error as Error).message;
    console.error(error);
  }
};

const displaySuggestions = async () => {
  try {
    state.displayData = 'loading';
    const suggestions = await curateUserLists();
    state.displayData = suggestions;
  } catch (error) {
    state.displayData = (error as Error).message;
    console.error('Error in displaySuggestions:', error);
  }
};
</script>
