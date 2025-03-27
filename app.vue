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
    <button @click="fetchLists(true)">Get Lists</button>
    <button @click="fetchFollows(true)">Get Follows</button>
    <button @click="curateLists">Curate Lists</button>
    <div class="data-display" v-html="displayData" />
  </div>
</template>

<script lang="ts">
import { AtpAgent } from '@atproto/api';
import { ref, onMounted } from 'vue';
import { callListCurator } from './src/lib/openai';
import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import type { ListView } from '@atproto/api/dist/client/types/app/bsky/graph/defs';
import type { GraphEntity } from './src/types';

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
    const lists = ref<GraphEntity[]>([]);
    const follows = ref<GraphEntity[]>([]);

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

    const fetchLists = async (display: boolean): Promise<void> => {
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
          description: list.description || '',
        }));
        lists.value = formattedLists;
        if (display) {
          displayData.value = `Lists: ${JSON.stringify(
            formattedLists,
            null,
            2
          )}`;
        }
      } catch (error) {
        displayData.value = `Failed to get lists: ${(error as Error).message}`;
      }
    };

    const fetchFollows = async (display: boolean) => {
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
          name: follow.displayName || '',
          description: follow.description || '',
        }));
        follows.value = formattedFollows;
        if (display) {
          displayData.value = `Follows: ${JSON.stringify(
            formattedFollows,
            null,
            2
          )}`;
        }
      } catch (error) {
        displayData.value = `Failed to get follows: ${
          (error as Error).message
        }`;
      }
    };

    const curateLists = async () => {
      if (!agent.value) {
        displayData.value = 'Agent not created';
        return;
      }
      await fetchFollows(false);
      await fetchLists(false);
      if (!follows.value.length || !lists.value.length) {
        displayData.value = 'No follows or lists to curate';
        return;
      }
      displayData.value = 'Generating...';
      try {
        const sanitizedFollows = follows.value.map((follow) => ({ ...follow }));
        const sanitizedLists = lists.value.map((list) => ({ ...list }));
        const followsString = JSON.stringify(sanitizedFollows, null, 2);
        const listsString = JSON.stringify(sanitizedLists, null, 2);
        const response = await callListCurator(followsString, listsString);
        const responseString = JSON.stringify(response, null, 2);
        const responseHtml = responseString
          .replace(/\*\*(\s|\\n)/g, '</strong>$1')
          .replace(/\*\*(\w)/g, '<strong>$1')
          .replace(/\\n/g, '<br>');
        displayData.value = `Curated Lists: <br> ${responseHtml}`;
      } catch (error) {
        displayData.value = `Failed to curate lists: ${
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
      fetchLists,
      fetchFollows,
      curateLists,
      displayData,
    };
  },
};
</script>
