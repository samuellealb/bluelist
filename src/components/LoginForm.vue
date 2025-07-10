<!-- eslint-disable vue/html-self-closing -->
<template>
  <form class="login-form" @submit.prevent="validateAndLogin">
    <div class="login-form__group">
      <label for="handle">Bluesky Handle</label>
      <div class="login-form__input-container">
        <input
          id="handle"
          v-model="handle"
          type="text"
          required
          class="login-form__input"
          placeholder="Enter your Bluesky handle (e.g., username.bsky.social)"
          @input="clearError"
          @focus="showHandleHint = true"
          @blur="showHandleHint = false"
        />
        <div v-if="showHandleHint" class="login-form__hint-popup">
          <div class="login-form__hint-box">
            +--- | FORMAT: username.bsky.social | ---+
          </div>
        </div>
      </div>
      <p v-if="handleError" class="login-form__error">
        <span class="login-form__error-prefix">[!]</span> {{ handleError }}
      </p>
    </div>

    <button type="submit" class="login-form__submit" :disabled="isLoading">
      <span v-if="isLoading">Signing In...</span>
      <span v-else>Sign In with OAuth</span>
    </button>

    <p v-if="authStore.loginError" class="login-form__error">
      <span class="login-form__error-prefix">[!]</span>
      {{ authStore.loginError }}
    </p>

    <div class="login-form__info">
      <p>
        <span class="login-form__info-prefix">[i]</span>
        This will redirect you to authenticate with your Bluesky/AtProto
        provider.
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import '~/src/assets/styles/login-form.css';
import { useAuthStore } from '~/src/stores/auth';

defineOptions({
  name: 'LoginForm',
});

const authStore = useAuthStore();
const handle = ref('');
const handleError = ref('');
const showHandleHint = ref(false);
const isLoading = ref(false);

const validateAndLogin = async () => {
  // Basic handle validation
  const trimmedHandle = handle.value.trim();

  if (!trimmedHandle) {
    handleError.value = 'Handle is required';
    return;
  }

  // Allow various handle formats
  const handlePattern = /^[a-zA-Z0-9._-]+(\.[a-zA-Z0-9._-]+)*$/;
  if (!handlePattern.test(trimmedHandle)) {
    handleError.value =
      'Please enter a valid handle (e.g., username.bsky.social)';
    return;
  }

  handleError.value = '';
  isLoading.value = true;

  try {
    await authStore.signInWithHandle(trimmedHandle);
  } catch (error) {
    console.error('Login error:', error);
    isLoading.value = false;
  }
};

const clearError = () => {
  handleError.value = '';
  authStore.setLoginError('');
};
</script>
