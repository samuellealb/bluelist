<!-- A toggle switch for dark/light mode -->
<template>
  <button
    class="theme-toggle"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <span class="theme-toggle-icon">{{ isDark ? 'light' : 'dark' }}</span>
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
