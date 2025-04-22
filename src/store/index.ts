import { reactive } from 'vue';
import { AtpAgent } from '@atproto/api';
import type { DataObject } from '~/src/types';

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
});
