<template>
  <button
    class="action-button"
    :class="state.isProcessingSuggestions ? 'action-button--processing' : ''"
    :disabled="state.isProcessingSuggestions"
    @click="onClick"
  >
    <span class="action-button__icon">{{ icon }}</span>
    <span class="action-button__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { state } from '~/src/store';
defineOptions({
  name: 'ActionButton',
});

defineProps<{
  icon: string;
  label: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const onClick = () => {
  emit('click');
};
</script>
