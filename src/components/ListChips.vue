<template>
  <div>
    <div v-if="displayableLists.length > 0" class="list-chips">
      <h4 class="list-chips__title">{{ effectiveTitle }}:</h4>
      <div class="list-chips__buttons">
        <button
          v-for="(list, idx) in displayableLists"
          :key="idx"
          class="list-chips__button"
          :class="{
            'list-chips__button--disabled':
              !enabledLists[`${profileDid}-${list.uri}`],
          }"
          :title="list.description"
          :disabled="loading"
          @click="handleAddToList(profileDid, list.uri, list.name)"
        >
          <span
            class="list-chips__checkbox"
            @click.stop="toggleListEnabled(profileDid, list.uri)"
          />
          <span class="list-chips__name">
            {{ list.name }}
          </span>
          <span v-if="activeList === list.uri && loading">...</span>
        </button>
      </div>
      <div
        v-if="actionMessage"
        class="list-chips__action-message"
        :class="{ 'list-chips__action-message--error': actionError }"
      >
        {{ actionMessage }}
      </div>
    </div>

    <div v-else-if="showNoListsMessage" class="list-chips__no-lists">
      <p class="list-chips__message">
        <span class="list-chips__icon">[!]</span>
        No list suggestions found for this profile. This profile doesn't match
        any of your existing lists.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/list-chips.css';
import { addUserToList } from '~/src/lib/bskyService';
import { useListsStore } from '~/src/stores/lists';
import type { SuggestedList, ListItem } from '~/src/types/index';

defineOptions({
  name: 'ListChips',
});

const listsStore = useListsStore();

const props = defineProps<{
  profileDid: string;
  profileName?: string;
  lists?: SuggestedList[];
  title?: string;
  showNoListsMessage?: boolean;
  hideWarningButShowLists?: boolean;
}>();

const emit = defineEmits<{
  (
    e: 'add-to-list',
    profileDid: string,
    listName: string,
    success: boolean
  ): void;
  (e: 'update:enabledLists', enabledLists: Record<string, boolean>): void;
}>();

const loading = ref(false);
const activeList = ref('');
const actionMessage = ref('');
const actionError = ref(false);
const enabledLists = ref<Record<string, boolean>>({});

/**
 * Get available lists from state or cached JSON
 */
const availableLists = computed((): SuggestedList[] => {
  if (props.lists && props.lists.length > 0) {
    return [];
  }

  if (listsStore.lists.allLists && listsStore.lists.allLists.length > 0) {
    return listsStore.lists.allLists.map((list: ListItem) => ({
      name: list.name,
      description: list.description || '',
      uri: list.uri,
    }));
  }

  if (listsStore.listsJSON) {
    try {
      const listsData = JSON.parse(listsStore.listsJSON);
      if (listsData.data && Array.isArray(listsData.data)) {
        return listsData.data.map((list: ListItem) => ({
          name: list.name,
          description: list.description || '',
          uri: list.uri,
        }));
      }
    } catch (error) {
      console.error('Error parsing lists:', error);
    }
  }

  return [];
});

/**
 * Determine which lists to display based on available sources
 */
const displayableLists = computed((): SuggestedList[] => {
  if (props.lists && props.lists.length > 0) {
    return props.lists;
  }

  if (
    availableLists.value.length > 0 &&
    (props.hideWarningButShowLists || !props.showNoListsMessage)
  ) {
    return availableLists.value;
  }

  return [];
});

/**
 * Dynamic title based on which lists are being displayed
 */
const effectiveTitle = computed((): string => {
  return props.title || 'Available Lists';
});

/**
 * Initialize enabled state for all lists
 */
watchEffect(() => {
  if (props.lists && props.lists.length > 0) {
    props.lists.forEach((list) => {
      const key = `${props.profileDid}-${list.uri}`;
      if (enabledLists.value[key] === undefined) {
        enabledLists.value[key] = true;
      }
    });
  }

  if (availableLists.value.length > 0) {
    availableLists.value.forEach((list: SuggestedList) => {
      const key = `${props.profileDid}-${list.uri}`;
      if (enabledLists.value[key] === undefined) {
        enabledLists.value[key] = false;
      }
    });
  }

  emit('update:enabledLists', enabledLists.value);
});

/**
 * Toggle enabled/disabled state for a list suggestion
 */
const toggleListEnabled = (profileDid: string, listUri: string) => {
  const key = `${profileDid}-${listUri}`;
  enabledLists.value[key] = !enabledLists.value[key];
  emit('update:enabledLists', enabledLists.value);
};

/**
 * Toggle all list suggestions for this profile
 * @param enable If true, enable all suggestions; if false, disable all; if undefined, toggle current state
 * @param invertEach If true, invert each suggestion's current state individually
 */
const toggleAllLists = (enable?: boolean, invertEach: boolean = false) => {
  const lists = displayableLists.value;
  if (lists.length === 0) return;

  const allKeys = lists.map(
    (list: SuggestedList) => `${props.profileDid}-${list.uri}`
  );

  if (invertEach) {
    allKeys.forEach((key: string) => {
      enabledLists.value[key] = !enabledLists.value[key];
    });
  } else {
    const targetState =
      enable !== undefined
        ? enable
        : !allKeys.every((key: string) => enabledLists.value[key]);

    allKeys.forEach((key: string) => {
      enabledLists.value[key] = targetState;
    });
  }

  emit('update:enabledLists', enabledLists.value);
};

/**
 * Handles clicks on list buttons
 */
const handleAddToList = async (
  profileDid: string,
  listUri: string,
  listName: string
) => {
  if (!profileDid || !listUri) {
    actionMessage.value = 'Missing required information to add user to list';
    actionError.value = true;
    emit('add-to-list', '', '', false);
    console.error('Missing required information to add user to list');
    return;
  }

  loading.value = true;
  activeList.value = listUri;
  actionMessage.value = '';
  actionError.value = false;

  try {
    const result = await addUserToList(profileDid, listUri);
    actionMessage.value = result;
    actionError.value = false;
    emit('add-to-list', profileDid, listName, true);
  } catch (error) {
    actionMessage.value = (error as Error).message;
    actionError.value = true;
    emit('add-to-list', profileDid, listName, false);
    console.error('Failed to add user to list:', error);
  } finally {
    loading.value = false;
    setTimeout(() => {
      actionMessage.value = '';
    }, 3000);
  }
};

defineExpose({
  enabledLists,
  handleAddToList,
  toggleAllLists,
});
</script>
