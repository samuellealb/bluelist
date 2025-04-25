<template>
  <button
    class="action-button"
    :class="uiStore.isProcessingSuggestions ? 'action-button--processing' : ''"
    :disabled="uiStore.isProcessingSuggestions"
    @click="onClick"
  >
    <span class="action-button__icon">{{ icon }}</span>
    <span class="action-button__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { useUiStore } from '~/src/stores/ui';

defineOptions({
  name: 'ActionButton',
});

const uiStore = useUiStore();

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
