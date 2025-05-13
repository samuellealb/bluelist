<template>
  <client-only>
    <Dashboard ref="dashboardRef" default-view="list-members" />
  </client-only>
</template>

<script setup lang="ts">
import Dashboard from '~/src/components/Dashboard.vue';
import * as slugUtils from '~/src/utils/slug-utils';
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from '#app';
import { useListsStore } from '~/src/stores/lists';

defineOptions({
  name: 'ListMembersPage',
});

definePageMeta({
  middleware: ['router'],
});

const route = useRoute();
const router = useRouter();
const dashboardRef = ref<InstanceType<typeof Dashboard> | null>(null);

// Helper function to retry loading view if it fails
const loadViewWithRetry = async (
  viewName: string,
  retries = 3,
  delay = 500
) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await dashboardRef.value?.loadView(viewName);
      return; // Success, exit the function
    } catch (error) {
      console.warn(
        `Attempt ${attempt + 1}/${retries} to load view failed:`,
        error
      );

      if (attempt < retries - 1) {
        // Wait for a bit before retrying (with exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt))
        );
      }
    }
  }
};

const loadView = async () => {
  if (!dashboardRef.value) return;

  const { slug } = route.params;
  if (!slug || typeof slug !== 'string') {
    router.push('/lists');
    return;
  }

  // Get list URI from slug
  const listUri = slugUtils.getUriBySlug(slug);
  if (!listUri) {
    // If slug mapping is not found, check if there's a stored URI in localStorage
    const storedUri = localStorage.getItem('bluelist_current_list_uri');
    if (storedUri) {
      // Create a new mapping for next time
      const listStore = useListsStore();
      const list = listStore.lists.allLists.find(
        (list) => list.uri === storedUri
      );
      if (list) {
        const newSlug = slugUtils.addMapping(storedUri, list.name);
        router.replace({
          path: `/list/${newSlug}/members`,
        });
        return;
      } else {
        // We'll load the stored URI directly this one time
        localStorage.setItem('bluelist_current_list_uri', storedUri);
        // Use the retry mechanism for better reliability
        await loadViewWithRetry('list-members');
      }
    } else {
      // If no mapping and no stored URI, redirect to lists
      router.push('/lists');
    }
    return;
  }

  // Store the URI for legacy components
  localStorage.setItem('bluelist_current_list_uri', listUri);

  // Load the view with retry mechanism
  await nextTick();
  await loadViewWithRetry('list-members');
};

onMounted(() => {
  nextTick(() => {
    loadView();
  });
});

watch(
  () => route.params.slug,
  () => {
    if (dashboardRef.value) {
      loadView();
    }
  }
);
</script>
