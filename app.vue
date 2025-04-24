<template>
  <div class="app">
    <header class="app__header">
      <h1 class="app__title">Bluelist</h1>
      <div class="app__header-right">
        <div v-if="state.isLoggedIn" class="app__user-status">
          <span class="app__status-dot app__status-dot--online" />
          {{ state.formInfo.substring(0, state.formInfo.indexOf('with')) }}
        </div>
        <ThemeToggle />
      </div>
    </header>

    <div class="app__content">
      <Dashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
import { checkLoginSession } from '~/src/lib/bsky';
import Dashboard from '~/src/components/Dashboard.vue';
import ThemeToggle from '~/src/components/ThemeToggle.vue';
import '~/src/assets/styles/app.css';

defineOptions({
  name: 'BlueList',
});

onMounted(() => {
  checkLoginSession();
});
</script>
