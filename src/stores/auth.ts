import { defineStore } from 'pinia';
import { AtpAgent } from '@atproto/api';

let agentInstance: AtpAgent | null = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    formInfo: '',
    loginError: '',
    did: '',
    isLoggedIn: false,
    initialized: false,
  }),

  actions: {
    setFormInfo(info: string) {
      this.formInfo = info;
    },

    setLoginError(error: string) {
      this.loginError = error;
    },

    setDid(did: string) {
      this.did = did;
    },

    login() {
      this.isLoggedIn = true;
    },

    logout() {
      this.formInfo = '';
      this.loginError = '';
      this.did = '';
      this.isLoggedIn = false;
      agentInstance = null;
    },

    setInitialized(value: boolean) {
      this.initialized = value;
    },

    getAgent() {
      if (!agentInstance) {
        agentInstance = new AtpAgent({
          service: 'https://bsky.social',
        });
      }
      return agentInstance;
    },
  },
});
