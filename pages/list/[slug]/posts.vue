<template>
  <client-only>
    <Dashboard ref="dashboardRef" default-view="list-posts" />
  </client-only>
</template>

<script setup lang="ts">
import Dashboard from '~/src/components/Dashboard.vue';
import * as slugUtils from '~/src/utils/slug-utils';
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from '#app';
import { useListsStore } from '~/src/stores/lists';

defineOptions({
  name: 'ListPostsPage',
});

definePageMeta({
  middleware: ['router'],
});

const route = useRoute();
const router = useRouter();
const dashboardRef = ref<InstanceType<typeof Dashboard> | null>(null);

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
          path: `/list/${newSlug}/posts`,
        });
        return;
      } else {
        // We'll load the stored URI directly this one time
        localStorage.setItem('bluelist_current_list_uri', storedUri);
        dashboardRef.value.loadView('list-posts');
      }
    } else {
      // If no mapping and no stored URI, redirect to lists
      router.push('/lists');
    }
    return;
  }

  // Store the URI for legacy components
  localStorage.setItem('bluelist_current_list_uri', listUri);

  // Load the view
  await nextTick();
  dashboardRef.value.loadView('list-posts');
};

onMounted(() => {
  nextTick(() => loadView());
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
