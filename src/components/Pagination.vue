<template>
  <div class="pagination" :class="{ 'pagination--top': isTop }">
    <span class="pagination__info">
      Page {{ currentPage }} of {{ totalPages }}
      <span v-if="totalItems" class="pagination__details">
        ({{ totalItems }} users loaded)
      </span>
    </span>
    <div class="pagination__buttons">
      <button
        class="pagination__button"
        :disabled="currentPage === 1 || isLoading"
        title="First page"
        @click="handlePageChange(1)"
      >
        &laquo;
      </button>
      <button
        class="pagination__button"
        :disabled="currentPage === 1 || isLoading"
        title="Previous page"
        @click="handlePageChange(currentPage - 1)"
      >
        &lsaquo;
      </button>
      <button
        class="pagination__button"
        :disabled="!hasMorePages || isLoading"
        title="Next page"
        @click="handlePageChange(currentPage + 1)"
      >
        &rsaquo;
      </button>
      <button
        class="pagination__button"
        :disabled="isLastPage || isLoading"
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
import { state } from '~/src/store';

defineOptions({
  name: 'PaginationControls',
});

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  hasMorePages: boolean;
  totalItems?: number;
  isTop?: boolean;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
}>();

const lastPage = computed(() => {
  if (props.currentPage === undefined) return 1;

  // Calculate last page based on the view type (follows or lists)
  if (state.follows.currentPage === props.currentPage) {
    // This is the follows view
    if (!state.follows.allFollows.length) return 1;
    return Math.ceil(
      state.follows.allFollows.length / state.follows.itemsPerPage
    );
  } else if (state.lists.currentPage === props.currentPage) {
    // This is the lists view
    if (!state.lists.allLists.length) return 1;
    return Math.ceil(state.lists.allLists.length / state.lists.itemsPerPage);
  }

  // Default fallback
  return props.totalPages || 1;
});

const isLastPage = computed(() => {
  return props.currentPage >= lastPage.value || !props.hasMorePages;
});

const handlePageChange = (newPage: number) => {
  emit('pageChange', newPage);
};
</script>
