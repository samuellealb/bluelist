<template>
  <div class="action-buttons">
    <button class="btn btn-action" @click="$emit('display-feed')">
      <span class="btn-icon">📋</span>
      <span>Display Feed</span>
    </button>
    <button class="btn btn-action" @click="$emit('fetch-lists')">
      <span class="btn-icon">📑</span>
      <span>Get Lists</span>
    </button>
    <button class="btn btn-action" @click="$emit('fetch-follows')">
      <span class="btn-icon">👥</span>
      <span>Get Follows</span>
    </button>
    <button class="btn btn-action" @click="$emit('curate-lists')">
      <span class="btn-icon">✨</span>
      <span>Curate Lists</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/action-buttons.css';

defineOptions({
  name: 'ActionButtons',
});

defineEmits<{
  (e: 'fetch-lists' | 'fetch-follows' | 'display-feed' | 'curate-lists'): void;
}>();
</script>
