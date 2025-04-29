<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="list-form">
    <h3 class="list-form__title">
      {{ isEditMode ? '' : 'Create a New List' }}
    </h3>
    <div class="list-form__form">
      <div class="list-form__form-group">
        <label for="list-name" class="list-form__label">List Name*</label>
        <input
          id="list-name"
          v-model="listName"
          type="text"
          class="list-form__input"
          placeholder="Enter list name"
          :class="{ 'list-form__input--error': errors.name }"
        />
        <span v-if="errors.name" class="list-form__error">{{
          errors.name
        }}</span>
      </div>

      <div class="list-form__form-group">
        <label for="list-description" class="list-form__label"
          >Description*</label
        >
        <textarea
          id="list-description"
          v-model="listDescription"
          class="list-form__textarea"
          placeholder="Enter list description"
          :class="{ 'list-form__textarea--error': errors.description }"
        ></textarea>
        <span v-if="errors.description" class="list-form__error">
          {{ errors.description }}
        </span>
      </div>

      <div class="list-form__actions">
        <button
          v-if="isEditMode"
          class="list-form__button list-form__button--delete"
          :disabled="isProcessing"
          @click="handleDeleteList"
        >
          <span class="list-form__button-icon">[-]</span>
          <span class="list-form__button-text">
            {{ isDeleting ? 'Deleting...' : 'Delete List' }}
          </span>
        </button>

        <div class="list-form__actions-right">
          <button
            v-if="isEditMode || (!isEditMode && showCancelInCreateMode)"
            class="list-form__button list-form__button--cancel"
            :disabled="isProcessing"
            @click="handleCancelEdit"
          >
            <span class="list-form__button-icon">[X]</span>
            <span class="list-form__button-text">Cancel</span>
          </button>

          <button
            class="list-form__button"
            :disabled="isProcessing"
            @click="handleSubmit"
          >
            <span class="list-form__button-icon">{{
              isEditMode ? '[✓]' : '[+]'
            }}</span>
            <span class="list-form__button-text">
              {{ getActionButtonText() }}
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="feedbackMessage"
        class="list-form__feedback"
        :class="{ 'list-form__feedback--error': feedbackError }"
      >
        {{ feedbackMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createList, updateList } from '~/src/lib/bskyService';
import '~/src/assets/styles/list-form.css';

defineOptions({
  name: 'ListForm',
});

interface ListFormProps {
  isEditMode?: boolean;
  showCancelInCreateMode?: boolean;
  listData?: {
    uri: string;
    name: string;
    description: string;
  };
}

const props = withDefaults(defineProps<ListFormProps>(), {
  isEditMode: false,
  showCancelInCreateMode: false,
  listData: undefined,
});

const emit = defineEmits<{
  'list-created': [success: boolean];
  'list-updated': [success: boolean];
  'list-deleted': [success: boolean];
  'delete-requested': [];
  'cancel-edit': [];
}>();

const listName = ref('');
const listDescription = ref('');
const listUri = ref('');
const isCreating = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);
const feedbackMessage = ref('');
const feedbackError = ref(false);
const errors = ref({
  name: '',
  description: '',
});

const isProcessing = computed(
  () => isCreating.value || isUpdating.value || isDeleting.value
);

onMounted(() => {
  if (props.isEditMode && props.listData) {
    listName.value = props.listData.name;
    listDescription.value = props.listData.description;
    listUri.value = props.listData.uri;
  }
});

const getActionButtonText = () => {
  if (isCreating.value) return 'Creating...';
  if (isUpdating.value) return 'Updating...';
  return props.isEditMode ? 'Update List' : 'Create List';
};

const validateForm = (): boolean => {
  errors.value = {
    name: '',
    description: '',
  };

  let isValid = true;

  if (!listName.value.trim()) {
    errors.value.name = 'List name is required';
    isValid = false;
  } else if (listName.value.length > 64) {
    errors.value.name = 'List name must be less than 64 characters';
    isValid = false;
  }

  if (!listDescription.value.trim()) {
    errors.value.description = 'Description is required';
    isValid = false;
  } else if (listDescription.value.length > 300) {
    errors.value.description = 'Description must be less than 300 characters';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  if (props.isEditMode) {
    await handleUpdateList();
  } else {
    await handleCreateList();
  }
};

const handleCreateList = async () => {
  try {
    isCreating.value = true;
    feedbackMessage.value = '';
    feedbackError.value = false;

    const result = await createList(
      listName.value.trim(),
      listDescription.value.trim()
    );

    if (result.success) {
      feedbackMessage.value = 'List created successfully!';
      feedbackError.value = false;
      listName.value = '';
      listDescription.value = '';
      emit('list-created', true);
    } else {
      feedbackMessage.value = result.message || 'Failed to create list';
      feedbackError.value = true;
    }
  } catch (error) {
    feedbackError.value = true;
    feedbackMessage.value = `Error: ${(error as Error).message}`;
    console.error('Error creating list:', error);
  } finally {
    isCreating.value = false;
  }
};

const handleUpdateList = async () => {
  if (!listUri.value) {
    feedbackError.value = true;
    feedbackMessage.value = 'Error: List URI is missing';
    return;
  }

  try {
    isUpdating.value = true;
    feedbackMessage.value = '';
    feedbackError.value = false;

    const result = await updateList(
      listUri.value,
      listName.value.trim(),
      listDescription.value.trim()
    );

    if (result.success) {
      feedbackMessage.value = 'List updated successfully!';
      feedbackError.value = false;
      emit('list-updated', true);
    } else {
      feedbackMessage.value = result.message || 'Failed to update list';
      feedbackError.value = true;
    }
  } catch (error) {
    feedbackError.value = true;
    feedbackMessage.value = `Error: ${(error as Error).message}`;
    console.error('Error updating list:', error);
  } finally {
    isUpdating.value = false;
  }
};

const handleDeleteList = () => {
  if (!listUri.value) {
    feedbackError.value = true;
    feedbackMessage.value = 'Error: List URI is missing';
    return;
  }

  // Instead of deleting directly, emit an event to request confirmation
  emit('delete-requested');
};

const handleCancelEdit = () => {
  emit('cancel-edit');
};
</script>
