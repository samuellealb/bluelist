<template>
  <client-only>
    <Dashboard ref="dashboardRef" default-view="lists" />
  </client-only>
</template>

<script setup lang="ts">
import Dashboard from '~/src/components/Dashboard.vue';

defineOptions({
  name: 'ListPage',
});

definePageMeta({
  middleware: ['router'],
});
</script>
