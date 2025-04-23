<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="data-display">
    <div v-if="isLoading" class="data-display__loading">
      <div class="data-display__spinner" />
      <span class="data-display__cursor">Processing data</span>
    </div>
    <div v-else-if="isError" class="data-display__error">
      <div class="data-display__ascii-art">
        <pre>
+---------+
|  ERROR  |
|  x   x  |
|    !    |
| \____/  |
+---------+
        </pre>
      </div>
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else-if="dataObject" class="data-display__container">
      <div class="data-display__header">
        <h2>{{ getDataTitle(dataObject.type) }}</h2>
        <button
          class="data-display__refresh-button"
          title="Refresh data from API"
          :disabled="isLoading || isAcceptingAll"
          @click="handleRefresh"
        >
          <span class="data-display__refresh-icon">[R]</span>
          <span class="data-display__refresh-text">Refresh</span>
        </button>
      </div>
      <div
        v-if="dataObject.type === 'suggestions'"
        class="data-display__action-buttons"
      >
        <button
          class="data-display__toggle-all-button"
          title="Toggle all suggestions between enabled and disabled states"
          :disabled="isLoading || isAcceptingAll"
          @click="handleToggleAll"
        >
          <span class="data-display__toggle-all-icon">[↕]</span>
          <span class="data-display__toggle-all-text"> Toggle All </span>
        </button>
        <button
          class="data-display__accept-all-button"
          title="Accept all enabled suggestions"
          :disabled="isLoading || isAcceptingAll"
          @click="handleAcceptAll"
        >
          <span class="data-display__accept-all-icon">[+]</span>
          <span class="data-display__accept-all-text">
            {{ isAcceptingAll ? 'Processing...' : 'Accept All' }}
          </span>
        </button>
      </div>
      <div
        v-if="acceptAllResult || detailedResults.length > 0"
        class="data-display__feedback-container"
      >
        <button
          class="data-display__dismiss-all-button"
          title="Dismiss all messages"
          @click="dismissAllMessages"
        >
          [X]
        </button>

        <div
          v-if="acceptAllResult"
          class="data-display__accept-all-result"
          :class="{ 'data-display__accept-all-result--error': acceptAllError }"
        >
          {{ acceptAllResult }}
        </div>

        <div
          v-if="detailedResults.length > 0"
          class="data-display__detailed-results"
        >
          <div
            v-for="(result, index) in detailedResults"
            :key="index"
            class="data-display__detailed-result"
            :class="{
              'data-display__detailed-result--duplicate': result.isDuplicate,
            }"
          >
            <span class="data-display__detailed-result-profile">{{
              result.profileName
            }}</span>
            <span class="data-display__detailed-result-arrow">→</span>
            <span class="data-display__detailed-result-list">{{
              result.listName
            }}</span>
            <span class="data-display__detailed-result-status">{{
              result.message
            }}</span>
          </div>
        </div>
      </div>
      <template v-if="dataObject.data && dataObject.data.length > 0">
        <DataCard
          v-for="(_, index) in dataObject.data"
          ref="dataCardRefs"
          :key="index"
          :item="dataObject"
          :index="index"
        />
      </template>
      <div v-else class="data-display__empty">
        <pre>
+----------+
|  EMPTY   |
|          |
| No items |
+----------+
        </pre>
      </div>
    </div>
    <div v-else class="data-display__no-data">
      <div class="data-display__ascii-empty">
        <pre>
+-----------+
|   DATA    |
|  PENDING  |
+-----------+
        </pre>
      </div>
      <p>No data to display yet</p>
      <p class="data-display__hint">Use the action buttons to load content</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/data-display.css';
import DataCard from '~/src/components/DataCard.vue';
import type { DataObject, SuggestionItem } from '~/src/types';
import { addUserToList } from '~/src/lib/bsky';
import type { ComponentPublicInstance } from 'vue';

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

interface DetailedResult {
  profileName: string;
  profileDid: string;
  listName: string;
  listUri: string;
  success: boolean;
  message: string;
  isDuplicate: boolean;
}
const dataCardRefs = ref<
  ComponentPublicInstance<InstanceType<typeof DataCard>>[]
>([]);
const isAcceptingAll = ref(false);
const acceptAllResult = ref('');
const acceptAllError = ref(false);
const detailedResults = ref<DetailedResult[]>([]);

const handleAcceptAll = async () => {
  if (!dataObject.value || !dataCardRefs.value.length || isAcceptingAll.value)
    return;

  isAcceptingAll.value = true;
  acceptAllResult.value = '';
  acceptAllError.value = false;
  detailedResults.value = [];

  let successCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  for (const cardRef of dataCardRefs.value) {
    if (!cardRef) continue;

    const suggestionItem = dataObject.value.data[
      cardRef.$props.index
    ] as SuggestionItem;
    if (!suggestionItem || !suggestionItem.suggestedLists) continue;

    for (const list of suggestionItem.suggestedLists) {
      const key = `${suggestionItem.did}-${list.uri}`;

      if (cardRef.enabledLists[key]) {
        try {
          const result = await addUserToList(suggestionItem.did, list.uri);
          const isDuplicate = result.includes('already in this list');

          if (isDuplicate) {
            duplicateCount++;
          } else {
            successCount++;
          }

          detailedResults.value.push({
            profileName: suggestionItem.name,
            profileDid: suggestionItem.did,
            listName: list.name,
            listUri: list.uri,
            success: true,
            message: result,
            isDuplicate: isDuplicate,
          });
        } catch (error) {
          errorCount++;
          detailedResults.value.push({
            profileName: suggestionItem.name,
            profileDid: suggestionItem.did,
            listName: list.name,
            listUri: list.uri,
            success: false,
            message: (error as Error).message,
            isDuplicate: false,
          });
          console.error('Error adding to list during Accept All:', error);
        }
      }
    }
  }

  if ((successCount > 0 || duplicateCount > 0) && errorCount === 0) {
    acceptAllResult.value = `Successfully processed ${
      successCount + duplicateCount
    } suggestions (${successCount} added, ${duplicateCount} already in lists)`;
    acceptAllError.value = false;
  } else if ((successCount > 0 || duplicateCount > 0) && errorCount > 0) {
    acceptAllResult.value = `Processed ${
      successCount + duplicateCount
    } suggestions with ${errorCount} errors (${successCount} added, ${duplicateCount} already in lists)`;
    acceptAllError.value = true;
  } else if (successCount === 0 && duplicateCount === 0 && errorCount > 0) {
    acceptAllResult.value = `Failed to add any suggestions. ${errorCount} errors occurred.`;
    acceptAllError.value = true;
  } else if (successCount === 0 && duplicateCount > 0 && errorCount === 0) {
    acceptAllResult.value = `All ${duplicateCount} selected profiles are already in their suggested lists.`;
    acceptAllError.value = false;
  } else {
    acceptAllResult.value = 'No suggestions were processed';
    acceptAllError.value = false;
  }

  isAcceptingAll.value = false;
};

/**
 * Toggle all suggestions across all profile cards
 */
const handleToggleAll = () => {
  if (!dataObject.value || !dataCardRefs.value.length) return;

  // Call toggleAllLists with invertEach=true for each card to toggle individual suggestions
  for (const cardRef of dataCardRefs.value) {
    if (!cardRef) continue;
    cardRef.toggleAllLists(undefined, true);
  }
};

const handleRefresh = () => {
  if (dataObject.value) {
    emit('refresh', dataObject.value.type);
  }
  detailedResults.value = [];
  acceptAllResult.value = '';
};

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

const dismissFeedbackMessage = () => {
  acceptAllResult.value = '';
  acceptAllError.value = false;
};

const dismissDetailedResults = () => {
  detailedResults.value = [];
};

const dismissAllMessages = () => {
  dismissFeedbackMessage();
  dismissDetailedResults();
};

watch(
  () => props.data?.type,
  (newType, oldType) => {
    if (newType !== oldType && newType !== 'loading') {
      dismissAllMessages();
    }
  }
);
</script>
