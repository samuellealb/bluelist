<template>
  <div
    class="data-card"
    :class="{
      'data-card--timeline': item.type === 'timeline',
      'data-card--list': item.type === 'lists',
      'data-card--follow': item.type === 'follows',
      'data-card--post': item.type === 'list-posts',
      'data-card--loading': suggestionsStore.isProcessingSuggestions,
    }"
  >
    <div v-if="item.type === 'timeline' && timelineItem">
      <div class="data-card__header">
        <span class="data-card__author">{{
          timelineItem.author.name || timelineItem.author.handle
        }}</span>
        <span class="data-card__handle">@{{ timelineItem.author.handle }}</span>
      </div>
      <div class="data-card__content">
        <p class="data-card__text">{{ timelineItem.text }}</p>
      </div>
      <div class="data-card__footer">
        <div class="data-card__meta">
          <span class="data-card__meta-item">
            <span class="data-card__icon">[T]</span>
            {{ formatDate(timelineItem.indexedAt) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="item.type === 'lists' && listItem">
      <!-- List card content with all states: normal, edit, and delete confirmation -->
      <template v-if="cardState === 'normal'">
        <div class="data-card__header">
          <h3 class="data-card__title" @click="navigateToListPosts">
            {{ listItem.name }}
          </h3>
          <div class="data-card__actions">
            <button
              class="data-card__action-button data-card__action-button--members"
              title="View List Members"
              :disabled="memberCountLoading || memberCount === 0"
              @click="navigateToListMembers"
            >
              <span class="data-card__action-icon">[👥]</span>
              <span v-if="memberCountLoading" class="data-card__count-loading"
                >...</span
              >
              <span v-else class="data-card__member-count">{{
                memberCount
              }}</span>
            </button>
            <button
              class="data-card__action-button data-card__action-button--edit"
              title="Edit List"
              @click="setCardState('edit')"
            >
              <span class="data-card__action-icon">[✎]</span>
            </button>
            <button
              class="data-card__action-button data-card__action-button--delete"
              title="Delete List"
              @click="setCardState('delete')"
            >
              <span class="data-card__action-icon">[×]</span>
            </button>
          </div>
        </div>
        <div v-if="listItem.description" class="data-card__content">
          <p>{{ listItem.description }}</p>
        </div>
      </template>

      <!-- Edit List View -->
      <template v-else-if="cardState === 'edit'">
        <div class="data-card__edit-container">
          <div class="data-card__edit-header">
            <h3 class="data-card__edit-title">Edit List</h3>
          </div>
          <ListForm
            v-if="listItem"
            :is-edit-mode="true"
            :list-data="{
              uri: listItem.uri,
              name: listItem.name,
              description: listItem.description || '',
            }"
            @list-updated="handleListUpdated"
            @list-deleted="handleListDeleted"
            @delete-requested="setCardState('delete')"
            @cancel-edit="setCardState('normal')"
          />
        </div>
      </template>

      <!-- Delete Confirmation View -->
      <template v-else-if="cardState === 'delete'">
        <div class="data-card__delete-container">
          <div class="data-card__delete-header">
            <h3 class="data-card__delete-title">Delete List</h3>
          </div>
          <div class="data-card__delete-content">
            <p>
              Are you sure you want to delete the list "{{ listItem.name }}"?
            </p>
            <p>This action cannot be undone.</p>
            <div class="data-card__delete-actions">
              <button
                class="data-card__delete-cancel"
                @click="setCardState('normal')"
              >
                Cancel
              </button>
              <button
                class="data-card__delete-confirm-button"
                :disabled="isDeleting"
                @click="confirmDeleteList"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-else-if="item.type === 'follows' && followItem">
      <div class="data-card__info">
        <h3 class="data-card__title">
          {{ followItem.name || followItem.handle }}
        </h3>
        <p class="data-card__subtitle">@{{ followItem.handle }}</p>
        <p v-if="followItem.description">{{ followItem.description }}</p>
      </div>

      <div class="data-card__footer">
        <ListChips
          v-if="followItem"
          ref="followListChipsRef"
          :profile-did="followItem.did"
          :profile-name="followItem.name || followItem.handle"
          :title="'Add to Lists'"
          :show-no-lists-message="false"
          :hide-warning-but-show-lists="true"
          @add-to-list="handleAddToList"
          @update:enabled-lists="updateFollowEnabledLists"
        />
      </div>
    </div>

    <div v-else-if="item.type === 'list-posts' && listPostItem">
      <div class="data-card__header">
        <span class="data-card__author">{{
          listPostItem.author.name || listPostItem.author.handle
        }}</span>
        <span class="data-card__handle">@{{ listPostItem.author.handle }}</span>
      </div>
      <div class="data-card__content">
        <p class="data-card__text">{{ listPostItem.text }}</p>
      </div>
      <div class="data-card__footer">
        <div class="data-card__meta">
          <span class="data-card__meta-item">
            <span class="data-card__icon">[T]</span>
            {{ formatDate(listPostItem.indexedAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSuggestionsStore } from '~/src/stores/suggestions';
import { useListsStore } from '~/src/stores/lists';
import '~/src/assets/styles/data-card.css';
import ListChips from '~/src/components/ListChips.vue';
import ListForm from '~/src/components/ListForm.vue';
import { AtpService } from '~/src/lib/AtpService';
import { deleteList } from '~/src/lib/bskyService';
import type {
  DataObject,
  TimelineItem,
  ListItem,
  FollowItem,
} from '~/src/types/index';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';

defineOptions({
  name: 'DataCard',
});

const router = useRouter();
const suggestionsStore = useSuggestionsStore();
const listsStore = useListsStore();

const props = defineProps<{
  item: DataObject;
  index: number;
}>();

const emit = defineEmits<{
  (
    e: 'add-to-list',
    profileDid: string,
    listName: string,
    success: boolean
  ): void;
  (e: 'list-updated' | 'list-deleted', success: boolean): void;
}>();

const isDeleting = ref(false);
const cardState = ref<'normal' | 'edit' | 'delete'>('normal');
const memberCount = ref(0);
const memberCountLoading = ref(true);

const getItemData = function <T>(type: string): T | null {
  if (props.item.type === type && props.item.data[props.index]) {
    return props.item.data[props.index] as T;
  }
  return null;
};

const timelineItem = computed(() => getItemData<TimelineItem>('timeline'));
const listItem = computed(() => getItemData<ListItem>('lists'));
const followItem = computed(() => getItemData<FollowItem>('follows'));
const listPostItem = computed(() => getItemData<TimelineItem>('list-posts'));

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const followListChipsRef = ref<InstanceType<typeof ListChips> | null>(null);
const followEnabledLists = ref<Record<string, boolean>>({});

/**
 * Relay the add-to-list event from ListChips
 */
const handleAddToList = (
  profileDid: string,
  listName: string,
  success: boolean
) => {
  emit('add-to-list', profileDid, listName, success);
};

/**
 * Update the followEnabledLists state from ListChips for follows view
 */
const updateFollowEnabledLists = (lists: Record<string, boolean>) => {
  followEnabledLists.value = lists;
};

/**
 * Toggle all list suggestions for follows - delegate to follow ListChips component
 */
const toggleFollowAllLists = (
  enable?: boolean,
  invertEach: boolean = false
) => {
  if (followListChipsRef.value) {
    followListChipsRef.value.toggleAllLists(enable, invertEach);
  }
};

const setCardState = (state: 'normal' | 'edit' | 'delete') => {
  cardState.value = state;
};

const confirmDeleteList = async () => {
  if (!listItem.value) return;

  try {
    isDeleting.value = true;
    const result = await deleteList(listItem.value.uri);

    if (result.success) {
      emit('list-deleted', true);
      setCardState('normal');
    } else {
      console.error('Failed to delete list:', result.message);
    }
  } catch (error) {
    console.error('Error deleting list:', error);
  } finally {
    isDeleting.value = false;
  }
};

const handleListUpdated = (success: boolean) => {
  emit('list-updated', success);
  if (success) {
    setCardState('normal');
  }
};

const handleListDeleted = (success: boolean) => {
  emit('list-deleted', success);
  if (success) {
    setCardState('normal');
  }
};

/**
 * Navigate to the list posts view when the user clicks on a list title
 */
const navigateToListPosts = () => {
  if (!listItem.value || !listItem.value.uri) return;

  localStorage.setItem('bluelist_current_list_uri', listItem.value.uri);

  router.push({
    path: '/list-posts',
    query: { uri: listItem.value.uri },
  });
};

/**
 * Navigate to the list members view
 */
const navigateToListMembers = () => {
  if (!listItem.value || !listItem.value.uri) return;

  localStorage.setItem('bluelist_current_list_uri', listItem.value.uri);

  router.push({
    path: '/list-members',
    query: { uri: listItem.value.uri },
  });
};

/**
 * Fetch the number of members in this list
 */
const fetchMemberCount = async () => {
  if (!listItem.value || !listItem.value.uri) return;

  const cachedCount = listsStore.getMemberCount(listItem.value.uri);
  if (cachedCount > 0) {
    memberCount.value = cachedCount;
    memberCountLoading.value = false;
    return;
  }

  memberCountLoading.value = true;
  try {
    const agent = AtpService.getAgent();
    const { data } = await agent.app.bsky.graph.getList({
      list: listItem.value.uri,
      limit: 100,
    });

    const count = data.items.length;
    memberCount.value = count;
    listsStore.setMemberCount(listItem.value.uri, count);
  } catch (error) {
    console.error('Error fetching list member count:', error);
    memberCount.value = 0;
  } finally {
    memberCountLoading.value = false;
  }
};

watch(
  () => listItem.value?.uri,
  (newUri) => {
    if (newUri) {
      fetchMemberCount();
    }
  }
);

onMounted(() => {
  if (listItem.value) {
    fetchMemberCount();
  }
});

defineExpose({
  followEnabledLists,
  toggleFollowAllLists,
  listItem,
  fetchMemberCount,
});
</script>
