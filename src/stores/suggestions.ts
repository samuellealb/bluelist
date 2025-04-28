import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import type { RequestCounts } from '~/src/types/index';

const MAX_DAILY_SUGGESTIONS = 5;

const isLimitOverridden = async () => {
  const authStore = useAuthStore();
  if (authStore.did) {
    try {
      const response = await fetch('/api/exemptUsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ did: authStore.did }),
      });

      const data = await response.json();
      if (data.isExempt) {
        return true;
      }
    } catch (error) {
      console.error('Failed to check exemption status:', error);
      throw new Error('Failed to check exemption status');
    }
  }
};

export const useSuggestionsStore = defineStore('suggestions', {
  state: () => ({
    isProcessingSuggestions: false,
    requestCounts: {} as RequestCounts,
    suggestionsJSON: '',
  }),

  actions: {
    setIsProcessing(isProcessing: boolean) {
      this.isProcessingSuggestions = isProcessing;
    },

    setSuggestionsJSON(json: string) {
      this.suggestionsJSON = json;
    },

    loadRequestCounts() {
      const authStore = useAuthStore();
      if (!authStore.did) return;

      try {
        const storedData = localStorage.getItem(
          `suggestionRequests_${authStore.did}`
        );
        if (storedData) {
          this.requestCounts = JSON.parse(storedData);
        }
      } catch (error) {
        console.error('Failed to load suggestion request data:', error);
        this.requestCounts = {};
      }
    },

    saveRequestCounts() {
      const authStore = useAuthStore();
      if (!authStore.did) return;

      try {
        localStorage.setItem(
          `suggestionRequests_${authStore.did}`,
          JSON.stringify(this.requestCounts)
        );
      } catch (error) {
        console.error('Failed to save suggestion request data:', error);
      }
    },

    async trackRequest() {
      const authStore = useAuthStore();
      if (!authStore.did) return;

      const overridden = await isLimitOverridden();
      if (overridden) return;

      const today = new Date().toISOString().split('T')[0];

      if (!this.requestCounts[today]) {
        this.requestCounts[today] = 0;
      }

      this.requestCounts[today]++;
      this.saveRequestCounts();
    },

    async hasReachedLimit(): Promise<boolean> {
      const overridden = await isLimitOverridden();
      if (overridden) return false;

      const authStore = useAuthStore();
      if (!authStore.did) return false;

      const today = new Date().toISOString().split('T')[0];
      return (this.requestCounts[today] || 0) >= MAX_DAILY_SUGGESTIONS;
    },

    async getRemainingRequests(): Promise<number> {
      const overridden = await isLimitOverridden();
      if (overridden) return 999;

      const authStore = useAuthStore();
      if (!authStore.did) return MAX_DAILY_SUGGESTIONS;

      const today = new Date().toISOString().split('T')[0];
      const used = this.requestCounts[today] || 0;
      return Math.max(0, MAX_DAILY_SUGGESTIONS - used);
    },

    resetCounts() {
      this.requestCounts = {};
      this.saveRequestCounts();
    },
  },
});
