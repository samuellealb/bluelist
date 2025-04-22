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
            <span class="data-card__icon">🕒</span>
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
      <div class="data-card__footer">
        <div class="data-card__meta">
          <span class="data-card__meta-item">
            <span class="data-card__icon">🔗</span>
            {{ shortenUri(listItem.uri) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Follow Item -->
    <div v-else-if="item.type === 'follows' && followItem">
      <div class="data-card__avatar">👤</div>
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
        <div class="data-card__avatar">👤</div>
        <div>
          <h3 class="data-card__title">{{ suggestionItem.name }}</h3>
          <p v-if="suggestionItem.description" class="data-card__subtitle">
            {{ suggestionItem.description }}
          </p>
        </div>
      </div>
      <div
        v-if="
          suggestionItem.suggestedLists &&
          suggestionItem.suggestedLists.length > 0
        "
        class="data-card__lists"
      >
        <h4 class="data-card__subtitle">Suggested Lists:</h4>
        <div class="data-card__list-buttons">
          <button
            v-for="(list, idx) in suggestionItem.suggestedLists"
            :key="idx"
            class="data-card__list-button"
            :title="list.description"
            @click="handleListClick(suggestionItem.name, list.name)"
          >
            {{ list.name }}
          </button>
        </div>
      </div>
      <div v-else class="data-card__no-lists">
        <p class="data-card__message">
          <span class="data-card__icon">ℹ️</span>
          No list suggestions found for this profile. This profile doesn't match
          any of your existing lists.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/data-card.css';
import { computed } from 'vue';
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

/**
 * Formats a date string to a human-readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Shortens a URI for display
 */
const shortenUri = (uri: string): string => {
  if (!uri) return '';
  return uri.split('/').pop() || uri;
};

/**
 * Handles clicks on list buttons
 */
const handleListClick = (profileName: string, listName: string) => {
  console.log(`Action: Adding profile "${profileName}" to list "${listName}"`);
};
</script>
