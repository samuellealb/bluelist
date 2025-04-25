import { defineStore } from 'pinia';
import { AtpService } from '~/src/lib/AtpService';

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
      // Use the centralized API service to reset the agent
      AtpService.resetAgent();
    },

    setInitialized(value: boolean) {
      this.initialized = value;
    },

    getAgent() {
      // Use the centralized API service instead of maintaining agent instance here
      return AtpService.getAgent();
    },
  },
});
