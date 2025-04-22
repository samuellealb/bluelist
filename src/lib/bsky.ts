import { state } from '~/src/store';

/**
 * Fetches the user's timeline from Bluesky
 * @returns HTML formatted timeline data
 */
export const getTimeline = async (): Promise<string> => {
  if (!state.agent) {
    throw new Error('Please login first');
  }

  try {
    const { data } = await state.agent.getTimeline({
      limit: 30,
    });

    return `<h2>Your Timeline</h2><pre>${JSON.stringify(
      data.feed,
      null,
      2
    )}</pre>`;
  } catch (error) {
    console.error('Error fetching timeline:', error);
    throw new Error('Error fetching feed');
  }
};

/**
 * Fetches the user's lists from Bluesky
 * @returns Formatted lists data and raw JSON
 */
export const getLists = async (): Promise<{
  displayData: string;
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
    const displayData = `<h2>Your Lists</h2><pre>${JSON.stringify(
      listsData,
      null,
      2
    )}</pre>`;

    return { displayData, listsJSON: jsonData };
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
  displayData: string;
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
    const displayData = `<h2>Your Follows (${
      follows.length
    })</h2><pre>${JSON.stringify(followsData, null, 2)}</pre>`;

    return { displayData, usersJSON: jsonData };
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
