<template>
  <div class="pagination" :class="{ 'pagination--top': isTop }">
    <span class="pagination__info">
      Page {{ currentPage }} of {{ totalPages }}
      <span v-if="totalItems" class="pagination__details">
        ({{ totalItems }} {{ typeLabel }} loaded)
      </span>
    </span>
    <div class="pagination__buttons">
      <button
        class="pagination__button"
        :disabled="
          currentPage === 1 ||
          isLoading ||
          suggestionsStore.isProcessingSuggestions
        "
        title="First page"
        @click="handlePageChange(1)"
      >
        &laquo;
      </button>
      <button
        class="pagination__button"
        :disabled="
          currentPage === 1 ||
          isLoading ||
          suggestionsStore.isProcessingSuggestions
        "
        title="Previous page"
        @click="handlePageChange(currentPage - 1)"
      >
        &lsaquo;
      </button>
      <button
        class="pagination__button"
        :disabled="
          !hasMorePages || isLoading || suggestionsStore.isProcessingSuggestions
        "
        title="Next page"
        @click="handlePageChange(currentPage + 1)"
      >
        &rsaquo;
      </button>
      <button
        class="pagination__button"
        :disabled="
          isLoading ||
          suggestionsStore.isProcessingSuggestions ||
          currentPage === lastPage ||
          totalPages < 2
        "
        title="Skip to last loaded page"
        @click="handlePageChange(lastPage)"
      >
        &raquo;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import '~/src/assets/styles/pagination.css';
import { useFollowsStore } from '~/src/stores/follows';
import { useListsStore } from '~/src/stores/lists';
import { useSuggestionsStore } from '~/src/stores/suggestions';

defineOptions({
  name: 'PaginationControls',
});

const followsStore = useFollowsStore();
const listsStore = useListsStore();
const suggestionsStore = useSuggestionsStore();

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  hasMorePages: boolean;
  totalItems?: number;
  isTop?: boolean;
  dataType?: string;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
}>();

const lastPage = computed(() => {
  if (props.currentPage === undefined) return 1;

  const getLastPageByType = (
    items: unknown[],
    itemsPerPage: number
  ): number => {
    if (!items.length) return 1;
    return Math.ceil(items.length / itemsPerPage);
  };

  switch (props.dataType) {
    case 'list-members':
      return Math.max(
        getLastPageByType(
          listsStore.members.allMembers,
          listsStore.members.itemsPerPage
        ),
        props.totalPages
      );
    case 'follows':
      if (followsStore.follows.currentPage === props.currentPage) {
        return getLastPageByType(
          followsStore.follows.allFollows,
          followsStore.follows.itemsPerPage
        );
      }
      break;
    case 'lists':
      if (listsStore.lists.currentPage === props.currentPage) {
        return getLastPageByType(
          listsStore.lists.allLists,
          listsStore.lists.itemsPerPage
        );
      }
      break;
  }

  return props.totalPages || 1;
});

const typeLabel = computed(() => {
  if (props.dataType === 'follows') return 'profiles';
  if (props.dataType === 'list-members') return 'members';
  return 'lists';
});

const handlePageChange = (newPage: number) => {
  emit('pageChange', newPage);
};
</script>
