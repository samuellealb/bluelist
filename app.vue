<template>
  <div class="app">
    <AppHeader />
    <div class="app__content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '~/src/stores/auth';
import AppHeader from '~/src/components/AppHeader.vue';
import '~/src/assets/styles/app.css';

defineOptions({
  name: 'BlueList',
});

onMounted(async () => {
  const authStore = useAuthStore();
  await authStore.checkLoginSession();
});
</script>
