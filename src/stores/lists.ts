import { defineStore } from 'pinia';
import type { ListItem, ListMemberItem } from '~/src/types/index';

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
    members: {
      currentPage: 1,
      itemsPerPage: 20,
      cursor: null as string | null,
      hasMorePages: false,
      allMembers: [] as ListMemberItem[],
      prefetchedPages: 0,
      isFetching: false,
      activeListUri: null as string | null,
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

    activeList: (state) => {
      // Find the list that matches the activeListUri
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

    // Members pagination actions
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
      if (uri !== this.members.activeListUri) {
        this.members.activeListUri = uri;
        this.members.allMembers = [];
        this.resetMembersPagination();
      }
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
      // Calculate total pages based on total fetched items
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
  },
});
