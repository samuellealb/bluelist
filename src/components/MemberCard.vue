<template>
  <div class="data-card data-card--follow">
    <div class="data-card__info">
      <h3 class="data-card__title">
        {{ memberItem.name || memberItem.handle }}
      </h3>
      <p class="data-card__subtitle">@{{ memberItem.handle }}</p>
      <p v-if="memberItem.description">{{ memberItem.description }}</p>
    </div>

    <div class="data-card__footer">
      <div class="list-chips__buttons">
        <button
          class="list-chips__button"
          :class="{ 'list-chips__button--disabled': !isSelected }"
          :disabled="isRemoving"
          @click="handleToggleRemove"
        >
          <span class="list-chips__checkbox" @click.stop="toggleSelected" />
          <span class="list-chips__name">
            {{ isRemoving ? 'Removing...' : 'Remove from list' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { removeUserFromList } from '~/src/lib/bskyService';
import '~/src/assets/styles/data-card.css';
import '~/src/assets/styles/list-chips.css';

defineOptions({
  name: 'MemberCard',
});

const props = defineProps<{
  item: {
    did: string;
    handle: string;
    name?: string;
    description?: string;
    uri: string;
  };
}>();

const emit = defineEmits<{
  (e: 'remove-success'): void;
  (e: 'remove-error', error: string): void;
  (e: 'toggle-selected', selected: boolean, itemUri: string): void;
}>();

const isRemoving = ref(false);
const isSelected = ref(false);

const memberItem = computed(() => {
  return props.item;
});

/**
 * Handle direct removal from list
 */
const handleRemoveFromList = async () => {
  if (isRemoving.value) return;

  isRemoving.value = true;
  try {
    const result = await removeUserFromList(props.item.uri);
    if (result.success) {
      emit('remove-success');
    } else {
      emit('remove-error', result.message);
    }
  } catch (error) {
    emit('remove-error', (error as Error).message);
    console.error('Error removing member from list:', error);
  } finally {
    isRemoving.value = false;
  }
};

/**
 * Toggle selected state for batch removal
 */
const toggleSelected = () => {
  isSelected.value = !isSelected.value;
  emit('toggle-selected', isSelected.value, props.item.uri);
};

/**
 * Handle click on the remove tag - either toggle selection or remove directly
 */
const handleToggleRemove = (event: MouseEvent) => {
  // If clicked on the checkbox part, toggleSelected is already called via the @click.stop
  if (!(event.target as HTMLElement).closest('.list-chips__checkbox')) {
    handleRemoveFromList();
  }
};

defineExpose({
  isSelected,
});
</script>

<style>
/* We're removing all custom styles here since we want to use the default list-chips__button styling */
</style>
