<template>
  <div class="oauth-login">
    <div class="input-group">
      <label for="bluesky-handle">Bluesky Handle</label>
      <input
        id="bluesky-handle"
        v-model="handle"
        type="text"
        placeholder="username.bsky.social"
        :disabled="isLoading"
      >
    </div>
    <button
      class="oauth-button"
      :disabled="isLoading || !handle"
      @click="login"
    >
      <span v-if="isLoading">Redirecting...</span>
      <span v-else>Login with Bluesky</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/src/stores/auth';

const authStore = useAuthStore();
const handle = ref('');
const isLoading = computed(() => authStore.isOauthLoading);

async function login() {
  if (!handle.value) return;

  try {
    const authUrl = await authStore.initiateOAuthLogin(handle.value);
    // Redirect to the authorization URL
    window.location.href = authUrl;
  } catch (error) {
    console.error('OAuth login error:', error);
  }
}
</script>

<style scoped>
.oauth-login {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.input-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
}

.oauth-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0070f3; /* Bluesky blue */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.oauth-button:hover:not(:disabled) {
  background-color: #0051b3;
}

.oauth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
