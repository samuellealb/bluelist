<template>
  <div
    class="data-card"
    :class="{
      'data-card--timeline': item.type === 'timeline',
      'data-card--list': item.type === 'lists',
      'data-card--follow': item.type === 'follows',
      'data-card--suggestion': item.type === 'suggestions',
    }"
  >
    <!-- Timeline Item -->
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

    <!-- List Item -->
    <div v-else-if="item.type === 'lists' && listItem">
      <div class="data-card__header">
        <h3 class="data-card__title">{{ listItem.name }}</h3>
      </div>
      <div v-if="listItem.description" class="data-card__content">
        <p>{{ listItem.description }}</p>
      </div>
    </div>

    <!-- Follow Item -->
    <div v-else-if="item.type === 'follows' && followItem">
      <div class="data-card__avatar">[o]</div>
      <div class="data-card__info">
        <h3 class="data-card__title">
          {{ followItem.name || followItem.handle }}
        </h3>
        <p class="data-card__subtitle">@{{ followItem.handle }}</p>
        <p v-if="followItem.description">{{ followItem.description }}</p>
      </div>
    </div>

    <!-- Suggestion Item -->
    <div v-else-if="item.type === 'suggestions' && suggestionItem">
      <div class="data-card__header">
        <div class="data-card__avatar">[o]</div>
        <div>
          <h3 class="data-card__title">{{ suggestionItem.name }}</h3>
          <p v-if="suggestionItem.description" class="data-card__subtitle">
            {{ suggestionItem.description }}
          </p>
        </div>
      </div>

      <ListChips
        v-if="suggestionItem"
        ref="listChipsRef"
        :profile-did="suggestionItem.did"
        :profile-name="suggestionItem.name"
        :lists="suggestionItem.suggestedLists"
        :title="'Suggested Lists'"
        :show-no-lists-message="true"
        @add-to-list="handleAddToList"
        @update:enabled-lists="updateEnabledLists"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/data-card.css';
import ListChips from '~/src/components/ListChips.vue';
import type {
  DataObject,
  TimelineItem,
  ListItem,
  FollowItem,
  SuggestionItem,
} from '~/src/types';

defineOptions({
  name: 'DataCard',
});

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
}>();

const timelineItem = computed(() => {
  if (props.item.type === 'timeline' && props.item.data[props.index]) {
    return props.item.data[props.index] as TimelineItem;
  }
  return null;
});

const listItem = computed(() => {
  if (props.item.type === 'lists' && props.item.data[props.index]) {
    return props.item.data[props.index] as ListItem;
  }
  return null;
});

const followItem = computed(() => {
  if (props.item.type === 'follows' && props.item.data[props.index]) {
    return props.item.data[props.index] as FollowItem;
  }
  return null;
});

const suggestionItem = computed(() => {
  if (props.item.type === 'suggestions' && props.item.data[props.index]) {
    return props.item.data[props.index] as SuggestionItem;
  }
  return null;
});

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const listChipsRef = ref<InstanceType<typeof ListChips> | null>(null);
const enabledLists = ref<Record<string, boolean>>({});

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
 * Update the enabledLists state from ListChips
 */
const updateEnabledLists = (lists: Record<string, boolean>) => {
  enabledLists.value = lists;
};

/**
 * Toggle all list suggestions - delegate to ListChips component
 */
const toggleAllLists = (enable?: boolean, invertEach: boolean = false) => {
  if (listChipsRef.value) {
    listChipsRef.value.toggleAllLists(enable, invertEach);
  }
};

defineExpose({
  enabledLists,
  toggleAllLists,
});
</script>
