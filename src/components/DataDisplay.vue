<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="data-display">
    <div v-if="data === 'loading'" class="loading-indicator">
      <div class="spinner" />
      <span>Processing data...</span>
    </div>
    <div
      v-else-if="data && data.trim().length > 0"
      class="data-content"
      v-html="sanitizedData"
    />
    <div v-else class="no-data">
      <div class="no-data-icon">📊</div>
      <p>No data to display yet</p>
      <p class="hint">Use the action buttons to load content</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/data-display.css';
import DOMPurify from 'dompurify';

const props = defineProps<{
  data: string;
}>();

const sanitizedData = computed(() => {
  return DOMPurify.sanitize(props.data);
});
</script>
