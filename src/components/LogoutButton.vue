<template>
  <button
    v-if="state.isLoggedIn"
    class="data-display__refresh-button logout-button"
    @click="logout"
  >
    <span class="data-display__refresh-icon">[→]</span>
    <span class="data-display__refresh-text">Logout</span>
  </button>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
import { AtpAgent } from '@atproto/api';
import '~/src/assets/styles/data-display.css';

const logout = () => {
  localStorage.removeItem('loginData');

  state.isLoggedIn = false;
  state.did = '';
  state.formInfo = '';
  state.displayData = null;

  state.agent = new AtpAgent({
    service: 'https://bsky.social',
  });

  navigateTo('/');
};
</script>
