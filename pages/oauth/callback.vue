<template>
  <div class="oauth-callback-container">
    <div v-if="isLoading" class="loading-state">
      <h2>Completing Authentication</h2>
      <p>Please wait while we complete your authentication...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <h2>Authentication Failed</h2>
      <p>{{ error }}</p>
      <button class="action-button" @click="goToLogin">Back to Login</button>
    </div>
    <div v-else class="success-state">
      <h2>Authentication Successful!</h2>
      <p>You are now logged in. Redirecting to the dashboard...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/src/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
  const code = route.query.code as string | undefined;
  const state = route.query.state as string | undefined;

  if (!code || !state) {
    error.value = 'Missing required parameters';
    isLoading.value = false;
    return;
  }

  try {
    await authStore.completeOAuthLogin(code, state);

    // Redirect to home page after successful login
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An unknown error occurred';
    console.error('OAuth callback error:', e);
  } finally {
    isLoading.value = false;
  }
});

function goToLogin() {
  router.push('/');
}
</script>

<style scoped>
.oauth-callback-container {
  max-width: 500px;
  margin: 100px auto;
  padding: 2rem;
  border-radius: 8px;
  background-color: var(--card-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.loading-state,
.error-state,
.success-state {
  padding: 1rem;
}

.action-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.action-button:hover {
  background-color: var(--primary-hover);
}
</style>
