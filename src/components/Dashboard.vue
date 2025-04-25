<template>
  <div v-if="!state.isLoggedIn" class="dashboard-login">
    <div class="dashboard-login__card">
      <h2>Login [_]</h2>
      <LoginForm />
    </div>
  </div>

  <div v-else class="dashboard">
    <div class="dashboard__actions-panel">
      <ButtonsPanel ref="buttonsPanelRef" />
    </div>

    <div class="dashboard__data-panel">
      <DataDisplay :data="state.displayData" @refresh="handleRefresh" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import LoginForm from '~/src/components/LoginForm.vue';
import ButtonsPanel from '~/src/components/ButtonsPanel.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import { state } from '~/src/store';
import '~/src/assets/styles/dashboard.css';

defineOptions({
  name: 'UserDashboard',
});

const props = defineProps({
  defaultView: {
    type: String,
    default: 'lists',
    validator: (value: string) => ['lists', 'follows', 'feed'].includes(value),
  },
});

const buttonsPanelRef = ref<InstanceType<typeof ButtonsPanel> | null>(null);
const justLoggedInKey = 'bluelist_just_logged_in';

const loadView = async (viewType: string, forceRefresh = false) => {
  await nextTick();

  if (state.isLoggedIn && buttonsPanelRef.value) {
    switch (viewType) {
      case 'lists':
        buttonsPanelRef.value.displayLists(forceRefresh);
        break;
      case 'follows':
        buttonsPanelRef.value.displayFollows(forceRefresh);
        break;
      case 'feed':
        buttonsPanelRef.value.displayFeed(forceRefresh);
        break;
      default:
        buttonsPanelRef.value.displayLists(forceRefresh);
    }
  }
};

onMounted(() => {
  const justLoggedIn = localStorage.getItem(justLoggedInKey) === 'true';
  const shouldForceRefresh = justLoggedIn && props.defaultView === 'lists';

  if (justLoggedIn) {
    localStorage.removeItem(justLoggedInKey);
  }

  loadView(props.defaultView, shouldForceRefresh);
});

watch(
  () => state.isLoggedIn,
  (isLoggedIn, wasLoggedIn) => {
    if (isLoggedIn && !wasLoggedIn) {
      localStorage.setItem(justLoggedInKey, 'true');
    } else if (!isLoggedIn && wasLoggedIn) {
      localStorage.removeItem(justLoggedInKey);
    }
  }
);

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
    default:
      console.error('Unknown data type for refresh:', type);
  }
};

defineExpose({
  buttonsPanelRef,
  loadView,
});
</script>
