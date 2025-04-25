<template>
  <div class="auth-protected">
    <client-only>
      <Dashboard ref="dashboardRef" default-view="lists" />
    </client-only>
  </div>
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

<style scoped>
.auth-protected {
  width: 100%;
}
</style>
