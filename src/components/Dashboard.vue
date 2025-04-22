<template>
  <div>
    <div v-if="!state.isLoggedIn" class="login-section">
      <div class="card">
        <h2>Login</h2>
        <LoginForm />
      </div>
    </div>

    <div v-else class="dashboard">
      <div class="actions-panel card">
        <h2>Actions</h2>
        <ButtonsPanel ref="buttonsPanelRef" />
      </div>

      <div class="data-panel card">
        <DataDisplay :data="state.displayData" @refresh="handleRefresh" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from '~/src/components/LoginForm.vue';
import ButtonsPanel from '~/src/components/ButtonsPanel.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import { state } from '~/src/store';

defineOptions({
  name: 'UserDashboard',
});

const buttonsPanelRef = ref<InstanceType<typeof ButtonsPanel> | null>(null);

const handleRefresh = async (type: string) => {
  if (!buttonsPanelRef.value) return;

  switch (type) {
    case 'timeline':
      await buttonsPanelRef.value.displayFeed(true);
      break;
    case 'lists':
      await buttonsPanelRef.value.displayLists(true);
      break;
    case 'follows':
      await buttonsPanelRef.value.displayFollows(true);
      break;
    case 'suggestions':
      await buttonsPanelRef.value.displaySuggestions(true);
      break;
    default:
      console.error('Unknown data type for refresh:', type);
  }
};
</script>
