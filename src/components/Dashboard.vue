<template>
  <div v-if="!authStore.isLoggedIn" class="dashboard-login">
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
      <DataDisplay :data="uiStore.displayData" @refresh="handleRefresh" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { useAuthStore } from '~/src/stores/auth';
import { useUiStore } from '~/src/stores/ui';
import LoginForm from '~/src/components/LoginForm.vue';
import ButtonsPanel from '~/src/components/ButtonsPanel.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import { useRouter, useRoute } from '#app';
import * as slugUtils from '~/src/utils/slug-utils';
import '~/src/assets/styles/dashboard.css';

defineOptions({
  name: 'UserDashboard',
});

const authStore = useAuthStore();
const uiStore = useUiStore();

const props = defineProps({
  defaultView: {
    type: String,
    default: 'lists',
    validator: (value: string) =>
      ['lists', 'follows', 'feed', 'list-posts', 'list-members'].includes(
        value
      ),
  },
});

const buttonsPanelRef = ref<InstanceType<typeof ButtonsPanel> | null>(null);
const justLoggedInKey = 'bluelist_just_logged_in';

const loadView = async (viewType: string, forceRefresh = false) => {
  await nextTick();

  if (!authStore.isLoggedIn || !buttonsPanelRef.value) return;

  const router = useRouter();
  const route = useRoute();

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
    case 'list-posts':
    case 'list-members': {
      try {
        // First import the fetchListDetails function
        const { fetchListDetails } = await import('~/src/lib/bskyService');

        // Check if we're using the new routing structure
        if (route.params.slug && typeof route.params.slug === 'string') {
          const listUri = slugUtils.getUriBySlug(route.params.slug);
          if (listUri) {
            // We have a valid URI from the slug, use it
            localStorage.setItem('bluelist_current_list_uri', listUri);

            // Fetch list details first to ensure the title is ready
            try {
              await fetchListDetails(listUri);
            } catch (err) {
              console.warn('Error pre-fetching list details:', err);
              // Continue even if fetch fails
            }

            if (viewType === 'list-posts') {
              await buttonsPanelRef.value.displayListPosts(listUri);
            } else {
              await buttonsPanelRef.value.displayListMembers(
                listUri,
                forceRefresh
              );
            }
            return;
          }
        }

        // Fall back to legacy approach (query parameters or localStorage)
        let listUri = route.query.uri as string;

        if (!listUri) {
          listUri = localStorage.getItem('bluelist_current_list_uri') || '';
        }

        if (listUri) {
          // Fetch list details first to ensure the title is ready
          try {
            await fetchListDetails(listUri);
          } catch (err) {
            console.warn('Error pre-fetching list details:', err);
            // Continue even if fetch fails
          }

          if (viewType === 'list-posts') {
            await buttonsPanelRef.value.displayListPosts(listUri);
          } else {
            await buttonsPanelRef.value.displayListMembers(
              listUri,
              forceRefresh
            );
          }
        } else {
          console.warn(
            `No list URI provided for ${viewType} view, redirecting to lists`
          );
          router.push('/lists');
        }
      } catch (error) {
        console.error(`Error loading ${viewType} view:`, error);
        // If there's an error, we'll try again once after a short delay
        setTimeout(() => {
          loadView(viewType, forceRefresh);
        }, 1000);
      }
      break;
    }
    default:
      buttonsPanelRef.value.displayLists(forceRefresh);
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
  () => authStore.isLoggedIn,
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

  const route = useRoute();
  const forceRefresh = page === undefined;

  switch (type) {
    case 'timeline':
      await buttonsPanelRef.value.displayFeed(true);
      break;
    case 'lists':
      await buttonsPanelRef.value.displayLists(forceRefresh, page);
      break;
    case 'follows':
      await buttonsPanelRef.value.displayFollows(forceRefresh, page);
      break;
    case 'list-posts':
    case 'list-members': {
      // Check if we're using the new routing structure
      let listUri: string | undefined;

      if (route.params.slug && typeof route.params.slug === 'string') {
        listUri = slugUtils.getUriBySlug(route.params.slug);
      }

      // Fall back to query parameter or localStorage if needed
      if (!listUri) {
        listUri =
          (route.query.uri as string) ||
          localStorage.getItem('bluelist_current_list_uri') ||
          undefined;
      }

      if (listUri) {
        if (type === 'list-posts') {
          await buttonsPanelRef.value.displayListPosts(listUri, true);
        } else {
          await buttonsPanelRef.value.displayListMembers(
            listUri,
            forceRefresh,
            page
          );
        }
      }
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
