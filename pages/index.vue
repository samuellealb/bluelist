<template>
  <LoginForm v-if="!authStore.isLoggedIn" />
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
