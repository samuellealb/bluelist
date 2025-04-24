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
        <div class="data-display__header-buttons">
          <button
            class="data-display__refresh-button"
            title="Refresh data from API"
            :disabled="
              isLoading || isAcceptingAll || state.isProcessingSuggestions
            "
            @click="handleRefresh"
          >
            <span class="data-display__refresh-icon">[R]</span>
            <span class="data-display__refresh-text">Refresh</span>
          </button>
        </div>
      </div>

      <Pagination
        v-if="hasData"
        :current-page="
          dataObject.type === 'follows'
            ? state.follows.currentPage
            : state.lists.currentPage
        "
        :total-pages="
          dataObject.type === 'follows'
            ? state.follows.prefetchedPages
            : state.lists.prefetchedPages
        "
        :data-type="dataObject.type"
        :is-loading="isLoading"
        :has-more-pages="!!dataObject.pagination?.hasMorePages"
        :total-items="dataObject.pagination?.totalPrefetched"
        :is-top="true"
        @page-change="handlePageChange"
      />

      <div
        v-if="dataObject.type === 'follows'"
        class="data-display__action-buttons"
      >
        <button
          class="data-display__suggestions-button"
          title="Get suggestions for your follows"
          :class="{
            'data-display__suggestions-button--processing':
              state.isProcessingSuggestions,
          }"
          :disabled="
            isLoading || isAcceptingAll || state.isProcessingSuggestions
          "
          @click="handleSuggestions"
        >
          <span class="data-display__suggestions-icon">[*]</span>
          <span class="data-display__suggestions-text">{{
            state.isProcessingSuggestions ? 'Processing' : 'Suggest Lists'
          }}</span>
        </button>
        <button
          class="data-display__toggle-all-button"
          title="Toggle all list options between enabled and disabled states"
          :disabled="
            isLoading || isAcceptingAll || state.isProcessingSuggestions
          "
          @click="handleToggleFollowsLists"
        >
          <span class="data-display__toggle-all-icon">[↕]</span>
          <span class="data-display__toggle-all-text"> Toggle All </span>
        </button>
        <button
          class="data-display__accept-all-button"
          title="Add all follows to their enabled lists"
          :disabled="
            isLoading || isAcceptingAll || state.isProcessingSuggestions
          "
          @click="handleAcceptFollowsLists"
        >
          <span class="data-display__accept-all-icon">[+]</span>
          <span class="data-display__accept-all-text">
            {{ isAcceptingAll ? 'Processing...' : 'Apply All' }}
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

        <Pagination
          v-if="hasData"
          :current-page="
            dataObject.type === 'follows'
              ? state.follows.currentPage
              : state.lists.currentPage
          "
          :total-pages="
            dataObject.type === 'follows'
              ? state.follows.prefetchedPages
              : state.lists.prefetchedPages
          "
          :data-type="dataObject.type"
          :is-loading="isLoading"
          :has-more-pages="!!dataObject.pagination?.hasMorePages"
          :total-items="dataObject.pagination?.totalPrefetched"
          @page-change="handlePageChange"
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
import { ref, computed, watch } from 'vue';
import { state } from '~/src/store';
import '~/src/assets/styles/data-display.css';
import DataCard from '~/src/components/DataCard.vue';
import Pagination from '~/src/components/Pagination.vue';
import type {
  DataObject,
  ListItem,
  FollowItem,
  SuggestionItem,
} from '~/src/types/index';
import { addUserToList } from '~/src/lib/bsky';
import { curateUserLists } from '~/src/lib/openai';
import type { ComponentPublicInstance } from 'vue';

defineOptions({
  name: 'DataDisplay',
});

const props = defineProps<{
  data: DataObject | null;
}>();

const emit = defineEmits<{
  refresh: [type: string, page?: number];
}>();

const dataObject = computed<DataObject | null>(() => {
  if (props.data && !isLoading.value && !isError.value) {
    return props.data;
  }
  return null;
});

const hasData = computed(() => {
  return (
    dataObject.value &&
    (dataObject.value.type === 'follows' ||
      dataObject.value.type === 'lists') &&
    dataObject.value.data &&
    dataObject.value.data.length > 0
  );
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

/**
 * Toggle all list options across all follow profile cards
 */
const handleToggleFollowsLists = () => {
  if (!dataObject.value || !dataCardRefs.value.length) return;

  // Call toggleFollowAllLists for each card
  for (const cardRef of dataCardRefs.value) {
    if (!cardRef) continue;
    cardRef.toggleFollowAllLists(undefined, true);
  }
};

/**
 * Accept all enabled list assignments for follows
 */
const handleAcceptFollowsLists = async () => {
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

    const followItem = dataObject.value.data[
      cardRef.$props.index
    ] as FollowItem;
    if (!followItem) continue;

    const profilePrefix = `${followItem.did}-`;

    // Process all enabled lists for this follow
    for (const key in cardRef.followEnabledLists) {
      if (key.startsWith(profilePrefix) && cardRef.followEnabledLists[key]) {
        const listUri = key.substring(profilePrefix.length);

        try {
          const listName = findListNameByUri(listUri);

          const result = await addUserToList(followItem.did, listUri);
          const isDuplicate = result.includes('already in this list');

          if (isDuplicate) {
            duplicateCount++;
          } else {
            successCount++;
          }

          detailedResults.value.push({
            profileName: followItem.name || followItem.handle,
            profileDid: followItem.did,
            listName: listName,
            listUri: listUri,
            success: true,
            message: result,
            isDuplicate: isDuplicate,
          });
        } catch (error) {
          errorCount++;
          detailedResults.value.push({
            profileName: followItem.name || followItem.handle,
            profileDid: followItem.did,
            listName: 'Unknown List',
            listUri: listUri,
            success: false,
            message: (error as Error).message,
            isDuplicate: false,
          });
          console.error('Error adding follow to list:', error);
        }
      }
    }
  }

  // Generate result message
  if ((successCount > 0 || duplicateCount > 0) && errorCount === 0) {
    acceptAllResult.value = `Successfully processed ${
      successCount + duplicateCount
    } list assignments (${successCount} added, ${duplicateCount} already in lists)`;
    acceptAllError.value = false;
  } else if ((successCount > 0 || duplicateCount > 0) && errorCount > 0) {
    acceptAllResult.value = `Processed ${
      successCount + duplicateCount
    } list assignments with ${errorCount} errors (${successCount} added, ${duplicateCount} already in lists)`;
    acceptAllError.value = true;
  } else if (successCount === 0 && duplicateCount === 0 && errorCount > 0) {
    acceptAllResult.value = `Failed to add any profiles to lists. ${errorCount} errors occurred.`;
    acceptAllError.value = true;
  } else if (successCount === 0 && duplicateCount > 0 && errorCount === 0) {
    acceptAllResult.value = `All ${duplicateCount} selected profiles are already in their selected lists.`;
    acceptAllError.value = false;
  } else {
    acceptAllResult.value = 'No list assignments were processed';
    acceptAllError.value = false;
  }

  isAcceptingAll.value = false;
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
      return 'Your Follows';
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

const handlePageChange = (newPage: number) => {
  if (
    dataObject.value?.type === 'follows' ||
    dataObject.value?.type === 'lists'
  ) {
    emit('refresh', dataObject.value.type, newPage);
  }
};

watch(
  () => props.data?.type,
  (newType, oldType) => {
    if (newType !== oldType && newType !== 'loading') {
      dismissAllMessages();
    }
  }
);

const handleSuggestions = async () => {
  if (!dataObject.value || dataObject.value.type !== 'follows') return;

  // Show loading state
  state.isProcessingSuggestions = true;

  try {
    // First, get suggestions from the API for the current follows
    const { suggestionsJSON } = await curateUserLists();

    if (!suggestionsJSON) {
      throw new Error('Failed to get suggestions');
    }

    // Parse suggestions
    const suggestionsData = JSON.parse(suggestionsJSON);

    // Apply suggestions to the current follows view
    applySuggestionsToFollows(suggestionsData);

    // Show success message
    acceptAllResult.value =
      'Successfully applied list suggestions to current follows';
    acceptAllError.value = false;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    acceptAllResult.value = `Error getting suggestions: ${
      (error as Error).message
    }`;
    acceptAllError.value = true;
  } finally {
    // Restore button text
    state.isProcessingSuggestions = false;
  }
};

/**
 * Apply suggestions to the follows view by toggling the relevant list chips
 * @param suggestionsData The suggestions data containing recommended lists for profiles
 */
const applySuggestionsToFollows = (suggestionsData: {
  data: SuggestionItem[];
}) => {
  if (!dataCardRefs.value.length || !dataObject.value) return;

  // Process each follow card
  for (const cardRef of dataCardRefs.value) {
    if (!cardRef) continue;

    const followItem = dataObject.value.data[
      cardRef.$props.index
    ] as FollowItem;
    if (!followItem) continue;

    // Find matching suggestion for this follow
    const matchingSuggestion = suggestionsData.data.find(
      (item: SuggestionItem) => item.did === followItem.did
    );

    if (
      matchingSuggestion &&
      matchingSuggestion.suggestedLists &&
      matchingSuggestion.suggestedLists.length > 0
    ) {
      // We have suggestions for this follow, toggle the corresponding list chips
      for (const list of matchingSuggestion.suggestedLists) {
        const key = `${followItem.did}-${list.uri}`;

        // If the follow has this list enabled option, set it to enabled
        if (typeof cardRef.followEnabledLists[key] !== 'undefined') {
          // Set this chip to enabled
          cardRef.followEnabledLists[key] = true;
        }
      }
    }
  }
};

/**
 * Helper function to find a list name based on URI
 * Uses multiple sources to ensure we find the correct name
 */
const findListNameByUri = (listUri: string): string => {
  // First try to find the list in state.lists.allLists
  if (state.lists.allLists && state.lists.allLists.length > 0) {
    const foundList = state.lists.allLists.find(
      (list: ListItem) => list.uri === listUri
    );
    if (foundList) {
      return foundList.name;
    }
  }

  // Next try to parse from state.listsJSON
  if (state.listsJSON) {
    try {
      const listsData = JSON.parse(state.listsJSON);
      if (listsData.data && Array.isArray(listsData.data)) {
        const foundList = listsData.data.find(
          (list: ListItem) => list.uri === listUri
        );
        if (foundList) {
          return foundList.name;
        }
      }
    } catch (error) {
      console.error('Error parsing lists JSON:', error);
    }
  }

  // Extract list name from URI as a last resort
  // URIs typically end with something like "app.bsky.graph.list/3jui4lcvpba2z"
  try {
    const uriParts = listUri.split('/');
    if (uriParts.length > 0) {
      // Try to get the list ID at the end of the URI
      return `List ${uriParts[uriParts.length - 1]}`;
    }
  } catch (error) {
    console.error('Error extracting list name from URI:', error);
  }

  return 'Unknown List';
};
</script>
