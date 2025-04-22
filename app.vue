<template>
  <div class="app-container">
    <header class="header">
      <h1>Bluelist</h1>
      <div v-if="state.formInfo.includes('Logged in')" class="user-status">
        <span class="status-dot online" />
        {{ state.formInfo.substring(0, state.formInfo.indexOf('with')) }}
      </div>
    </header>

    <div class="main-content">
      <div v-if="!state.formInfo.includes('Logged in')" class="login-section">
        <div class="card">
          <h2>Login</h2>
          <LoginForm />
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
          <DataDisplay :data="displayData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { state, checkLoginSession } from '~/src/store';
import { callListCurator } from '~/src/lib/openai';
import LoginForm from '~/src/components/LoginForm.vue';
import ActionButtons from '~/src/components/ActionButtons.vue';
import DataDisplay from '~/src/components/DataDisplay.vue';
import '~/src/assets/styles/app.css';

defineOptions({
  name: 'BlueList',
});

const displayData = ref('');
const usersJSON = ref('');
const listsJSON = ref('');

onMounted(() => {
  checkLoginSession();
});

const displayFeed = async () => {
  if (!state.agent) {
    state.formInfo = 'Please login first';
    return;
  }

  try {
    displayData.value = 'loading';

    const { data } = await state.agent.getTimeline({
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

const fetchLists = async () => {
  if (!state.agent) {
    state.formInfo = 'Please login first';
    return;
  }

  try {
    displayData.value = 'loading';
    const { data } = await state.agent.app.bsky.graph.getLists({
      actor: state.did,
      limit: 50,
    });

    const lists = data.lists.map((list) => ({
      name: list.name,
      uri: list.uri,
      description: list.description,
    }));

    const listsData = {
      type: 'lists',
      data: lists,
    };

    listsJSON.value = JSON.stringify(listsData);
    displayData.value = `<h2>Your Lists</h2><pre>${JSON.stringify(
      listsData,
      null,
      2
    )}</pre>`;
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      state.formInfo = 'Session expired. Please login again.';
      localStorage.removeItem('loginData');
      window.location.reload();
      return;
    }
    displayData.value = 'Error fetching lists';
    console.error(error);
  }
};

const fetchFollows = async () => {
  if (!state.agent) {
    state.formInfo = 'Please login first';
    return;
  }

  try {
    displayData.value = 'loading';
    const follows = [];
    let cursor = undefined;

    do {
      const { data } = await state.agent.app.bsky.graph.getFollows({
        actor: state.did,
        limit: 20,
        cursor: cursor,
      });

      for (const follow of data.follows) {
        follows.push({
          did: follow.did,
          handle: follow.handle,
          name: follow.displayName,
          description: follow.description,
        });
      }

      cursor = data.cursor;
    } while (cursor && follows.length < 20);

    const followsData = {
      type: 'follows',
      data: follows,
    };

    usersJSON.value = JSON.stringify(followsData);
    displayData.value = `<h2>Your Follows (${
      follows.length
    })</h2><pre>${JSON.stringify(followsData, null, 2)}</pre>`;
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      state.formInfo = 'Session expired. Please login again.';
      localStorage.removeItem('loginData');
      window.location.reload();
      return;
    }

    displayData.value = 'Error fetching follows';
    console.error(error);
  }
};

const curateLists = async () => {
  if (!usersJSON.value || !listsJSON.value) {
    displayData.value = 'Please fetch your follows and lists before curating';
    return;
  }

  try {
    displayData.value = 'loading';

    const followsData = JSON.parse(usersJSON.value);
    const listsData = JSON.parse(listsJSON.value);

    const simplifiedUsers = followsData.data.map(
      (user: { handle: string; name?: string; description?: string }) => ({
        name: user.name || user.handle,
        description: user.description || '',
      })
    );

    const simplifiedLists = listsData.data.map(
      (list: { name: string; description: string }) => ({
        name: list.name,
        description: list.description || '',
      })
    );

    const response = await callListCurator(
      JSON.stringify(simplifiedUsers),
      JSON.stringify(simplifiedLists)
    );
    let parsedResponse = JSON.parse(response);
    if (parsedResponse.error) {
      throw new Error(parsedResponse.error);
    }
    parsedResponse = { type: 'suggestions', ...parsedResponse };
    displayData.value = `<h2>Your Lists</h2><pre>${JSON.stringify(
      parsedResponse,
      null,
      2
    )}</pre>`;
  } catch (error) {
    console.log('Error in curateLists:', error);
    displayData.value = (error as Error).message;
  }
};
</script>
