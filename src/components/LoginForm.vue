<!-- eslint-disable vue/html-self-closing -->
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
      />
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

defineEmits<{
  (e: 'login'): void;
}>();

const identifier = ref('');
const password = ref('');
</script>
