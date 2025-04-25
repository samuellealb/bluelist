<template>
  <client-only>
    <Dashboard ref="dashboardRef" default-view="follows" />
  </client-only>
</template>

<script setup lang="ts">
import Dashboard from '~/src/components/Dashboard.vue';

defineOptions({
  name: 'FollowsPage',
});

definePageMeta({
  middleware: ['router'],
});
</script>
