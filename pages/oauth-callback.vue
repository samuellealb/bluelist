<template>
  <div class="oauth-callback">
    <div v-if="loading" class="oauth-callback__loading">
      <h2>Processing login...</h2>
      <div class="oauth-callback__spinner">[|]</div>
    </div>
    <div v-if="error" class="oauth-callback__error">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button class="login-form__submit" @click="goToHome">
        Return to login
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/src/stores/auth';
import { OAuthService } from '~/src/lib/OAuthService';
import '~/src/assets/styles/login-form.css';

definePageMeta({
  title: 'OAuth Callback',
  layout: 'default',
});

const loading = ref(true);
const error = ref('');
const authStore = useAuthStore();

onMounted(async () => {
  // Make sure we're not on server
  if (import.meta.server) return;

  try {
    // Process the OAuth callback
    const authData = await OAuthService.handleCallback();

    // Use the OAuth login method from auth store
    authStore.loginWithOAuth(
      authData.accessToken,
      authData.did,
      authData.handle
    );

    // Save login data to localStorage
    const loginData = {
      did: authData.did,
      handle: authData.handle,
      accessJwt: authData.accessToken,
      refreshJwt: authData.refreshToken,
    };
    localStorage.setItem('loginData', JSON.stringify({ loginData }));

    // Redirect to lists page
    localStorage.setItem('bluelist_just_logged_in', 'true');
    navigateTo('/lists');
  } catch (err) {
    error.value = `Login failed: ${(err as Error).message || 'Unknown error'}`;
    loading.value = false;
    console.error('OAuth callback error:', err);
  }
});

const goToHome = () => {
  navigateTo('/');
};
</script>

<style scoped>
.oauth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.oauth-callback__loading,
.oauth-callback__error {
  text-align: center;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--card-bg-color);
}

.oauth-callback__spinner {
  margin: 2rem auto;
  animation: spin 1.5s linear infinite;
  font-size: 2rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
