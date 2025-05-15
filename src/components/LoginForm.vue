<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="login-container">
    <div class="login-tabs">
      <button
        :class="['login-tab', { active: loginMethod === 'password' }]"
        @click="loginMethod = 'password'"
      >
        Email & Password
      </button>
      <button
        :class="['login-tab', { active: loginMethod === 'oauth' }]"
        @click="loginMethod = 'oauth'"
      >
        OAuth Login
      </button>
    </div>

    <form
      v-if="loginMethod === 'password'"
      class="login-form"
      @submit.prevent="validateAndLogin"
    >
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
    </form>

    <form v-else class="login-form" @submit.prevent="handleOAuthLogin">
      <div class="login-form__group">
        <label for="handle">Bluesky Handle (Optional)</label>
        <div class="login-form__input-container">
          <input
            id="handle"
            v-model="handle"
            type="text"
            class="login-form__input"
            placeholder="Enter your handle (e.g. username.bsky.social)"
            @input="clearError"
          />
        </div>
      </div>

      <button type="submit" class="login-form__submit">
        Continue with Bluesky
      </button>
    </form>

    <p v-if="authStore.loginError" class="login-form__error">
      <span class="login-form__error-prefix">[!]</span>
      {{ authStore.loginError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/login-form.css';
import { useAuthStore } from '~/src/stores/auth';
import { OAuthService } from '~/src/lib/OAuthService';

defineOptions({
  name: 'LoginForm',
});

const authStore = useAuthStore();
const identifier = ref('');
const password = ref('');
const emailError = ref('');
const showEmailHint = ref(false);
const loginMethod = ref<'password' | 'oauth'>('password');
const handle = ref('');

const validateAndLogin = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(identifier.value)) {
    emailError.value = 'Please enter a valid email address';
    return;
  }

  emailError.value = '';
  await authStore.loginUser(identifier.value, password.value);
};

const handleOAuthLogin = async () => {
  // Redirect to Bluesky OAuth login page
  // If handle is provided, it will be pre-filled
  OAuthService.redirectToAuthPage(handle.value);
};

const clearError = () => {
  emailError.value = '';
  authStore.setLoginError('');
};
</script>

<style scoped>
.login-container {
  width: 100%;
}

.login-tabs {
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.login-tab {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.login-tab:hover {
  opacity: 0.9;
}

.login-tab.active {
  border-bottom: 2px solid var(--primary-color);
  opacity: 1;
}
</style>
