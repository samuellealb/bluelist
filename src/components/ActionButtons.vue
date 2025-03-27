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

export default defineComponent({
  emits: ['display-feed', 'fetch-lists', 'fetch-follows', 'curate-lists'],
});
</script>

<style scoped>
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.95rem;
  text-align: left;
}

.btn-action {
  background-color: #f8f9fa;
  color: var(--text-color);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  border-left: 3px solid transparent;
}

.btn-action:hover {
  background-color: #f1f3f5;
  border-left-color: var(--primary-color);
}

.btn-action:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
