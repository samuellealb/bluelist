<template>
  <client-only>
    <Dashboard ref="dashboardRef" default-view="feed" />
  </client-only>
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
