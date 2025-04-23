<template>
  <div>
    <div v-if="!state.isLoggedIn" class="dashboard-login">
      <div class="dashboard-login__card">
        <h2>Login [_]</h2>
        <LoginForm />
      </div>
    </div>

    <div v-else class="dashboard">
      <div class="dashboard__actions-panel">
        <h2>Actions [/]</h2>
        <ButtonsPanel ref="buttonsPanelRef" />
      </div>

      <div class="dashboard__data-panel">
        <DataDisplay :data="state.displayData" @refresh="handleRefresh" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/src/components/LoginForm.vue';
import ButtonsPanel from '~/src/components/ButtonsPanel.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import { state } from '~/src/store';
import '~/src/assets/styles/dashboard.css';

defineOptions({
  name: 'UserDashboard',
});

const buttonsPanelRef = ref<InstanceType<typeof ButtonsPanel> | null>(null);

const handleRefresh = async (type: string, page?: number) => {
  if (!buttonsPanelRef.value) return;

  switch (type) {
    case 'timeline':
      await buttonsPanelRef.value.displayFeed(true);
      break;
    case 'lists': {
      const forceRefresh = page === undefined;
      await buttonsPanelRef.value.displayLists(forceRefresh, page);
      break;
    }
    case 'follows': {
      const forceRefresh = page === undefined;
      await buttonsPanelRef.value.displayFollows(forceRefresh, page);
      break;
    }
    case 'suggestions':
      await buttonsPanelRef.value.displaySuggestions(true);
      break;
    default:
      console.error('Unknown data type for refresh:', type);
  }
};
</script>
