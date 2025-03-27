<template>
  <form class="login-form" @submit.prevent="$emit('login')">
    <div class="form-group">
      <label for="username">Username</label>
      <input
        id="username"
        v-model="identifier"
        type="text"
        required
        class="form-input"
        placeholder="Enter your username"
      >
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
      >
    </div>

    <button type="submit" class="btn-primary">Sign In</button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    formInfo: {
      type: String,
      required: true,
    },
  },
  emits: ['login'],
  setup() {
    const identifier = ref('');
    const password = ref('');

    return {
      identifier,
      password,
    };
  },
});
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-input::placeholder {
  color: #bbb;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.4);
}
</style>
