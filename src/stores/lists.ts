import { defineStore } from 'pinia';
import type { ListItem, ListMemberItem } from '~/src/types';

export const useListsStore = defineStore('lists', {
  state: () => ({
    listsJSON: '',
    lists: {
      allLists: [] as ListItem[],
      currentPage: 1,
      hasMorePages: false,
      cursor: null as string | null,
      prefetchedPages: 0,
      itemsPerPage: 10,
      isFetching: false,
    },
    members: {
      allMembers: [] as ListMemberItem[],
      currentPage: 1,
      hasMorePages: false,
      cursor: null as string | null,
      prefetchedPages: 0,
      itemsPerPage: 10,
      isFetching: false,
      activeListUri: null as string | null,
    },
    membersCacheDirty: false, // Flag to track when members have been added/removed
    memberCountsCache: {} as Record<string, number>, // Cache for storing member counts by list URI
  }),

  getters: {
    hasLists: (state) => state.lists.allLists.length > 0,

    totalPages: (state) => {
      return state.lists.hasMorePages
        ? state.lists.currentPage + 1
        : Math.ceil(state.lists.allLists.length / state.lists.itemsPerPage) ||
            1;
    },

    activeList: (state) => {
      if (state.members.activeListUri) {
        const foundList = state.lists.allLists.find(
          (list) => list.uri === state.members.activeListUri
        );
        return (
          foundList || {
            name: 'Unknown List',
            description: '',
            uri: state.members.activeListUri,
          }
        );
      }
      return { name: 'Unknown List', description: '', uri: '' };
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

    setMembersCurrentPage(page: number) {
      this.members.currentPage = page;
    },

    setMembersCursor(cursor: string | null) {
      this.members.cursor = cursor;
    },

    setMembersHasMorePages(hasMore: boolean) {
      this.members.hasMorePages = hasMore;
    },

    setMembersPrefetchedPages(pages: number) {
      this.members.prefetchedPages = pages;
    },

    setMembersIsFetching(isFetching: boolean) {
      this.members.isFetching = isFetching;
    },

    setActiveListUri(uri: string | null) {
      this.members.activeListUri = uri;
    },

    setMembers(members: ListMemberItem[]) {
      this.members.allMembers = members;
    },

    addMembers(members: ListMemberItem[]) {
      this.members.allMembers = [...this.members.allMembers, ...members];
    },

    getCurrentPageMembers() {
      const start = (this.members.currentPage - 1) * this.members.itemsPerPage;
      return this.members.allMembers.slice(
        start,
        start + this.members.itemsPerPage
      );
    },

    getMembersTotalPages() {
      return (
        Math.ceil(this.members.allMembers.length / this.members.itemsPerPage) ||
        1
      );
    },

    resetMembersPagination() {
      this.members.currentPage = 1;
      this.members.cursor = null;
      this.members.hasMorePages = false;
      this.members.prefetchedPages = 0;
    },

    resetAllMembersData() {
      this.members.allMembers = [];
      this.resetMembersPagination();
      this.members.activeListUri = null;
    },

    setMembersCacheDirty(isDirty: boolean) {
      this.membersCacheDirty = isDirty;
      // When setting dirty flag to true, we should clear the member counts cache
      // because the counts might have changed if members were added/removed
      if (isDirty) {
        this.memberCountsCache = {};
      }
    },

    // Add new actions for member counts cache
    setMemberCount(listUri: string, count: number) {
      this.memberCountsCache[listUri] = count;
    },

    getMemberCount(listUri: string): number {
      return this.memberCountsCache[listUri] || 0;
    },

    clearMemberCountsCache() {
      this.memberCountsCache = {};
    },
  },
});
