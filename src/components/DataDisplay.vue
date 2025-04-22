<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="data-display">
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner" />
      <span class="vintage-cursor">Processing data</span>
    </div>
    <div v-else-if="isError" class="error-message">
      <div class="ascii-art">
        <pre>
+----------+
|  ERROR   |
|  x   x   |
|    !     |
| \____/   |
+----------+
        </pre>
      </div>
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else-if="dataObject" class="data-cards-container">
      <div class="data-header">
        <h2>{{ getDataTitle(dataObject.type) }}</h2>
        <button
          class="refresh-button"
          title="Refresh data from API"
          :disabled="isLoading"
          @click="handleRefresh"
        >
          <span class="refresh-icon">[R]</span>
          <span class="refresh-text">Refresh</span>
        </button>
      </div>
      <template v-if="dataObject.data && dataObject.data.length > 0">
        <DataCard
          v-for="(_, index) in dataObject.data"
          :key="index"
          :item="dataObject"
          :index="index"
        />
      </template>
      <div v-else class="ascii-empty">
        <pre>
+----------+
|  EMPTY   |
|          |
| No items |
+----------+
        </pre>
      </div>
    </div>
    <div v-else class="no-data">
      <div class="ascii-empty">
        <pre>
+----------+
|   DATA   |
|  PENDING |
+----------+
        </pre>
      </div>
      <p>No data to display yet</p>
      <p class="hint">Use the action buttons to load content</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/data-display.css';
import { computed } from 'vue';
import DataCard from '~/src/components/DataCard.vue';
import type { DataObject } from '~/src/types';

defineOptions({
  name: 'DataDisplay',
});

const props = defineProps<{
  data: DataObject | null;
}>();

const emit = defineEmits<{
  refresh: [type: string];
}>();

const dataObject = computed<DataObject | null>(() => {
  if (props.data && !isLoading.value && !isError.value) {
    return props.data;
  }
  return null;
});

const isLoading = computed(() => {
  return props.data?.type === 'loading';
});

const isError = computed(() => {
  return props.data?.type === 'error';
});

const errorMessage = computed(() => {
  if (isError.value && props.data?.data?.[0]) {
    const errorData = props.data.data[0] as { message: string };
    return errorData.message;
  }
  return 'An unknown error occurred';
});

/**
 * Handles refresh button click
 */
const handleRefresh = () => {
  if (dataObject.value) {
    emit('refresh', dataObject.value.type);
  }
};

/**
 * Returns a human-readable title based on data type
 */
const getDataTitle = (type: string): string => {
  switch (type) {
    case 'timeline':
      return 'Your Timeline';
    case 'lists':
      return 'Your Lists';
    case 'follows':
      return `Your Follows (${dataObject.value?.data?.length || 0})`;
    case 'suggestions':
      return 'Your Suggested Lists';
    default:
      return 'Data';
  }
};
</script>
