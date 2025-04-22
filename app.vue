<template>
  <div class="app-container">
    <header class="header">
      <h1>Bluelist</h1>
      <div v-if="state.isLoggedIn" class="user-status">
        <span class="status-dot online" />
        {{ state.formInfo.substring(0, state.formInfo.indexOf('with')) }}
      </div>
    </header>

    <div class="main-content">
      <Dashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
import { checkLoginSession } from '~/src/lib/bsky';
import Dashboard from '~/src/components/Dashboard.vue';
import '~/src/assets/styles/app.css';

defineOptions({
  name: 'BlueList',
});

onMounted(() => {
  checkLoginSession();
});
</script>
