<template>
  <button
    class="action-button"
    :class="
      suggestionStore.isProcessingSuggestions ? 'action-button--processing' : ''
    "
    :disabled="suggestionStore.isProcessingSuggestions"
    @click="onClick"
  >
    <span class="action-button__icon">{{ icon }}</span>
    <span class="action-button__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { useSuggestionsStore } from '~/src/stores/suggestions';

defineOptions({
  name: 'ActionButton',
});

const suggestionStore = useSuggestionsStore();

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
