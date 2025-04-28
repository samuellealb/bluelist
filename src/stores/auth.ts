import { defineStore } from 'pinia';
import { AtpService } from '~/src/lib/AtpService';
import { useSuggestionsStore } from './suggestions';

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
      const suggestionsStore = useSuggestionsStore();
      suggestionsStore.loadRequestCounts();
    },

    logout() {
      this.formInfo = '';
      this.loginError = '';
      this.did = '';
      this.isLoggedIn = false;
      AtpService.resetAgent();
    },

    setInitialized(value: boolean) {
      this.initialized = value;
    },

    getAgent() {
      return AtpService.getAgent();
    },
  },
});
