<template>
  <header class="app-header">
    <h1 class="app-header__title">Bluelist</h1>
    <ThemeToggle />
    <div class="app-header__right">
      <div v-if="state.isLoggedIn" class="app-header__user-status">
        <span class="app-header__status-dot app-header__status-dot--online" />
        {{ state.formInfo.substring(0, state.formInfo.indexOf('with')) }}
      </div>
      <LogoutButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
import ThemeToggle from '~/src/components/ThemeToggle.vue';
import LogoutButton from '~/src/components/LogoutButton.vue';
import '~/src/assets/styles/app-header.css';
</script>
