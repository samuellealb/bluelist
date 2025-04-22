<template>
  <div class="app-container">
    <header class="header">
      <h1>Bluelist</h1>
      <div v-if="state.formInfo.includes('Logged in')" class="user-status">
        <span class="status-dot online" />
        {{ state.formInfo.substring(0, state.formInfo.indexOf('with')) }}
      </div>
    </header>

    <div class="main-content">
      <div v-if="!state.formInfo.includes('Logged in')" class="login-section">
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
          <DataDisplay :data="state.displayData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
import {
  getTimeline,
  getLists,
  getFollows,
  checkLoginSession,
} from '~/src/lib/bsky';
import { curateUserLists } from '~/src/lib/openai';
import LoginForm from '~/src/components/LoginForm.vue';
import ActionButtons from '~/src/components/ActionButtons.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import '~/src/assets/styles/app.css';

defineOptions({
  name: 'BlueList',
});

onMounted(() => {
  checkLoginSession();
});

const displayFeed = async () => {
  try {
    state.displayData = 'loading';
    state.displayData = await getTimeline();
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
    state.displayData = await curateUserLists();
  } catch (error) {
    state.displayData = (error as Error).message;
    console.error('Error in displaySuggestions:', error);
  }
};
</script>
