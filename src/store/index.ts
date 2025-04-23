import { reactive } from 'vue';
import { AtpAgent } from '@atproto/api';
import type { DataObject, FollowItem } from '~/src/types';

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
  suggestionsJSON: '',
  follows: {
    currentPage: 1,
    itemsPerPage: 20,
    cursor: null as string | null,
    hasMorePages: false,
    allFollows: [] as FollowItem[],
    prefetchedPages: 0,
    isFetching: false,
  },
});
