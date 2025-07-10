<template>
  <div v-if="!authStore.isLoggedIn">
    <div v-if="errorMessage" class="error-banner">
      <span class="error-banner__prefix">[!]</span>
      {{ errorMessage }}
    </div>
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/src/stores/auth';
import LoginForm from '~/src/components/LoginForm.vue';

defineOptions({
  name: 'LoginPage',
});

definePageMeta({
  middleware: ['router'],
  title: 'Bluelist - Login',
});

const authStore = useAuthStore();
const route = useRoute();

// Handle OAuth callback errors
const errorMessage = computed(() => {
  const error = route.query.error;
  if (error === 'oauth_callback_failed') {
    return 'OAuth authentication failed. Please try again.';
  }
  return '';
});

watch(
  () => authStore.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      localStorage.setItem('bluelist_just_logged_in', 'true');
      navigateTo('/lists');
    }
  }
);
</script>

<style scoped>
.error-banner {
  background-color: var(--error-transparent-10);
  border: 1px solid var(--error-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  color: var(--error-color);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.error-banner__prefix {
  margin-right: 8px;
  font-weight: bold;
}
</style>
