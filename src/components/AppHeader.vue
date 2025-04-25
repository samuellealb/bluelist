<template>
  <header class="app-header">
    <h1 class="app-header__title">Bluelist</h1>
    <ThemeToggle />
    <div class="app-header__right">
      <div v-if="authStore.isLoggedIn" class="app-header__user-status">
        <span class="app-header__status-dot app-header__status-dot--online" />
        {{
          authStore.formInfo.substring(0, authStore.formInfo.indexOf('with'))
        }}
      </div>
      <LogoutButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/src/stores/auth';
import ThemeToggle from '~/src/components/ThemeToggle.vue';
import LogoutButton from '~/src/components/LogoutButton.vue';
import '~/src/assets/styles/app-header.css';

const authStore = useAuthStore();
</script>
