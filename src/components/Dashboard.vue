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
        <ButtonsPanel />
      </div>

      <div class="data-panel card">
        <DataDisplay :data="state.displayData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/src/components/LoginForm.vue';
import ButtonsPanel from '~/src/components/ButtonsPanel.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import { state } from '~/src/store';

defineOptions({
  name: 'UserDashboard',
});
</script>
