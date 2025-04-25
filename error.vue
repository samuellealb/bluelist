<template>
  <div class="error-page">
    <h1>{{ errorTitle }}</h1>
    <div class="error-details">
      <p>{{ errorMessage }}</p>
    </div>
    <button class="error-button" @click="goBack">Go Back</button>
  </div>
</template>

<script setup>
import '~/src/assets/styles/error-page.css';

const errorTitle = useState('errorTitle', () => 'An error occurred');
const errorMessage = useState(
  'errorMessage',
  () => 'Something went wrong. Please try again.'
);

onMounted(() => {
  const nuxtApp = useNuxtApp();

  if (nuxtApp.payload && nuxtApp.payload.error) {
    const statusCode = nuxtApp.payload.error.statusCode;
    if (statusCode === 404) {
      errorTitle.value = 'Page not found';
    }

    if (nuxtApp.payload.error.message) {
      errorMessage.value = nuxtApp.payload.error.message;
    }
  }
});

function goBack() {
  clearError();
  navigateTo('/');
}
</script>
