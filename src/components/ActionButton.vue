<template>
  <button class="btn btn-action" @click="onClick">
    <span class="btn-icon">{{ icon }}</span>
    <span>{{ label }}</span>
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
