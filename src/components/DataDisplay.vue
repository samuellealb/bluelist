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
        <div class="data-display__title-wrapper">
          <button
            v-if="showBackButton"
            class="data-display__back-button"
            title="Back to Lists"
            @click="navigateBackToLists"
          >
            ← Back to Lists
          </button>
          <h2>{{ getDataTitle(dataObject.type) }}</h2>
        </div>
        <div class="data-display__header-buttons">
          <button
            class="data-display__refresh-button"
            title="Refresh data from API"
            :disabled="
              isLoading ||
              isAcceptingAll ||
              suggestionsStore.isProcessingSuggestions
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
        :current-page="getPaginationCurrentPage(dataObject.type)"
        :total-pages="getPaginationTotalPages(dataObject.type)"
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
          :title="suggestionsButtonTitle"
          :class="{
            'data-display__suggestions-button--processing':
              suggestionsStore.isProcessingSuggestions,
          }"
          :disabled="
            isLoading ||
            isAcceptingAll ||
            suggestionsStore.isProcessingSuggestions ||
            hasReachedSuggestionLimit
          "
          @click="handleSuggestions"
        >
          <span class="data-display__suggestions-icon">[*]</span>
          <span class="data-display__suggestions-text">{{
            suggestionsButtonLabel
          }}</span>
        </button>
        <button
          class="data-display__toggle-all-button"
          title="Toggle all list options between enabled and disabled states"
          :disabled="
            isLoading ||
            isAcceptingAll ||
            suggestionsStore.isProcessingSuggestions
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
            isLoading ||
            isAcceptingAll ||
            suggestionsStore.isProcessingSuggestions
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
        v-if="dataObject.type === 'lists' && dataObject.data.length !== 0"
        class="data-display__action-buttons"
      >
        <button
          class="data-display__create-list-button"
          title="Create a new list"
          :disabled="
            isLoading ||
            suggestionsStore.isProcessingSuggestions ||
            showingComponent !== null
          "
          @click="handleCreateList"
        >
          <span class="data-display__create-list-icon">[+]</span>
          <span class="data-display__create-list-text">Create List</span>
        </button>
      </div>

      <div
        v-if="
          dataObject.type === 'list-members' && dataObject.data.length !== 0
        "
        class="data-display__action-buttons"
      >
        <button
          class="data-display__toggle-all-button"
          title="Toggle all members between enabled and disabled states"
          :disabled="isLoading || isBatchRemoving"
          @click="handleToggleSelectedMembers"
        >
          <span class="data-display__toggle-all-icon">[↕]</span>
          <span class="data-display__toggle-all-text"> Toggle All </span>
        </button>
        <button
          class="data-display__remove-all-button"
          title="Remove all members with enabled checkboxes from this list"
          :disabled="
            isLoading || isBatchRemoving || selectedMemberUris.length < 2
          "
          @click="handleBatchRemoveMembers"
        >
          <span class="data-display__remove-all-icon">[-]</span>
          <span class="data-display__remove-all-text">
            {{ isBatchRemoving ? 'Processing...' : 'Remove All' }}
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
        <template v-if="dataObject.type === 'list-members'">
          <MemberCard
            v-for="(item, index) in typedListMembers"
            ref="memberCardRefs"
            :key="index"
            :item="item"
            @remove-success="handleMemberRemoved"
            @remove-error="handleMemberRemoveError"
            @toggle-selected="handleMemberToggleSelected"
          />
        </template>

        <DataCard
          v-for="(_, index) in dataObject.data"
          v-else
          ref="dataCardRefs"
          :key="index"
          :item="dataObject"
          :index="index"
          @list-updated="handleListUpdated"
          @list-deleted="handleListDeleted"
          @add-to-list="handleAddToList"
        />

        <Pagination
          v-if="hasData"
          :current-page="getPaginationCurrentPage(dataObject.type)"
          :total-pages="getPaginationTotalPages(dataObject.type)"
          :data-type="dataObject.type"
          :is-loading="isLoading"
          :has-more-pages="!!dataObject.pagination?.hasMorePages"
          :total-items="dataObject.pagination?.totalPrefetched"
          @page-change="handlePageChange"
        />
      </template>

      <div v-else class="data-display__empty">
        <template v-if="dataObject.type === 'lists'">
          <!-- Display create, edit, or delete components based on state -->
          <template v-if="showingComponent === 'edit' && currentListData">
            <ListForm
              :is-edit-mode="true"
              :list-data="currentListData"
              @list-updated="handleListUpdated"
              @list-deleted="handleListDeleted"
              @cancel-edit="resetComponentDisplay"
            />
          </template>

          <template
            v-else-if="showingComponent === 'delete' && currentListData"
          >
            <div class="data-display__delete-confirm">
              <div class="data-display__component-header">
                <h3>Delete List</h3>
                <button
                  class="data-display__back-button"
                  title="Back to list creation"
                  @click="resetComponentDisplay"
                >
                  Back
                </button>
              </div>
              <div class="data-display__delete-content">
                <p>
                  Are you sure you want to delete the list "{{
                    currentListData.name
                  }}"?
                </p>
                <p>This action cannot be undone.</p>
                <div class="data-display__delete-actions">
                  <button
                    class="data-display__delete-cancel"
                    @click="resetComponentDisplay"
                  >
                    Cancel
                  </button>
                  <button
                    class="data-display__delete-confirm-button"
                    @click="confirmDeleteList"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <ListForm
              :show-cancel-in-create-mode="
                showingComponent === 'create' && hasExistingLists
              "
              @list-created="handleListCreated"
              @cancel-edit="resetComponentDisplay"
            />
          </template>
        </template>
        <template v-else>
          <pre>
+----------+
|  EMPTY   |
|          |
| No items |
+----------+
          </pre>
        </template>
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
import { useUiStore } from '~/src/stores/ui';
import { useFollowsStore } from '~/src/stores/follows';
import { useListsStore } from '~/src/stores/lists';
import { useSuggestionsStore } from '~/src/stores/suggestions';
import '~/src/assets/styles/data-display.css';
import DataCard from '~/src/components/DataCard.vue';
import MemberCard from '~/src/components/MemberCard.vue';
import Pagination from '~/src/components/Pagination.vue';
import ListForm from '~/src/components/ListForm.vue';
import type {
  DataObject,
  ListItem,
  FollowItem,
  SuggestionItem,
  DetailedResult,
  ListMemberItem,
} from '~/src/types/index';
import { addUserToList } from '~/src/lib/bskyService';
import { curateUserLists } from '~/src/lib/openai';
import type { ComponentPublicInstance } from 'vue';

defineOptions({
  name: 'DataDisplay',
});

const followsStore = useFollowsStore();
const listsStore = useListsStore();
const suggestionsStore = useSuggestionsStore();

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
      dataObject.value.type === 'lists' ||
      dataObject.value.type === 'list-members') &&
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

const suggestionsButtonTitle = computed(() => {
  const buttonTitle =
    remainingSuggestions.value === 999
      ? 'You have unlimited suggestions available'
      : `${remainingSuggestions.value}/5 suggestions request remaining today`;
  return buttonTitle;
});

const suggestionsButtonLabel = computed(() => {
  if (suggestionsStore.isProcessingSuggestions) {
    return 'Processing';
  } else if (hasReachedSuggestionLimit.value) {
    return 'Limit Reached';
  } else {
    return 'Suggest Lists';
  }
});

const dataCardRefs = ref<
  ComponentPublicInstance<InstanceType<typeof DataCard>>[]
>([]);
const memberCardRefs = ref<
  ComponentPublicInstance<InstanceType<typeof MemberCard>>[]
>([]);
const isAcceptingAll = ref(false);
const acceptAllResult = ref('');
const acceptAllError = ref(false);
const detailedResults = ref<DetailedResult[]>([]);
const selectedMemberUris = ref<string[]>([]);
const isBatchRemoving = ref(false);

/**
 * Toggle all list options across all follow profile cards
 */
const handleToggleFollowsLists = () => {
  if (!dataObject.value || !dataCardRefs.value.length) return;

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
    if (
      dataObject.value.type === 'list-posts' &&
      dataObject.value.listInfo?.uri
    ) {
      // For list posts, emit a refresh event with the list-posts type
      // This will trigger the parent Dashboard component to refresh the list posts
      emit('refresh', 'list-posts');
    } else {
      emit('refresh', dataObject.value.type);
    }
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
    case 'list-posts':
      if (dataObject.value?.listInfo?.name) {
        return `List: ${dataObject.value.listInfo.name}`;
      }
      return 'List Posts';
    case 'list-members':
      if (dataObject.value?.listInfo?.name) {
        return `Members: ${dataObject.value.listInfo.name}`;
      }
      return 'List Members';
    default:
      return 'Data';
  }
};

const showBackButton = computed(() => {
  return (
    dataObject.value?.type === 'list-posts' ||
    dataObject.value?.type === 'list-members'
  );
});

const navigateBackToLists = () => {
  const router = useRouter();
  router.push('/lists');
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
    dataObject.value?.type === 'lists' ||
    dataObject.value?.type === 'list-members'
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

  suggestionsStore.setIsProcessing(true);

  try {
    const { suggestionsJSON } = await curateUserLists();

    if (!suggestionsJSON) {
      throw new Error('Failed to get suggestions');
    }

    const suggestionsData = JSON.parse(suggestionsJSON);

    applySuggestionsToFollows(suggestionsData);

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
    suggestionsStore.setIsProcessing(false);
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

  const suggestionsMap = suggestionsData.data.reduce(
    (map: Record<string, SuggestionItem>, item: SuggestionItem) => {
      map[item.did] = item;
      return map;
    },
    {}
  );

  for (const cardRef of dataCardRefs.value) {
    if (!cardRef) continue;

    const followItem = dataObject.value.data[
      cardRef.$props.index
    ] as FollowItem;
    if (!followItem) continue;

    const matchingSuggestion = suggestionsMap[followItem.did];

    if (
      matchingSuggestion &&
      matchingSuggestion.suggestedLists &&
      matchingSuggestion.suggestedLists.length > 0
    ) {
      if (!cardRef.followEnabledLists) continue;

      for (const list of matchingSuggestion.suggestedLists) {
        const key = `${followItem.did}-${list.uri}`;

        if (typeof cardRef.followEnabledLists[key] !== 'undefined') {
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
  if (listsStore.lists.allLists && listsStore.lists.allLists.length > 0) {
    const foundList = listsStore.lists.allLists.find(
      (list: ListItem) => list.uri === listUri
    );
    if (foundList) {
      return foundList.name;
    }
  }

  if (listsStore.listsJSON) {
    try {
      const listsData = JSON.parse(listsStore.listsJSON);
      const listMap = new Map<string, string>();
      if (listsData.data && Array.isArray(listsData.data)) {
        for (const list of listsData.data) {
          listMap.set(list.uri, list.name);
        }

        const foundName = listMap.get(listUri);
        if (foundName) {
          return foundName;
        }
      }
    } catch (error) {
      console.error('Error parsing lists JSON:', error);
    }
  }

  try {
    const uriParts = listUri.split('/');
    if (uriParts.length > 0) {
      return `List ${uriParts[uriParts.length - 1]}`;
    }
  } catch (error) {
    console.error('Error extracting list name from URI:', error);
  }

  return 'Unknown List';
};

const hasReachedSuggestionLimit = ref(false);
const remainingSuggestions = ref(5);

/**
 * Checks if there are existing lists fetched
 * Used to determine whether to show a cancel button in create mode
 */
const hasExistingLists = computed(() => {
  // Check if we have lists data in the store
  return listsStore.lists.allLists && listsStore.lists.allLists.length > 0;
});

// Track which component to show in the empty state
const showingComponent = ref<'create' | 'edit' | 'delete' | null>(null);
// Store the current list being edited or deleted
const currentListData = ref<{
  uri: string;
  name: string;
  description: string;
} | null>(null);

/**
 * Reset component display to default state
 */
const resetComponentDisplay = () => {
  const wasInCreateMode =
    showingComponent.value === 'create' && hasExistingLists.value;

  // First reset the component state
  showingComponent.value = null;
  currentListData.value = null;

  // After resetting state, refresh the lists if needed
  if (wasInCreateMode) {
    // We use setTimeout to ensure the state reset happens first
    // This allows the button to work again after cancellation
    setTimeout(() => {
      handleRefresh();
    }, 0);
  }
};

/**
 * Handle list creation event from ListForm component
 * Refreshes the lists view to show the newly created list
 */
const handleListCreated = (success: boolean) => {
  if (success && dataObject.value?.type === 'lists') {
    // Reset component state before refreshing
    showingComponent.value = null;
    currentListData.value = null;

    // Use setTimeout to ensure the state reset happens first
    // This allows the button to work again after list creation
    setTimeout(() => {
      handleRefresh();
    }, 0);
  }
};

/**
 * Handle list updated event from DataCard component
 * Refreshes the lists view to show the updated list
 */
const handleListUpdated = (success: boolean) => {
  if (success && dataObject.value?.type === 'lists') {
    handleRefresh();
  }
};

/**
 * Handle list deleted event from DataCard component
 * Refreshes the lists view to reflect the deleted list
 */
const handleListDeleted = (success: boolean) => {
  if (success && dataObject.value?.type === 'lists') {
    handleRefresh();
  }
};

/**
 * Relay the add-to-list event from DataCard
 */
const handleAddToList = (
  profileDid: string,
  listName: string,
  success: boolean
) => {
  // Handle any additional logic if needed
  console.log(
    `Profile ${profileDid} was ${
      success ? 'added to' : 'not added to'
    } list ${listName}`
  );
};

const updateSuggestionLimits = async () => {
  hasReachedSuggestionLimit.value = await suggestionsStore.hasReachedLimit();
  remainingSuggestions.value = await suggestionsStore.getRemainingRequests();
};

updateSuggestionLimits();

watch(
  () => suggestionsStore.isProcessingSuggestions,
  async (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      await updateSuggestionLimits();
    }
  }
);

/**
 * Handle confirming list deletion
 */
const confirmDeleteList = async () => {
  if (!currentListData.value) return;

  try {
    const { deleteList } = await import('~/src/lib/bskyService');
    const result = await deleteList(currentListData.value.uri);

    if (result.success) {
      handleListDeleted(true);
    } else {
      console.error('Failed to delete list:', result.message);
    }
  } catch (error) {
    console.error('Error deleting list:', error);
  }
};

/**
 * Handle creating a new list
 * Shows the create list form in a modal
 */
const handleCreateList = () => {
  // Hide any previously shown component
  resetComponentDisplay();

  // Create a modal or overlay to display the ListForm
  if (!hasData.value && dataObject.value?.type === 'lists') {
    // If no lists exist yet, the form is already shown in the empty state
    return;
  }

  // Set the component to be shown in a modal
  showingComponent.value = 'create';

  // Hide the list of items temporarily to show the form
  const tempData = {
    ...dataObject.value,
    data: [],
    type: dataObject.value?.type || 'lists',
  };
  const uiStore = useUiStore();
  uiStore.setDisplayData(tempData as DataObject);
};

/**
 * Toggle selection for a member item
 */
const handleMemberToggleSelected = (selected: boolean, itemUri: string) => {
  if (selected) {
    // Add to selected members if not already there
    if (!selectedMemberUris.value.includes(itemUri)) {
      selectedMemberUris.value.push(itemUri);
    }
  } else {
    // Remove from selected members
    selectedMemberUris.value = selectedMemberUris.value.filter(
      (uri) => uri !== itemUri
    );
  }
};

/**
 * Toggle all members selection state
 */
const handleToggleSelectedMembers = () => {
  if (!memberCardRefs.value.length) return;

  // Instead of checking if all are selected and setting all to the same state,
  // toggle each member's selection individually
  for (const cardRef of memberCardRefs.value) {
    if (!cardRef) continue;

    // Toggle the current selection state
    const newState = !cardRef.isSelected;
    cardRef.isSelected = newState;
    handleMemberToggleSelected(newState, cardRef.$props.item.uri);
  }
};

/**
 * Reset member selection state
 */
const resetMemberSelection = () => {
  selectedMemberUris.value = [];
  // Reset selection state in member cards if they exist
  if (memberCardRefs.value && memberCardRefs.value.length > 0) {
    for (const cardRef of memberCardRefs.value) {
      if (cardRef) {
        cardRef.isSelected = false;
      }
    }
  }
};

// Watch for changes in data object to reset member selection
watch(
  () => props.data,
  () => {
    if (props.data?.type === 'list-members') {
      resetMemberSelection();
    }
  },
  { deep: true }
);

/**
 * Remove member from list
 */
const handleMemberRemoved = () => {
  // Refresh the list members view to show the updated list
  if (dataObject.value?.type === 'list-members') {
    handleRefresh();
  }
};

/**
 * Handle error when removing member from list
 */
const handleMemberRemoveError = (error: string) => {
  acceptAllResult.value = `Error removing member from list: ${error}`;
  acceptAllError.value = true;
};

/**
 * Remove all selected members from the list
 */
const handleBatchRemoveMembers = async () => {
  if (isBatchRemoving.value || selectedMemberUris.value.length === 0) return;

  isBatchRemoving.value = true;
  acceptAllResult.value = '';
  acceptAllError.value = false;
  detailedResults.value = [];

  try {
    const { removeUsersFromList } = await import('~/src/lib/bskyService');
    const results = await removeUsersFromList(selectedMemberUris.value);

    let successCount = 0;
    let errorCount = 0;

    for (const result of results) {
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (successCount > 0 && errorCount === 0) {
      acceptAllResult.value = `Successfully removed ${successCount} members from the list`;
      acceptAllError.value = false;
      // Refresh the view to show the updated list
      handleRefresh();
    } else if (successCount > 0 && errorCount > 0) {
      acceptAllResult.value = `Removed ${successCount} members with ${errorCount} errors`;
      acceptAllError.value = true;
      handleRefresh();
    } else if (successCount === 0 && errorCount > 0) {
      acceptAllResult.value = `Failed to remove any members. ${errorCount} errors occurred.`;
      acceptAllError.value = true;
    } else {
      acceptAllResult.value = 'No members were removed';
      acceptAllError.value = false;
    }

    // Clear the selection
    selectedMemberUris.value = [];
  } catch (error) {
    console.error('Error removing members in batch:', error);
    acceptAllResult.value = `Error removing members: ${
      (error as Error).message
    }`;
    acceptAllError.value = true;
  } finally {
    isBatchRemoving.value = false;
  }
};

/**
 * Properly typed list members for use with MemberCard component
 */
const typedListMembers = computed(() => {
  if (dataObject.value?.type === 'list-members' && dataObject.value.data) {
    // Type assertion needed because TypeScript doesn't know that
    // when type === 'list-members', the data has the ListMemberItem structure
    return (dataObject.value.data as ListMemberItem[]).map((item) => ({
      did: item.did,
      handle: item.handle,
      name: item.name,
      description: item.description,
      uri: item.uri,
      avatar: item.avatar,
    }));
  }
  return [];
});

/**
 * Helper function to get the current page for pagination
 * @param dataType The type of data being displayed
 */
const getPaginationCurrentPage = (dataType: string): number => {
  if (dataType === 'follows') {
    return followsStore.follows.currentPage;
  } else if (dataType === 'lists') {
    return listsStore.lists.currentPage;
  } else if (dataType === 'list-members') {
    return listsStore.members.currentPage;
  }
  return 1;
};

/**
 * Helper function to get the total pages for pagination
 * @param dataType The type of data being displayed
 */
const getPaginationTotalPages = (dataType: string): number => {
  if (dataType === 'follows') {
    return followsStore.follows.prefetchedPages;
  } else if (dataType === 'lists') {
    return listsStore.lists.prefetchedPages;
  } else if (dataType === 'list-members') {
    return listsStore.getMembersTotalPages();
  }
  return 1;
};
</script>
