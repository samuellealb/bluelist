<template>
  <button
    v-if="authStore.isLoggedIn"
    class="data-display__refresh-button logout-button"
    @click="logout"
  >
    <span class="data-display__refresh-icon">[→]</span>
    <span class="data-display__refresh-text">Logout</span>
  </button>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/src/stores/auth';
import { useUiStore } from '~/src/stores/ui';
import '~/src/assets/styles/data-display.css';

const authStore = useAuthStore();
const uiStore = useUiStore();

const logout = () => {
  localStorage.removeItem('loginData');

  authStore.logout();
  uiStore.setDisplayData(null);

  navigateTo('/');
};
</script>
