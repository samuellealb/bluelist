import { state } from '~/src/store';
import { AtpAgent } from '@atproto/api';
import type { DataObject } from '~/src/types';

/**
 * Logs in a user to Bluesky using their credentials
 * @param identifier Email address of the user
 * @param password User's password
 */
export async function loginUser(
  identifier: string,
  password: string
): Promise<void> {
  state.loginError = '';
  if (!state.agent) {
    state.formInfo = 'Agent not created';
    return;
  }

  try {
    if (!identifier.includes('@')) {
      state.loginError =
        'Please use your email address to login, not your handle';
      return;
    }

    const { data: loginData, success } = await state.agent.login({
      identifier,
      password,
    });

    if (success) {
      const { did: userDid, handle } = loginData;
      state.formInfo = `Logged in as ${handle} with DID ${userDid}`;
      state.did = userDid;
      state.isLoggedIn = true;

      localStorage.setItem('loginData', JSON.stringify({ loginData }));
    } else {
      state.formInfo = 'Login Failed';
    }
  } catch (error) {
    if ((error as Error).message.includes('Rate Limit Exceeded')) {
      state.loginError =
        'Login failed: Rate limit exceeded. Please use your email address to login.';
    } else {
      state.loginError = `Login failed: ${(error as Error).message}`;
    }
    console.error('Login error:', error);
  }
}

/**
 * Checks for an existing login session and restores it
 */
export function checkLoginSession(): void {
  const storedData = localStorage.getItem('loginData');
  if (storedData) {
    try {
      const { loginData } = JSON.parse(storedData);
      state.formInfo = `Logged in as ${loginData.handle} with DID ${loginData.did}`;
      state.did = loginData.did;
      state.isLoggedIn = true;

      state.agent = new AtpAgent({
        service: 'https://bsky.social',
      });

      state.agent.api.setHeader(
        'Authorization',
        `Bearer ${loginData.accessJwt}`
      );
    } catch (error) {
      console.error('Failed to parse session data:', error);
      localStorage.removeItem('loginData');
    }
  }
}

/**
 * Fetches the user's timeline from Bluesky
 * @returns Formatted timeline data and raw JSON
 */
export const getTimeline = async (): Promise<{
  displayData: DataObject;
  timelineJSON: string;
}> => {
  if (!state.agent) {
    throw new Error('Please login first');
  }

  try {
    const { data } = await state.agent.getTimeline({
      limit: 30,
    });

    const timeline = data.feed.map((item) => ({
      uri: item.post.uri,
      cid: item.post.cid,
      author: {
        did: item.post.author.did,
        handle: item.post.author.handle,
        name: item.post.author.displayName,
      },
      text: item.post.record.text,
      indexedAt: item.post.indexedAt,
    }));

    const timelineData = {
      type: 'timeline',
      data: timeline,
    };

    const jsonData = JSON.stringify(timelineData);

    return {
      displayData: timelineData as DataObject,
      timelineJSON: jsonData,
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      handleSessionExpired();
    }
    console.error('Error fetching timeline:', error);
    throw new Error('Error fetching feed');
  }
};

/**
 * Fetches the user's lists from Bluesky
 * @returns Formatted lists data and raw JSON
 */
export const getLists = async (): Promise<{
  displayData: DataObject;
  listsJSON: string;
}> => {
  if (!state.agent) {
    throw new Error('Please login first');
  }

  try {
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

    const jsonData = JSON.stringify(listsData);

    return {
      displayData: listsData as DataObject,
      listsJSON: jsonData,
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      handleSessionExpired();
    }
    console.error('Error fetching lists:', error);
    throw new Error('Error fetching lists');
  }
};

/**
 * Fetches the user's follows from Bluesky
 * @returns Formatted follows data and raw JSON
 */
export const getFollows = async (): Promise<{
  displayData: DataObject;
  usersJSON: string;
}> => {
  if (!state.agent) {
    throw new Error('Please login first');
  }

  try {
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

    const jsonData = JSON.stringify(followsData);

    return {
      displayData: followsData as DataObject,
      usersJSON: jsonData,
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      handleSessionExpired();
    }
    console.error('Error fetching follows:', error);
    throw new Error('Error fetching follows');
  }
};

/**
 * Helper function to handle expired sessions
 */
const handleSessionExpired = (): void => {
  state.formInfo = 'Session expired. Please login again.';
  localStorage.removeItem('loginData');
  window.location.reload();
};
