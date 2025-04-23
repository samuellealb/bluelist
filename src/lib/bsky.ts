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
 * Fetches the user's follows from Bluesky with pagination and prefetching support
 * @param page Optional page number to fetch (defaults to current page in state)
 * @param refresh Whether to refresh and start from the first page
 * @param prefetchOnly If true, only prefetch data without updating display
 * @returns Formatted follows data and raw JSON
 */
export const getFollows = async (
  page?: number,
  refresh: boolean = false,
  prefetchOnly: boolean = false
): Promise<{
  displayData: DataObject;
  usersJSON: string;
}> => {
  if (!state.agent) {
    throw new Error('Please login first');
  }

  try {
    if (refresh) {
      state.follows.currentPage = 1;
      state.follows.cursor = null;
      state.follows.allFollows = [];
      state.follows.prefetchedPages = 0;
    }

    const requestedPage = page || state.follows.currentPage;
    const maxAvailablePage = Math.max(
      1,
      Math.ceil(state.follows.allFollows.length / state.follows.itemsPerPage)
    );
    const needsMoreData =
      requestedPage > maxAvailablePage && !!state.follows.cursor;

    if (state.follows.isFetching) {
      console.info('Already fetching follows data, will wait');
      throw new Error('Already fetching follows data');
    }

    state.follows.isFetching = true;

    try {
      if (state.follows.allFollows.length === 0) {
        const firstBatch = await fetchFollowsBatch(null);
        state.follows.allFollows.push(...firstBatch.follows);
        state.follows.prefetchedPages = 1;
        state.follows.cursor = firstBatch.cursor;
        state.follows.hasMorePages = !!firstBatch.cursor;
      } else if (needsMoreData) {
        const newBatch = await fetchFollowsBatch(state.follows.cursor);

        if (newBatch.follows.length > 0) {
          state.follows.allFollows.push(...newBatch.follows);
          state.follows.prefetchedPages++;
          state.follows.cursor = newBatch.cursor;
          state.follows.hasMorePages = !!newBatch.cursor;

          const newMaxAvailablePage = Math.ceil(
            state.follows.allFollows.length / state.follows.itemsPerPage
          );

          if (requestedPage > newMaxAvailablePage && state.follows.cursor) {
            return await getFollows(requestedPage, false, prefetchOnly);
          }
        } else {
          state.follows.hasMorePages = false;
          state.follows.cursor = null;
        }
      }

      if (prefetchOnly) {
        const currentPageData = getCurrentPageData(state.follows.currentPage);
        return {
          displayData: currentPageData.displayData,
          usersJSON: currentPageData.usersJSON,
        };
      }

      const validPage = Math.min(
        requestedPage,
        Math.ceil(state.follows.allFollows.length / state.follows.itemsPerPage)
      );

      if (validPage !== requestedPage) {
        console.log(
          `Requested page ${requestedPage} is out of bounds, using page ${validPage} instead`
        );
      }

      state.follows.currentPage = validPage;

      const pageData = getCurrentPageData(validPage);

      return pageData;
    } finally {
      state.follows.isFetching = false;
    }
  } catch (error) {
    state.follows.isFetching = false;
    if ((error as Error).message === 'Token has expired') {
      handleSessionExpired();
    }
    console.error('Error fetching follows:', error);
    throw new Error('Error fetching follows');
  }
};

/**
 * Helper function to fetch a single batch of follows from the API
 * @param cursor Optional cursor for pagination
 * @returns Object containing follows data and next cursor
 */
const fetchFollowsBatch = async (cursor: string | null) => {
  const apiParams: { actor: string; limit: number; cursor?: string } = {
    actor: state.did,
    limit: state.follows.itemsPerPage,
  };

  if (cursor) {
    apiParams.cursor = cursor;
  }

  const { data } = await state.agent.app.bsky.graph.getFollows(apiParams);

  const follows = data.follows.map((follow) => ({
    did: follow.did,
    handle: follow.handle,
    name: follow.displayName,
    description: follow.description,
  }));

  return {
    follows,
    cursor: data.cursor || null,
  };
};

/**
 * Get the data for the current page from the prefetched follows
 * @param page The page number to get
 * @returns Formatted follows data and JSON for the requested page
 */
const getCurrentPageData = (page: number) => {
  const startIndex = (page - 1) * state.follows.itemsPerPage;
  const endIndex = startIndex + state.follows.itemsPerPage;
  const pageFollows = state.follows.allFollows.slice(startIndex, endIndex);

  const followsData = {
    type: 'follows',
    data: pageFollows,
    pagination: {
      currentPage: page,
      hasMorePages:
        state.follows.hasMorePages ||
        endIndex < state.follows.allFollows.length,
      totalPages:
        Math.ceil(
          state.follows.allFollows.length / state.follows.itemsPerPage
        ) + (state.follows.hasMorePages ? 1 : 0),
      totalPrefetched: state.follows.allFollows.length,
    },
  };

  const jsonData = JSON.stringify(followsData);

  return {
    displayData: followsData as DataObject,
    usersJSON: jsonData,
  };
};

/**
 * Helper function to handle expired sessions
 */
const handleSessionExpired = (): void => {
  state.formInfo = 'Session expired. Please login again.';
  localStorage.removeItem('loginData');
  window.location.reload();
};

/**
 * Adds a user to a specified list
 * @param userDid The DID of the user to add
 * @param listUri The URI of the list to add the user to
 * @returns A success message if the operation succeeds
 */
export const addUserToList = async (
  userDid: string,
  listUri: string
): Promise<string> => {
  if (!state.agent) {
    throw new Error('Please login first');
  }

  try {
    const { data } = await state.agent.app.bsky.graph.getList({
      list: listUri,
      limit: 100,
    });

    const isUserAlreadyInList = data.items.some(
      (item) => item.subject.did === userDid
    );

    if (isUserAlreadyInList) {
      return 'User is already in this list';
    }

    await state.agent.com.atproto.repo.createRecord({
      repo: state.did,
      collection: 'app.bsky.graph.listitem',
      record: {
        $type: 'app.bsky.graph.listitem',
        subject: userDid,
        list: listUri,
        createdAt: new Date().toISOString(),
      },
    });

    return 'User successfully added to list';
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      handleSessionExpired();
    }

    console.error('Error adding user to list:', error);
    throw new Error(`Failed to add to list: ${(error as Error).message}`);
  }
};

/**
 * Adds multiple users to their respective lists in batch
 * @param usersToLists Array of objects containing a user DID and the lists they should be added to
 * @returns An array of results for each operation
 */
export const addUsersToLists = async (
  usersToLists: Array<{
    profileDid: string;
    lists: Array<{ uri: string; name: string }>;
  }>
): Promise<
  Array<{
    profileDid: string;
    listUri: string;
    listName: string;
    success: boolean;
    message: string;
  }>
> => {
  if (!state.agent) {
    throw new Error('Please login first');
  }

  const results: Array<{
    profileDid: string;
    listUri: string;
    listName: string;
    success: boolean;
    message: string;
  }> = [];

  for (const user of usersToLists) {
    const { profileDid, lists } = user;

    for (const list of lists) {
      try {
        const { data } = await state.agent.app.bsky.graph.getList({
          list: list.uri,
          limit: 100,
        });

        const isUserAlreadyInList = data.items.some(
          (item) => item.subject.did === profileDid
        );

        if (isUserAlreadyInList) {
          results.push({
            profileDid,
            listUri: list.uri,
            listName: list.name,
            success: true,
            message: 'User is already in this list',
          });
          continue;
        }

        await state.agent.com.atproto.repo.createRecord({
          repo: state.did,
          collection: 'app.bsky.graph.listitem',
          record: {
            $type: 'app.bsky.graph.listitem',
            subject: profileDid,
            list: list.uri,
            createdAt: new Date().toISOString(),
          },
        });

        results.push({
          profileDid,
          listUri: list.uri,
          listName: list.name,
          success: true,
          message: 'User successfully added to list',
        });
      } catch (error) {
        if ((error as Error).message === 'Token has expired') {
          handleSessionExpired();
        }

        results.push({
          profileDid,
          listUri: list.uri,
          listName: list.name,
          success: false,
          message: `Failed to add to list: ${(error as Error).message}`,
        });

        console.error('Error adding user to list:', error);
      }
    }
  }

  return results;
};
