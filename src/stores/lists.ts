import { defineStore } from 'pinia';
import type { ListItem } from '~/src/types/index';

export const useListsStore = defineStore('lists', {
  state: () => ({
    listsJSON: '',
    lists: {
      currentPage: 1,
      itemsPerPage: 5,
      cursor: null as string | null,
      hasMorePages: false,
      allLists: [] as ListItem[],
      prefetchedPages: 0,
      isFetching: false,
    },
  }),

  getters: {
    getCurrentPageLists: (state) => {
      const start = (state.lists.currentPage - 1) * state.lists.itemsPerPage;
      return state.lists.allLists.slice(
        start,
        start + state.lists.itemsPerPage
      );
    },

    totalPages: (state) => {
      return state.lists.hasMorePages
        ? state.lists.currentPage + 1
        : Math.ceil(state.lists.allLists.length / state.lists.itemsPerPage) ||
            1;
    },
  },

  actions: {
    setListsJSON(json: string) {
      this.listsJSON = json;
    },

    setLists(lists: ListItem[]) {
      this.lists.allLists = lists;
    },

    addLists(lists: ListItem[]) {
      this.lists.allLists = [...this.lists.allLists, ...lists];
    },

    setCursor(cursor: string | null) {
      this.lists.cursor = cursor;
    },

    setHasMorePages(hasMore: boolean) {
      this.lists.hasMorePages = hasMore;
    },

    setCurrentPage(page: number) {
      this.lists.currentPage = page;
    },

    setPrefetchedPages(pages: number) {
      this.lists.prefetchedPages = pages;
    },

    setIsFetching(isFetching: boolean) {
      this.lists.isFetching = isFetching;
    },

    resetPagination() {
      this.lists.currentPage = 1;
      this.lists.cursor = null;
      this.lists.hasMorePages = false;
      this.lists.prefetchedPages = 0;
    },
  },
});
