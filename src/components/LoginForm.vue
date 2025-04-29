<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="login-container">
    <h2 class="login-title">Sign in to Bluelist</h2>

    <div class="login-options">
      <div class="login-option">
        <h3 class="login-option-title">Sign in with Email and Password</h3>
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
        </form>
      </div>

      <div class="login-option">
        <h3 class="login-option-title">Sign in with Bluesky Account</h3>
        <OAuthLoginForm />
      </div>
    </div>

    <p v-if="authStore.loginError" class="login-form__error login-global-error">
      <span class="login-form__error-prefix">[!]</span>
      {{ authStore.loginError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import '~/src/assets/styles/login-form.css';
import { useAuthStore } from '~/src/stores/auth';
import OAuthLoginForm from '~/src/components/OAuthLoginForm.vue';

defineOptions({
  name: 'LoginForm',
});

const authStore = useAuthStore();
const identifier = ref('');
const password = ref('');
const emailError = ref('');
const showEmailHint = ref(false);

const validateAndLogin = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(identifier.value)) {
    emailError.value = 'Please enter a valid email address';
    return;
  }

  emailError.value = '';
  await authStore.loginUser(identifier.value, password.value);
};

const clearError = () => {
  emailError.value = '';
  authStore.setLoginError('');
};
</script>

<style scoped>
.login-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-color);
}

.login-options {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.login-option {
  flex: 1;
  min-width: 300px;
  padding: 1.5rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-option-title {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: var(--text-color);
  text-align: center;
}

.login-global-error {
  margin-top: 1.5rem;
  text-align: center;
}

@media (max-width: 768px) {
  .login-options {
    flex-direction: column;
  }

  .login-option {
    min-width: 100%;
  }
}
</style>
