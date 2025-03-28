<template>
  <div class="app-container">
    <header class="header">
      <h1>Bluelist</h1>
      <div v-if="formInfo.includes('Logged in')" class="user-status">
        <span class="status-dot online" />
        {{ formInfo.substring(0, formInfo.indexOf('with')) }}
      </div>
    </header>

    <div class="main-content">
      <div v-if="!formInfo.includes('Logged in')" class="login-section">
        <div class="card">
          <h2>Login</h2>
          <LoginForm :form-info="formInfo" @login="loginUser" />
        </div>
      </div>

      <div v-else class="dashboard">
        <div class="actions-panel card">
          <h2>Actions</h2>
          <ActionButtons
            @display-feed="displayFeed"
            @fetch-lists="fetchLists"
            @fetch-follows="fetchFollows"
            @curate-lists="curateLists"
          />
        </div>

        <div class="data-panel card">
          <div v-if="displayData === 'Generating...'" class="loading-indicator">
            <div class="spinner" />
            <span>Processing data...</span>
          </div>
          <DataDisplay :data="displayData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { AtpAgent } from '@atproto/api';
import { callListCurator } from '~/src/lib/openai';
import LoginForm from '~/src/components/LoginForm.vue';
import ActionButtons from '~/src/components/ActionButtons.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import '~/src/assets/styles/app.css';

export default {
  components: {
    LoginForm,
    ActionButtons,
    DataDisplay,
  },
  setup() {
    const formInfo = ref('');
    const displayData = ref('');
    const usersJSON = ref('');
    const listsJSON = ref('');
    const agent = ref<AtpAgent | null>(
      new AtpAgent({
        service: 'https://bsky.social',
      })
    );
    const did = ref('');

    // Restore session from localStorage if available
    onMounted(() => {
      checkLoginSession();
    });

    const checkLoginSession = (): void => {
      const storedData = localStorage.getItem('loginData');
      if (storedData) {
        try {
          const { loginData } = JSON.parse(storedData);
          formInfo.value = `Logged in as ${loginData.handle} with DID ${loginData.did}`;
          did.value = loginData.did;

          // Create agent with stored session data
          agent.value = new AtpAgent({
            service: 'https://bsky.social',
          });

          // Set the session in the agent - use the actual API method
          agent.value.api.setHeader(
            'Authorization',
            `Bearer ${loginData.accessJwt}`
          );
        } catch (error) {
          console.error('Failed to parse session data:', error);
          localStorage.removeItem('loginData');
        }
      }
    };

    const loginUser = async (): Promise<void> => {
      if (!agent.value) {
        formInfo.value = 'Agent not created';
        return;
      }

      try {
        const identifier = (
          document.getElementById('username') as HTMLInputElement
        ).value;
        const password = (
          document.getElementById('password') as HTMLInputElement
        ).value;

        const { data: loginData, success } = await agent.value.login({
          identifier,
          password,
        });

        if (success) {
          const { did: userDid, handle, email } = loginData;
          formInfo.value = `Logged in as ${handle} with DID ${userDid} with email ${email}`;
          did.value = userDid;

          // Store login data in localStorage
          localStorage.setItem('loginData', JSON.stringify({ loginData }));
        } else {
          formInfo.value = 'Login Failed';
        }
      } catch (error) {
        formInfo.value = `Login failed: ${(error as Error).message}`;
        console.error('Login error:', error);
      }
    };

    const fetchLists = async () => {
      if (!agent.value) {
        formInfo.value = 'Please login first';
        return;
      }

      try {
        const { data } = await agent.value.app.bsky.graph.getLists({
          actor: did.value,
          limit: 50,
        });

        const lists = data.lists.map((list) => ({
          name: list.name,
          uri: list.uri,
        }));

        listsJSON.value = JSON.stringify(lists);
        displayData.value = `<h2>Your Lists</h2><pre>${JSON.stringify(
          lists,
          null,
          2
        )}</pre>`;
      } catch (error) {
        if ((error as Error).message === 'Token has expired') {
          formInfo.value = 'Session expired. Please login again.';
          localStorage.removeItem('loginData');
          window.location.reload();
          return;
        }
        displayData.value = 'Error fetching lists';
        console.error(error);
      }
    };

    const fetchFollows = async () => {
      if (!agent.value) {
        formInfo.value = 'Please login first';
        return;
      }

      try {
        const follows = [];
        let cursor = undefined;

        // Fetch with pagination
        do {
          const { data } = await agent.value.app.bsky.graph.getFollows({
            actor: did.value,
            limit: 20,
            cursor: cursor,
          });

          for (const follow of data.follows) {
            follows.push({
              did: follow.did,
              handle: follow.handle,
              displayName: follow.displayName,
              description: follow.description,
            });
          }

          cursor = data.cursor;
        } while (cursor && follows.length < 20);

        usersJSON.value = JSON.stringify(follows);
        displayData.value = `<h2>Your Follows (${
          follows.length
        })</h2><pre>${JSON.stringify(follows, null, 2)}</pre>`;
      } catch (error) {
        if ((error as Error).message === 'Token has expired') {
          formInfo.value = 'Session expired. Please login again.';
          localStorage.removeItem('loginData');
          window.location.reload();
          return;
        }

        displayData.value = 'Error fetching follows';
        console.error(error);
      }
    };

    const displayFeed = async () => {
      if (!agent.value) {
        formInfo.value = 'Please login first';
        return;
      }

      try {
        const { data } = await agent.value.getTimeline({
          limit: 30,
        });

        displayData.value = `<h2>Your Timeline</h2><pre>${JSON.stringify(
          data.feed,
          null,
          2
        )}</pre>`;
      } catch (error) {
        displayData.value = 'Error fetching feed';
        console.error(error);
      }
    };

    const curateLists = async () => {
      if (!usersJSON.value || !listsJSON.value) {
        displayData.value =
          'Please fetch your follows and lists before curating';
        return;
      }

      try {
        displayData.value = 'Generating...';

        // Parse original data
        const follows = JSON.parse(usersJSON.value);
        const lists = JSON.parse(listsJSON.value);

        // Simplify the user data to reduce token count
        const simplifiedUsers = follows.map(
          (user: {
            handle: string;
            displayName?: string;
            description?: string;
          }) => ({
            handle: user.handle,
            displayName: user.displayName || user.handle,
            description: user.description?.substring(0, 20) || '', // Limit description length
          })
        );

        // Only send essential list data
        const simplifiedLists = lists.map((list: { name: string }) => ({
          name: list.name,
        }));

        // Limit the number of users if too many
        const limitedUsers = simplifiedUsers.slice(0, 20); // Limit to 20 users max

        const response = await callListCurator(
          JSON.stringify(limitedUsers),
          JSON.stringify(simplifiedLists)
        );
        displayData.value = response ?? 'No data available';
      } catch (error) {
        console.error('Error in curateLists:', error);
        displayData.value =
          'Error curating lists: Token limit exceeded. Try fetching fewer follows or creating a more focused list.';
      }
    };

    return {
      formInfo,
      displayData,
      loginUser,
      fetchLists,
      fetchFollows,
      displayFeed,
      curateLists,
    };
  },
};
</script>
