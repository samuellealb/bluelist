import { reactive } from 'vue';
import { AtpAgent } from '@atproto/api';

export const state = reactive({
  formInfo: '',
  loginError: '',
  did: '',
  agent: new AtpAgent({
    service: 'https://bsky.social',
  }),
  isLoggedIn: false,
  displayData: '',
  usersJSON: '',
  listsJSON: '',
});
