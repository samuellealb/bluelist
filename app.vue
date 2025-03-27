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
    <button @click="displayFeed">Display Feed</button>
    <button @click="displayLists">Display Lists</button>
    <button @click="displayFollows">Display Follows</button>
    <div class="data-display">{{ displayData }}</div>
  </div>
</template>

<script lang="ts">
import { AtpAgent } from '@atproto/api';
import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import type { ListView } from '@atproto/api/dist/client/types/app/bsky/graph/defs';
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const config = useRuntimeConfig();
    const agent = ref<AtpAgent | undefined>(undefined);
    const identifier = ref<string>('');
    const password = ref<string>('');
    const formInfo = ref<string>('');
    const userDid = ref<string>('');
    const displayData = ref<string>('');
    const accessJwt = ref<string>('');

    const createAtpAgent = (): void => {
      const service = config.public.atpService || '';
      agent.value = new AtpAgent({
        service,
      });
    };

    const checkLoginSession = (): void => {
      const storedData = localStorage.getItem('loginData');
      if (storedData) {
        const { loginData, expirationTime } = JSON.parse(storedData);
        if (new Date().getTime() < expirationTime) {
          formInfo.value = `Logged in as ${loginData.did} with handle ${loginData.handle} and email ${loginData.email}`;
          accessJwt.value = loginData.accessJwt;
          userDid.value = loginData.did;
        } else {
          localStorage.removeItem('loginData');
          formInfo.value = 'Session expired. Please log in again.';
        }
      }
    };

    const loginUser = async (): Promise<void> => {
      if (!agent.value) {
        formInfo.value = 'Agent not created';
        return;
      }
      try {
        const { data: loginData } = await agent.value.login({
          identifier: identifier.value || '',
          password: password.value || '',
        });
        const { did, handle, email, accessJwt: token } = loginData;
        formInfo.value = `Logged in as ${did} with handle ${handle} and email ${email}`;
        accessJwt.value = token;
        userDid.value = did;

        const expirationTime = new Date().getTime() + 30 * 60 * 1000;
        localStorage.setItem(
          'loginData',
          JSON.stringify({ loginData, expirationTime })
        );
      } catch (error) {
        formInfo.value = `Login failed: ${(error as Error).message}`;
      }
    };

    const displayFeed = async (): Promise<void> => {
      if (!agent.value) {
        displayData.value = 'Agent not created';
        return;
      }
      try {
        const { data } = await agent.value.getTimeline(
          { limit: 3 },
          {
            headers: {
              Authorization: `Bearer ${accessJwt.value}`,
            },
          }
        );
        const { feed: postsArray } = data;
        displayData.value = `Feed: ${JSON.stringify(postsArray, null, 2)}`;
      } catch (error) {
        displayData.value = `Failed to get feed: ${(error as Error).message}`;
      }
    };

    const displayLists = async (): Promise<void> => {
      if (!agent.value) {
        displayData.value = 'Agent not created';
        return;
      }
      try {
        const { data } = await agent.value.app.bsky.graph.getLists(
          { actor: userDid.value, limit: 15 },
          {
            headers: {
              Authorization: `Bearer ${accessJwt.value}`,
            },
          }
        );
        const { lists: listsArray } = data;
        const formattedLists = listsArray.map((list: ListView) => ({
          name: list.name,
          description: list.description,
        }));
        displayData.value = `Lists: ${JSON.stringify(formattedLists, null, 2)}`;
      } catch (error) {
        displayData.value = `Failed to get lists: ${(error as Error).message}`;
      }
    };

    const displayFollows = async () => {
      if (!agent.value) {
        displayData.value = 'Agent not created';
        return;
      }

      try {
        const { data } = await agent.value.app.bsky.graph.getFollows(
          { actor: userDid.value, limit: 15 },
          {
            headers: {
              Authorization: `Bearer ${accessJwt.value}`,
            },
          }
        );
        const { follows: followsArray } = data;
        const formattedFollows = followsArray.map((follow: ProfileView) => ({
          name: follow.displayName,
          description: follow.description,
        }));
        displayData.value = `Follows: ${JSON.stringify(
          formattedFollows,
          null,
          2
        )}`;
      } catch (error) {
        displayData.value = `Failed to get follows: ${
          (error as Error).message
        }`;
      }
    };

    onMounted(() => {
      createAtpAgent();
      checkLoginSession();
    });

    return {
      identifier,
      password,
      loginUser,
      formInfo,
      displayFeed,
      displayLists,
      displayFollows,
      displayData,
    };
  },
};
</script>
