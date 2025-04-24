<!-- eslint-disable vue/html-self-closing -->
<template>
  <form class="login-form" @submit.prevent="validateAndLogin">
    <div class="login-form__group">
      <label for="username">Email Address</label>
      <div class="login-form__input-container">
        <input
          id="username"
          v-model="identifier"
          type="email"
          required
          class="login-form__input"
          placeholder="Enter your email address"
          @input="clearError"
          @focus="showEmailHint = true"
          @blur="showEmailHint = false"
        />
        <div v-if="showEmailHint" class="login-form__hint-popup">
          <div class="login-form__hint-box">
            +--- | FORMAT: user@mail | ---+
          </div>
        </div>
      </div>
      <p v-if="emailError" class="login-form__error">
        <span class="login-form__error-prefix">[!]</span> {{ emailError }}
      </p>
    </div>

    <div class="login-form__group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        class="login-form__input"
        placeholder="Enter your password"
      />
    </div>

    <button type="submit" class="login-form__submit">Sign In</button>
    <p v-if="state.loginError" class="login-form__error">
      <span class="login-form__error-prefix">[!]</span> {{ state.loginError }}
    </p>
  </form>
</template>

<script setup lang="ts">
import '~/src/assets/styles/login-form.css';
import { state } from '~/src/store';
import { loginUser } from '~/src/lib/bsky';

defineOptions({
  name: 'LoginForm',
});

const identifier = ref('');
const password = ref('');
const emailError = ref('');
const showEmailHint = ref(false);

const validateAndLogin = async () => {
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(identifier.value)) {
    emailError.value = 'Please enter a valid email address';
    return;
  }

  emailError.value = '';
  await loginUser(identifier.value, password.value);
};

const clearError = () => {
  emailError.value = '';
  state.loginError = '';
};
</script>
