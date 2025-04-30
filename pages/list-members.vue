<template>
  <client-only>
    <Dashboard ref="dashboardRef" default-view="list-members" />
  </client-only>
</template>

<script setup lang="ts">
import Dashboard from '~/src/components/Dashboard.vue';

defineOptions({
  name: 'ListMembersPage',
});

definePageMeta({
  middleware: ['router'],
});
</script>
