import { reactive } from 'vue';
import { AtpAgent } from '@atproto/api';
import type { DataObject, FollowItem, ListItem } from '~/src/types/index';

export const state = reactive({
  formInfo: '',
  loginError: '',
  did: '',
  agent: new AtpAgent({
    service: 'https://bsky.social',
  }),
  isLoggedIn: false,
  displayData: null as DataObject | null,
  usersJSON: '',
  listsJSON: '',
  timelineJSON: '',
  follows: {
    currentPage: 1,
    itemsPerPage: 20,
    cursor: null as string | null,
    hasMorePages: false,
    allFollows: [] as FollowItem[],
    prefetchedPages: 0,
    isFetching: false,
  },
  lists: {
    currentPage: 1,
    itemsPerPage: 5, // 5 items per page as specified in the requirements
    cursor: null as string | null,
    hasMorePages: false,
    allLists: [] as ListItem[],
    prefetchedPages: 0,
    isFetching: false,
  },
  isProcessingSuggestions: false,
});
