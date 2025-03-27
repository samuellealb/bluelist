<template>
  <div class="action-buttons">
    <button class="btn btn-action" @click="$emit('display-feed')">
      <span class="btn-icon">📋</span>
      <span>Display Feed</span>
    </button>
    <button class="btn btn-action" @click="$emit('fetch-lists', true)">
      <span class="btn-icon">📑</span>
      <span>Get Lists</span>
    </button>
    <button class="btn btn-action" @click="$emit('fetch-follows', true)">
      <span class="btn-icon">👥</span>
      <span>Get Follows</span>
    </button>
    <button class="btn btn-action" @click="$emit('curate-lists')">
      <span class="btn-icon">✨</span>
      <span>Curate Lists</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import '~/src/assets/styles/action-buttons.css';

export default defineComponent({
  emits: ['display-feed', 'fetch-lists', 'fetch-follows', 'curate-lists'],
});
</script>
