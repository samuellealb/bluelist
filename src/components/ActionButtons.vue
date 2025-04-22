<template>
  <div class="action-buttons">
    <button class="btn btn-action" @click="$emit('display-feed')">
      <span class="btn-icon">📋</span>
      <span>Display Feed</span>
    </button>
    <button class="btn btn-action" @click="$emit('display-lists')">
      <span class="btn-icon">📑</span>
      <span>Display Lists</span>
    </button>
    <button class="btn btn-action" @click="$emit('display-follows')">
      <span class="btn-icon">👥</span>
      <span>Display Follows</span>
    </button>
    <button class="btn btn-action" @click="$emit('display-suggestions')">
      <span class="btn-icon">✨</span>
      <span>Display Suggestions</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/action-buttons.css';

defineOptions({
  name: 'ActionButtons',
});

defineEmits<{
  (
    e:
      | 'display-lists'
      | 'display-follows'
      | 'display-feed'
      | 'display-suggestions'
  ): void;
}>();
</script>
