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
const dashboardRef = ref<InstanceType<typeof Dashboard> | null>(null);

const loadView = async () => {
  await nextTick();

  if (!dashboardRef.value) return;

  const route = useRoute();
  let listUri = route.query.uri as string;

  if (!listUri) {
    listUri = localStorage.getItem('bluelist_current_list_uri') || '';
  }

  if (listUri) {
    if (route.query.uri !== listUri) {
      const router = useRouter();
      router.replace({ query: { uri: listUri } });
    }

    dashboardRef.value.loadView('list-posts');
  } else {
    const router = useRouter();
    router.push('/lists');
  }
};

onMounted(() => {
  nextTick(() => loadView());
});

watch(
  () => route.query.uri,
  (newUri) => {
    if (newUri && dashboardRef.value) {
      localStorage.setItem('bluelist_current_list_uri', newUri as string);
      dashboardRef.value.loadView('list-posts', true);
    }
  }
);
</script>
