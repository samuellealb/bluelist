<!-- eslint-disable vue/html-self-closing -->
<template>
  <button
    class="theme-toggle"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <span class="theme-toggle__icon">
      <img
        v-if="isDark"
        src="../assets/icons/sun.svg"
        alt="Light mode"
        class="theme-toggle__svg"
      />
      <img
        v-else
        src="../assets/icons/moon.svg"
        alt="Dark mode"
        class="theme-toggle__svg"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import '~/src/assets/styles/theme-toggle.css';

const isDark = ref(true);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  document.documentElement.classList.toggle('light-theme', !isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

onMounted(() => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  isDark.value = savedTheme === 'dark';
  updateTheme();
});
</script>
