<template>
  <div>
    <div v-if="!state.isLoggedIn" class="login-section">
      <div class="card">
        <h2>Login</h2>
        <LoginForm />
      </div>
    </div>

    <div v-else class="dashboard">
      <div class="actions-panel card">
        <h2>Actions</h2>
        <ActionButtons
          @display-feed="displayFeed"
          @display-lists="displayLists"
          @display-follows="displayFollows"
          @display-suggestions="displaySuggestions"
        />
      </div>

      <div class="data-panel card">
        <DataDisplay :data="displayData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTimeline, getLists, getFollows } from '~/src/lib/bsky';
import { curateUserLists } from '~/src/lib/openai';
import LoginForm from '~/src/components/LoginForm.vue';
import ActionButtons from '~/src/components/ActionButtons.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import { state } from '~/src/store';

defineOptions({
  name: 'UserDashboard',
});

defineProps<{
  formInfo: string;
  displayData: string;
}>();

const emit = defineEmits<{
  'update:display-data': [value: string];
  'update:lists-json': [value: string];
  'update:users-json': [value: string];
}>();

const displayFeed = async () => {
  try {
    emit('update:display-data', 'loading');
    const timelineData = await getTimeline();
    emit('update:display-data', timelineData);
  } catch (error) {
    emit('update:display-data', (error as Error).message);
    console.error(error);
  }
};

const displayLists = async () => {
  try {
    emit('update:display-data', 'loading');
    const result = await getLists();
    emit('update:display-data', result.displayData);
    emit('update:lists-json', result.listsJSON);
  } catch (error) {
    emit('update:display-data', (error as Error).message);
    console.error(error);
  }
};

const displayFollows = async () => {
  try {
    emit('update:display-data', 'loading');
    const result = await getFollows();
    emit('update:display-data', result.displayData);
    emit('update:users-json', result.usersJSON);
  } catch (error) {
    emit('update:display-data', (error as Error).message);
    console.error(error);
  }
};

const displaySuggestions = async () => {
  try {
    emit('update:display-data', 'loading');
    const suggestions = await curateUserLists();
    emit('update:display-data', suggestions);
  } catch (error) {
    emit('update:display-data', (error as Error).message);
    console.error('Error in displaySuggestions:', error);
  }
};
</script>
