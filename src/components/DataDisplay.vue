<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="data-display">
    <div v-if="data === 'loading'" class="loading-indicator">
      <div class="spinner" />
      <span>Processing data...</span>
    </div>
    <div v-else-if="parsedData" class="data-cards-container">
      <h2>{{ getDataTitle(parsedData.type) }}</h2>
      <template v-if="parsedData.data && parsedData.data.length > 0">
        <DataCard
          v-for="(_, index) in parsedData.data"
          :key="index"
          :item="parsedData"
          :index="index"
        />
      </template>
      <p v-else>No items to display</p>
    </div>
    <div
      v-else-if="data && data.trim().length > 0"
      class="data-content"
      v-html="sanitizedData"
    />
    <div v-else class="no-data">
      <div class="no-data-icon">📊</div>
      <p>No data to display yet</p>
      <p class="hint">Use the action buttons to load content</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/data-display.css';
import DOMPurify from 'dompurify';
import { computed } from 'vue';
import { state } from '~/src/store';
import DataCard from '~/src/components/DataCard.vue';
import type { DataObject } from '~/src/types';

defineOptions({
  name: 'DataDisplay',
});

const props = defineProps<{
  data: string;
}>();

const sanitizedData = computed(() => {
  return DOMPurify.sanitize(props.data);
});

const parsedData = computed<DataObject | null>(() => {
  try {
    // Check if we have JSON data in the store based on the current display
    if (state.timelineJSON && props.data.includes('Timeline')) {
      return JSON.parse(state.timelineJSON) as DataObject;
    } else if (
      state.listsJSON &&
      props.data.includes('Lists') &&
      !props.data.includes('Suggested')
    ) {
      return JSON.parse(state.listsJSON) as DataObject;
    } else if (state.usersJSON && props.data.includes('Follows')) {
      return JSON.parse(state.usersJSON) as DataObject;
    } else if (state.suggestionsJSON && props.data.includes('Suggested')) {
      return JSON.parse(state.suggestionsJSON) as DataObject;
    }
    return null;
  } catch (error) {
    console.error('Error parsing JSON data:', error);
    return null;
  }
});

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
      return `Your Follows (${parsedData.value?.data?.length || 0})`;
    case 'suggestions':
      return 'Your Suggested Lists';
    default:
      return 'Data';
  }
};
</script>
