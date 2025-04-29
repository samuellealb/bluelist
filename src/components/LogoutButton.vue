<template>
  <button
    v-if="authStore.isLoggedIn"
    class="data-display__refresh-button logout-button"
    :disabled="isLoggingOut"
    @click="logout"
  >
    <span class="data-display__refresh-icon">[→]</span>
    <span class="data-display__refresh-text">{{
      isLoggingOut ? 'Logging out...' : 'Logout'
    }}</span>
  </button>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/src/stores/auth';
import { useUiStore } from '~/src/stores/ui';
import '~/src/assets/styles/data-display.css';

const authStore = useAuthStore();
const uiStore = useUiStore();
const isLoggingOut = ref(false);

const logout = async () => {
  isLoggingOut.value = true;

  try {
    // Try to logout via OAuth first, which will handle server-side cleanup
    await authStore.oauthLogout();

    // Also clear local storage for backward compatibility with password login
    localStorage.removeItem('loginData');

    // Reset UI state
    uiStore.setDisplayData(null);

    // Navigate to home page
    navigateTo('/');
  } catch (error) {
    console.error('Error during logout:', error);

    // Fallback to standard logout if OAuth logout fails
    authStore.logout();
    localStorage.removeItem('loginData');
    uiStore.setDisplayData(null);
    navigateTo('/');
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<style scoped>
.logout-button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
