<template>
  <div>
    <h1>Bluelist Project</h1>
    <form @submit.prevent="loginUser">
      <label for="username">Username:</label>
      <input id="username" v-model="identifier" type="text" required >

      <label for="password">Password:</label>
      <input id="password" v-model="password" type="password" required >

      <button @click="loginUser">Login</button>
    </form>
    <div class="form-info">{{ formInfo }}</div>
  </div>
</template>

<script lang="ts">
import { AtpAgent } from '@atproto/api';
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const config = useRuntimeConfig();
    const agent = ref<AtpAgent | undefined>(undefined);
    const identifier = ref<string>('');
    const password = ref<string>('');
    const formInfo = ref<string>('');

    const loginUser = async (): Promise<void> => {
      if (!agent.value) {
        formInfo.value = 'Agent not created';
        return;
      }
      const { data: loginData } = await agent.value.login({
        identifier: identifier.value || '',
        password: password.value || '',
      });
      const { did, handle, email } = loginData;
      formInfo.value = `Logged in as ${did} with handle ${handle} and email ${email}`;
    };

    const createAtpAgent = (): void => {
      const service = config.public.atpService || '';
      agent.value = new AtpAgent({
        service,
      });
    };

    onMounted(() => {
      createAtpAgent();
    });

    return {
      identifier,
      password,
      loginUser,
      formInfo,
    };
  },
};
</script>
