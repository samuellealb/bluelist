<template>
  <div>
    <LoginForm v-if="!state.isLoggedIn" />
    <div v-else>
      <ClientOnly>
        <NuxtLink to="/list" class="visually-hidden">Go to Lists</NuxtLink>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
import LoginForm from '~/src/components/LoginForm.vue';

defineOptions({
  name: 'LoginPage',
});

definePageMeta({
  middleware: ['router'],
  title: 'Bluelist - Login',
});

watch(
  () => state.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      sessionStorage.setItem('bluelist_just_logged_in', 'true');
      navigateTo('/list');
    }
  }
);
</script>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
