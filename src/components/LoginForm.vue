<!-- eslint-disable vue/html-self-closing -->
<template>
  <form class="login-form" @submit.prevent="validateAndLogin">
    <div class="form-group">
      <label for="username">Email Address</label>
      <input
        id="username"
        v-model="identifier"
        type="email"
        required
        class="form-input"
        placeholder="Enter your email address"
        @input="clearError"
      />
      <p v-if="emailError" class="error-text">{{ emailError }}</p>
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        class="form-input"
        placeholder="Enter your password"
      />
    </div>

    <button type="submit" class="btn-primary">Sign In</button>
  </form>
</template>

<script setup lang="ts">
import '~/src/assets/styles/login-form.css';

defineOptions({
  name: 'LoginForm',
});

const emit = defineEmits<{
  (e: 'login'): void;
}>();

const identifier = ref('');
const password = ref('');
const emailError = ref('');

const validateAndLogin = () => {
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(identifier.value)) {
    emailError.value = 'Please enter a valid email address';
    return;
  }

  emailError.value = '';
  emit('login');
};

const clearError = () => {
  emailError.value = '';
};
</script>
