<template>
  <div>
    <!-- This template won't be shown as we'll redirect immediately -->
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

onMounted(() => {
  router.push('/');
});
</script>
