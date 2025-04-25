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
import { checkLoginSession } from '~/src/lib/bsky';
import AppHeader from '~/src/components/AppHeader.vue';
import '~/src/assets/styles/app.css';

defineOptions({
  name: 'BlueList',
});

onMounted(() => {
  checkLoginSession();
});
</script>
