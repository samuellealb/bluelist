<template>
  <div class="oauth-callback">
    <div class="oauth-callback__container">
      <div class="oauth-callback__content">
        <h1>Processing OAuth Callback...</h1>
        <div class="oauth-callback__loader">
          <span class="oauth-callback__spinner">●</span>
          <p>Completing authentication...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '~/src/stores/auth';

defineOptions({
  name: 'OAuthCallback',
});

definePageMeta({
  title: 'OAuth Callback - Bluelist',
  layout: false,
});

const authStore = useAuthStore();

onMounted(async () => {
  // The OAuth service will handle the callback automatically when initialized
  await authStore.checkLoginSession();
  // Prevent middleware/router.ts from re-running session init on the next navigation
  authStore.setInitialized(true);

  if (authStore.isLoggedIn) {
    await navigateTo('/lists', { replace: true });
  } else {
    await navigateTo('/?error=oauth_callback_failed', { replace: true });
  }
});
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  font-family: var(--font-mono);
}

.oauth-callback__container {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  border: var(--border-style);
  text-align: center;
  min-width: 300px;
}

.oauth-callback__content h1 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.oauth-callback__loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.oauth-callback__spinner {
  display: inline-block;
  font-size: 1.5rem;
  color: var(--accent-color);
  animation: spin 1s linear infinite;
}

.oauth-callback__loader p {
  color: var(--text-light);
  margin: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
