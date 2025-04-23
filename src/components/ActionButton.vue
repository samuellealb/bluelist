<template>
  <button class="action-button" @click="onClick">
    <span class="action-button__icon">{{ icon }}</span>
    <span class="action-button__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
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
