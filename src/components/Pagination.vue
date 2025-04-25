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
          currentPage === 1 || isLoading || uiStore.isProcessingSuggestions
        "
        title="First page"
        @click="handlePageChange(1)"
      >
        &laquo;
      </button>
      <button
        class="pagination__button"
        :disabled="
          currentPage === 1 || isLoading || uiStore.isProcessingSuggestions
        "
        title="Previous page"
        @click="handlePageChange(currentPage - 1)"
      >
        &lsaquo;
      </button>
      <button
        class="pagination__button"
        :disabled="
          !hasMorePages || isLoading || uiStore.isProcessingSuggestions
        "
        title="Next page"
        @click="handlePageChange(currentPage + 1)"
      >
        &rsaquo;
      </button>
      <button
        class="pagination__button"
        :disabled="isLastPage || isLoading || uiStore.isProcessingSuggestions"
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
import { useUiStore } from '~/src/stores/ui';

defineOptions({
  name: 'PaginationControls',
});

const followsStore = useFollowsStore();
const listsStore = useListsStore();
const uiStore = useUiStore();

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

  if (followsStore.follows.currentPage === props.currentPage) {
    if (!followsStore.follows.allFollows.length) return 1;
    return Math.ceil(
      followsStore.follows.allFollows.length / followsStore.follows.itemsPerPage
    );
  } else if (listsStore.lists.currentPage === props.currentPage) {
    if (!listsStore.lists.allLists.length) return 1;
    return Math.ceil(
      listsStore.lists.allLists.length / listsStore.lists.itemsPerPage
    );
  }

  return props.totalPages || 1;
});

const isLastPage = computed(() => {
  return props.currentPage >= lastPage.value || !props.hasMorePages;
});

const typeLabel = computed(() => {
  return props.dataType === 'follows' ? 'profiles' : 'lists';
});

const handlePageChange = (newPage: number) => {
  emit('pageChange', newPage);
};
</script>
