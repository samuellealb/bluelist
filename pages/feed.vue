<template>
  <div class="auth-protected">
    <client-only>
      <Dashboard ref="dashboardRef" default-view="feed" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import Dashboard from '~/src/components/Dashboard.vue';

defineOptions({
  name: 'FeedPage',
});

definePageMeta({
  middleware: ['router'],
});
</script>

<style scoped>
.auth-protected {
  width: 100%;
}
</style>
