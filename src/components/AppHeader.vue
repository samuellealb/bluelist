<template>
  <header class="app-header">
    <h1 class="app-header__title">Bluelist</h1>
    <ThemeToggle />
    <div class="app-header__right">
      <div v-if="state.isLoggedIn" class="app-header__user-status">
        <span class="app-header__status-dot app-header__status-dot--online" />
        {{ state.formInfo.substring(0, state.formInfo.indexOf('with')) }}
      </div>
      <button
        v-if="state.isLoggedIn"
        class="data-display__refresh-button"
        @click="logout"
      >
        <span class="data-display__refresh-icon">[→]</span>
        <span class="data-display__refresh-text">Logout</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
import { AtpAgent } from '@atproto/api';
import ThemeToggle from '~/src/components/ThemeToggle.vue';
import '~/src/assets/styles/app-header.css';
import '~/src/assets/styles/data-display.css';

const logout = () => {
  // Clear authentication data
  localStorage.removeItem('loginData');

  // Reset state values
  state.isLoggedIn = false;
  state.did = '';
  state.formInfo = '';
  state.displayData = null;

  // Reset agent
  state.agent = new AtpAgent({
    service: 'https://bsky.social',
  });

  // Redirect to root URL
  navigateTo('/');
};
</script>
