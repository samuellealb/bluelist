import { defineStore } from 'pinia';
import type { FollowItem } from '~/src/types/index';

export const useFollowsStore = defineStore('follows', {
  state: () => ({
    usersJSON: '',
    follows: {
      currentPage: 1,
      itemsPerPage: 20,
      cursor: null as string | null,
      hasMorePages: false,
      allFollows: [] as FollowItem[],
      prefetchedPages: 0,
      isFetching: false,
    },
  }),

  getters: {
    getCurrentPageFollows: (state) => {
      const start =
        (state.follows.currentPage - 1) * state.follows.itemsPerPage;
      return state.follows.allFollows.slice(
        start,
        start + state.follows.itemsPerPage
      );
    },

    totalPages: (state) => {
      return state.follows.hasMorePages
        ? state.follows.currentPage + 1
        : Math.ceil(
            state.follows.allFollows.length / state.follows.itemsPerPage
          ) || 1;
    },
  },

  actions: {
    setUsersJSON(json: string) {
      this.usersJSON = json;
    },

    setFollows(follows: FollowItem[]) {
      this.follows.allFollows = follows;
    },

    addFollows(follows: FollowItem[]) {
      this.follows.allFollows = [...this.follows.allFollows, ...follows];
    },

    setCursor(cursor: string | null) {
      this.follows.cursor = cursor;
    },

    setHasMorePages(hasMore: boolean) {
      this.follows.hasMorePages = hasMore;
    },

    setCurrentPage(page: number) {
      this.follows.currentPage = page;
    },

    setPrefetchedPages(pages: number) {
      this.follows.prefetchedPages = pages;
    },

    setIsFetching(isFetching: boolean) {
      this.follows.isFetching = isFetching;
    },

    resetPagination() {
      this.follows.currentPage = 1;
      this.follows.cursor = null;
      this.follows.hasMorePages = false;
      this.follows.prefetchedPages = 0;
    },
  },
});
