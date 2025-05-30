import { defineStore } from 'pinia';
import type { DataObject } from '~/src/types/index';

export const useUiStore = defineStore('ui', {
  state: () => ({
    displayData: null as DataObject | null,
    timelineJSON: '',
  }),

  actions: {
    setDisplayData(data: DataObject | null) {
      this.displayData = data;
    },

    setTimelineJSON(json: string) {
      this.timelineJSON = json;
    },
  },
});
