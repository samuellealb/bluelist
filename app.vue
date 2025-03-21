<template>
  <div>
    <h1>Bluelist Project</h1>
    <button @click="showMessage">Action</button>
    <div class="result" />
    {{ message }}
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  setup() {
    const message = ref<string>('');

    const showMessage = (): void => {
      message.value = 'Hello World!';
    };

    return {
      message,
      showMessage,
    };
  },
};
</script>
