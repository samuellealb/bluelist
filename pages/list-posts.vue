<template>
  <client-only>
    <Dashboard ref="dashboardRef" default-view="list-posts" />
  </client-only>
</template>

<script setup lang="ts">
import Dashboard from '~/src/components/Dashboard.vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'ListPostsPage',
});

definePageMeta({
  middleware: ['router'],
});

const route = useRoute();
const router = useRouter();
const dashboardRef = ref<InstanceType<typeof Dashboard> | null>(null);

onMounted(() => {
  // Wait for the route query to be available and dashboard component to be mounted
  nextTick(() => {
    // Try to get URI from route query first
    let listUri = route.query.uri as string;

    // If not available in route, try to get from localStorage as fallback
    if (!listUri) {
      listUri = localStorage.getItem('bluelist_current_list_uri') || '';
    }

    if (listUri && dashboardRef.value) {
      // If the URI isn't in the route params but we got it from localStorage,
      // update the route to include it for consistency
      if (!route.query.uri && listUri) {
        router.replace({
          path: '/list-posts',
          query: { uri: listUri },
        });
      }

      // Pass the list URI to load the view
      dashboardRef.value.loadView('list-posts', true);
    } else if (dashboardRef.value) {
      // If no URI is present, redirect to lists view
      router.push('/lists');
    }
  });
});

// Watch for route changes to handle navigating between different lists
watch(
  () => route.query.uri,
  (newUri) => {
    if (newUri && dashboardRef.value) {
      // Update localStorage when navigating to a new list
      localStorage.setItem('bluelist_current_list_uri', newUri as string);
      dashboardRef.value.loadView('list-posts', true);
    }
  }
);
</script>
