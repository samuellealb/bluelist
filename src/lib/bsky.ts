import { useAuthStore } from '~/src/stores/auth';
import { useFollowsStore } from '~/src/stores/follows';
import { useListsStore } from '~/src/stores/lists';
import { useUiStore } from '~/src/stores/ui';
import { AtpService } from '~/src/lib/AtpService';
import type {
  DataObject,
  FollowsStore,
  ListsStore,
  BskyAgent,
} from '~/src/types/index';

/**
 * Logs in a user to Bluesky using their credentials
 * @param identifier - Email address of the user
 * @param password - User's password
 * @returns {Promise<void>} - A Promise that resolves when login completes
 * @throws {Error} - Throws when rate limit is exceeded or other login errors occur
 */
export async function loginUser(
  identifier: string,
  password: string
): Promise<void> {
  const authStore = useAuthStore();

  authStore.setLoginError('');
  const agent = AtpService.getAgent();

  try {
    if (!identifier.includes('@')) {
      authStore.setLoginError(
        'Please use your email address to login, not your handle'
      );
      return;
    }

    const { data: loginData, success } = await agent.login({
      identifier,
      password,
    });

    if (success) {
      const { did: userDid, handle } = loginData;
      authStore.setFormInfo(`Logged in as ${handle} with DID ${userDid}`);
      authStore.setDid(userDid);
      authStore.login();

      localStorage.setItem('loginData', JSON.stringify({ loginData }));
    } else {
      authStore.setFormInfo('Login Failed');
    }
  } catch (error) {
    if ((error as Error).message.includes('Rate Limit Exceeded')) {
      authStore.setLoginError(
        'Login failed: Rate limit exceeded. Please use your email address to login.'
      );
    } else {
      authStore.setLoginError(`Login failed: ${(error as Error).message}`);
    }
    console.error('Login error:', error);
  }
}

/**
 * Checks for an existing login session and restores it
 * @returns {Promise<void>} - No return value
 * @throws {Error} - If session data cannot be parsed or is invalid
 */
export async function checkLoginSession(): Promise<void> {
  const authStore = useAuthStore();

  const storedData = localStorage.getItem('loginData');
  if (!storedData) {
    return;
  }

  try {
    const parsedData = JSON.parse(storedData);

    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Invalid session data format');
    }

    if (!parsedData.loginData) {
      throw new Error('Missing login data in stored session');
    }

    const { loginData } = parsedData;

    if (!loginData.did || !loginData.handle || !loginData.accessJwt) {
      throw new Error('Incomplete login data in stored session');
    }

    authStore.setFormInfo(
      `Logged in as ${loginData.handle} with DID ${loginData.did}`
    );
    authStore.setDid(loginData.did);
    authStore.login();

    // Set the auth token using the centralized API Service
    AtpService.setAuthToken(loginData.accessJwt);

    const jwtExpiry = getJwtExpiry(loginData.accessJwt);
    if (jwtExpiry && isTokenExpiringSoon(jwtExpiry)) {
      console.warn(
        'Auth token expiring soon - user may need to re-authenticate'
      );
    }
  } catch (error) {
    console.error('Failed to restore session:', error);

    localStorage.removeItem('loginData');

    authStore.logout();
    authStore.setFormInfo('Session could not be restored. Please login again.');
  }
}

/**
 * Fetches the user's timeline from Bluesky
 * @returns {Promise<{displayData: DataObject, timelineJSON: string}>} - Object containing formatted timeline data and raw JSON
 * @throws {Error} - When user is not logged in, token has expired, or there's an error fetching the feed
 */
export const getTimeline = async (): Promise<{
  displayData: DataObject;
  timelineJSON: string;
}> => {
  const authStore = useAuthStore();
  const uiStore = useUiStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    const agent = AtpService.getAgent();
    const { data } = await agent.getTimeline({
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

    // Instead of separate state updates, perform them in one operation
    uiStore.$patch({
      timelineJSON: jsonData,
      displayData: timelineData as DataObject,
    });

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
 * Fetches the user's lists from Bluesky with pagination and prefetching support
 * @param {number} [page] - Optional page number to fetch (defaults to current page in state)
 * @param {boolean} [refresh=false] - Whether to refresh and start from the first page
 * @param {boolean} [prefetchOnly=false] - If true, only prefetch data without updating display
 * @returns {Promise<{displayData: DataObject, listsJSON: string}>} - Object containing formatted lists data and raw JSON
 * @throws {Error} - When user is not logged in, token has expired, or already fetching data
 */
export const getLists = async (
  page?: number,
  refresh: boolean = false,
  prefetchOnly: boolean = false
): Promise<{
  displayData: DataObject;
  listsJSON: string;
}> => {
  const authStore = useAuthStore();
  const listsStore = useListsStore() as ListsStore;
  const uiStore = useUiStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    if (refresh) {
      listsStore.resetPagination();
      listsStore.setLists([]);
    }

    const requestedPage = page || listsStore.lists.currentPage;
    const maxAvailablePage = Math.max(
      1,
      Math.ceil(
        listsStore.lists.allLists.length / listsStore.lists.itemsPerPage
      )
    );
    const needsMoreData =
      (requestedPage > maxAvailablePage && !!listsStore.lists.cursor) ||
      (refresh && listsStore.lists.allLists.length === 0);

    if (listsStore.lists.isFetching && !refresh) {
      console.info('Already fetching lists data, will wait');
      throw new Error('Already fetching lists data');
    }

    listsStore.setIsFetching(true);

    try {
      const agent = AtpService.getBskyAgent();

      if (listsStore.lists.allLists.length === 0 || refresh) {
        const firstBatch = await fetchListsBatch(null, authStore.did, agent);
        listsStore.setLists(firstBatch.lists);
        listsStore.setPrefetchedPages(1);
        listsStore.setCursor(firstBatch.cursor);
        listsStore.setHasMorePages(!!firstBatch.cursor);
      } else if (needsMoreData) {
        const newBatch = await fetchListsBatch(
          listsStore.lists.cursor,
          authStore.did,
          agent
        );

        if (newBatch.lists.length > 0) {
          listsStore.addLists(newBatch.lists);
          listsStore.setPrefetchedPages(listsStore.lists.prefetchedPages + 1);
          listsStore.setCursor(newBatch.cursor);
          listsStore.setHasMorePages(!!newBatch.cursor);

          const newMaxAvailablePage = Math.ceil(
            listsStore.lists.allLists.length / listsStore.lists.itemsPerPage
          );

          if (requestedPage > newMaxAvailablePage && listsStore.lists.cursor) {
            return await getLists(requestedPage, false, prefetchOnly);
          }
        } else {
          listsStore.setHasMorePages(false);
          listsStore.setCursor(null);
        }
      }

      if (prefetchOnly) {
        const currentPageData = getCurrentListsPageData(
          listsStore.lists.currentPage,
          listsStore
        );
        return {
          displayData: currentPageData.displayData,
          listsJSON: currentPageData.listsJSON,
        };
      }

      const validPage = Math.min(
        requestedPage,
        Math.ceil(
          listsStore.lists.allLists.length / listsStore.lists.itemsPerPage
        )
      );

      if (validPage !== requestedPage) {
        console.log(
          `Requested page ${requestedPage} is out of bounds, using page ${validPage} instead`
        );
      }

      listsStore.setCurrentPage(validPage);

      const pageData = getCurrentListsPageData(validPage, listsStore);

      // Consolidate state updates
      uiStore.setDisplayData(pageData.displayData);
      listsStore.setListsJSON(pageData.listsJSON);

      return pageData;
    } finally {
      listsStore.setIsFetching(false);
    }
  } catch (error) {
    listsStore.setIsFetching(false);
    if ((error as Error).message === 'Token has expired') {
      handleSessionExpired();
    }
    console.error('Error fetching lists:', error);
    throw new Error('Error fetching lists');
  }
};

/**
 * Fetches the user's follows from Bluesky with pagination and prefetching support
 * @param {number} [page] - Optional page number to fetch (defaults to current page in state)
 * @param {boolean} [refresh=false] - Whether to refresh and start from the first page
 * @param {boolean} [prefetchOnly=false] - If true, only prefetch data without updating display
 * @returns {Promise<{displayData: DataObject, usersJSON: string}>} - Object containing formatted follows data and raw JSON
 * @throws {Error} - When user is not logged in, token has expired, or already fetching data
 */
export const getFollows = async (
  page?: number,
  refresh: boolean = false,
  prefetchOnly: boolean = false
): Promise<{
  displayData: DataObject;
  usersJSON: string;
}> => {
  const authStore = useAuthStore();
  const followsStore = useFollowsStore() as FollowsStore;
  const uiStore = useUiStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    if (refresh) {
      followsStore.resetPagination();
      followsStore.setFollows([]);
    }

    const requestedPage = page || followsStore.follows.currentPage;
    const maxAvailablePage = Math.max(
      1,
      Math.ceil(
        followsStore.follows.allFollows.length /
          followsStore.follows.itemsPerPage
      )
    );
    const needsMoreData =
      (requestedPage > maxAvailablePage && !!followsStore.follows.cursor) ||
      (refresh && followsStore.follows.allFollows.length === 0);

    if (followsStore.follows.isFetching && !refresh) {
      console.info('Already fetching follows data, will wait');
      throw new Error('Already fetching follows data');
    }

    followsStore.setIsFetching(true);

    try {
      const agent = AtpService.getBskyAgent();

      if (followsStore.follows.allFollows.length === 0 || refresh) {
        const firstBatch = await fetchFollowsBatch(null, authStore.did, agent);
        followsStore.setFollows(firstBatch.follows);
        followsStore.setPrefetchedPages(1);
        followsStore.setCursor(firstBatch.cursor);
        followsStore.setHasMorePages(!!firstBatch.cursor);
      } else if (needsMoreData) {
        const newBatch = await fetchFollowsBatch(
          followsStore.follows.cursor,
          authStore.did,
          agent
        );

        if (newBatch.follows.length > 0) {
          followsStore.addFollows(newBatch.follows);
          followsStore.setPrefetchedPages(
            followsStore.follows.prefetchedPages + 1
          );
          followsStore.setCursor(newBatch.cursor);
          followsStore.setHasMorePages(!!newBatch.cursor);

          const newMaxAvailablePage = Math.ceil(
            followsStore.follows.allFollows.length /
              followsStore.follows.itemsPerPage
          );

          if (
            requestedPage > newMaxAvailablePage &&
            followsStore.follows.cursor
          ) {
            return await getFollows(requestedPage, false, prefetchOnly);
          }
        } else {
          followsStore.setHasMorePages(false);
          followsStore.setCursor(null);
        }
      }

      if (prefetchOnly) {
        const currentPageData = getCurrentFollowsPageData(
          followsStore.follows.currentPage,
          followsStore
        );
        return {
          displayData: currentPageData.displayData,
          usersJSON: currentPageData.usersJSON,
        };
      }

      const validPage = Math.min(
        requestedPage,
        Math.ceil(
          followsStore.follows.allFollows.length /
            followsStore.follows.itemsPerPage
        )
      );

      if (validPage !== requestedPage) {
        console.log(
          `Requested page ${requestedPage} is out of bounds, using page ${validPage} instead`
        );
      }

      followsStore.setCurrentPage(validPage);

      const pageData = getCurrentFollowsPageData(validPage, followsStore);

      // Consolidate state updates
      uiStore.setDisplayData(pageData.displayData);
      followsStore.setUsersJSON(pageData.usersJSON);

      return pageData;
    } finally {
      followsStore.setIsFetching(false);
    }
  } catch (error) {
    followsStore.setIsFetching(false);
    if ((error as Error).message === 'Token has expired') {
      handleSessionExpired();
    }
    console.error('Error fetching follows:', error);
    throw new Error('Error fetching follows');
  }
};

/**
 * Helper function to fetch a single batch of follows from the API
 * @param {string|null} cursor - Optional cursor for pagination
 * @param {string} did - User's DID
 * @param {BskyAgent} agent - The API agent
 * @returns {Promise<{follows: Array, cursor: string|null}>} - Object containing follows data and next cursor
 * @throws {Error} - When API request fails
 */
const fetchFollowsBatch = async (
  cursor: string | null,
  did: string,
  agent: BskyAgent
) => {
  const apiParams: { actor: string; limit: number; cursor?: string } = {
    actor: did,
    limit: 20,
  };

  if (cursor) {
    apiParams.cursor = cursor;
  }

  const { data } = await agent.app.bsky.graph.getFollows(apiParams);

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
 * @param {number} page - The page number to get
 * @param {FollowsStore} followsStore - The follows store
 * @returns {Object} - Object containing formatted follows data and JSON for the requested page
 * @returns {DataObject} - displayData Formatted follows data
 * @returns {string} - usersJSON JSON string representation of the formatted data
 */
const getCurrentFollowsPageData = (
  page: number,
  followsStore: FollowsStore
) => {
  const startIndex = (page - 1) * followsStore.follows.itemsPerPage;
  const endIndex = startIndex + followsStore.follows.itemsPerPage;
  const pageFollows = followsStore.follows.allFollows.slice(
    startIndex,
    endIndex
  );

  const followsData = {
    type: 'follows',
    data: pageFollows,
    pagination: {
      currentPage: page,
      hasMorePages:
        followsStore.follows.hasMorePages ||
        endIndex < followsStore.follows.allFollows.length,
      totalPages:
        Math.ceil(
          followsStore.follows.allFollows.length /
            followsStore.follows.itemsPerPage
        ) + (followsStore.follows.hasMorePages ? 1 : 0),
      totalPrefetched: followsStore.follows.allFollows.length,
    },
  };

  const jsonData = JSON.stringify(followsData);

  return {
    displayData: followsData as DataObject,
    usersJSON: jsonData,
  };
};

/**
 * Helper function to fetch a single batch of lists from the API
 * @param {string|null} cursor - Optional cursor for pagination
 * @param {string} did - User's DID
 * @param {BskyAgent} agent - The API agent
 * @returns {Promise<{lists: Array, cursor: string|null}>} - Object containing lists data and next cursor
 * @throws {Error} - When API request fails
 */
const fetchListsBatch = async (
  cursor: string | null,
  did: string,
  agent: BskyAgent
) => {
  const apiParams: { actor: string; limit: number; cursor?: string } = {
    actor: did,
    limit: 50,
  };

  if (cursor) {
    apiParams.cursor = cursor;
  }

  const { data } = await agent.app.bsky.graph.getLists(apiParams);

  const lists = data.lists.map((list) => ({
    name: list.name,
    uri: list.uri,
    description: list.description,
  }));

  return {
    lists,
    cursor: data.cursor || null,
  };
};

/**
 * Get the data for the current page from the prefetched lists
 * @param {number} page - The page number to get
 * @param {ListsStore} listsStore - The lists store
 * @returns {Object} - Object containing formatted lists data and JSON for the requested page
 * @returns {DataObject} - displayData Formatted lists data
 * @returns {string} - listsJSON JSON string representation of the formatted data
 */
const getCurrentListsPageData = (page: number, listsStore: ListsStore) => {
  const startIndex = (page - 1) * listsStore.lists.itemsPerPage;
  const endIndex = startIndex + listsStore.lists.itemsPerPage;
  const pageLists = listsStore.lists.allLists.slice(startIndex, endIndex);

  const prefetchedPages = Math.ceil(
    listsStore.lists.allLists.length / listsStore.lists.itemsPerPage
  );
  listsStore.setPrefetchedPages(prefetchedPages);

  const listsData = {
    type: 'lists',
    data: pageLists,
    pagination: {
      currentPage: page,
      hasMorePages:
        listsStore.lists.hasMorePages ||
        endIndex < listsStore.lists.allLists.length,
      totalPages:
        Math.ceil(
          listsStore.lists.allLists.length / listsStore.lists.itemsPerPage
        ) + (listsStore.lists.hasMorePages ? 1 : 0),
      totalPrefetched: listsStore.lists.allLists.length,
    },
  };

  const jsonData = JSON.stringify(listsData);

  return {
    displayData: listsData as DataObject,
    listsJSON: jsonData,
  };
};

/**
 * Helper function to handle expired sessions
 * @returns {void} - No return value
 */
const handleSessionExpired = (): void => {
  const authStore = useAuthStore();

  authStore.setFormInfo('Session expired. Please login again.');
  localStorage.removeItem('loginData');
  window.location.reload();
};

/**
 * Adds a user to a specified list
 * @param {string} userDid - The DID of the user to add
 * @param {string} listUri - The URI of the list to add the user to
 * @returns {Promise<string>} - A success message if the operation succeeds
 * @throws {Error} - When user is not logged in, session expired, or API request fails
 */
export const addUserToList = async (
  userDid: string,
  listUri: string
): Promise<string> => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    const agent = AtpService.getAgent();
    const { data } = await agent.app.bsky.graph.getList({
      list: listUri,
      limit: 100,
    });

    const isUserAlreadyInList = data.items.some(
      (item) => item.subject.did === userDid
    );

    if (isUserAlreadyInList) {
      return 'User is already in this list';
    }

    await agent.com.atproto.repo.createRecord({
      repo: authStore.did,
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
 * @param {Array<{profileDid: string, lists: Array<{uri: string, name: string}>}>} usersToLists - Array of objects containing user DIDs and lists to add them to
 * @returns {Promise<Array<{profileDid: string, listUri: string, listName: string, success: boolean, message: string}>>} - An array of results for each operation
 * @throws {Error} - When user is not logged in
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
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
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
        const agent = AtpService.getAgent();
        const { data } = await agent.app.bsky.graph.getList({
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

        await agent.com.atproto.repo.createRecord({
          repo: authStore.did,
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

/**
 * Helper function to decode JWT and extract expiry time
 * @param {string} jwt - The JWT token
 * @returns {number|null} - Timestamp of token expiry or null if invalid
 */
function getJwtExpiry(jwt: string): number | null {
  try {
    const base64Url = jwt.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload = decodeBase64(base64);

    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Helper function to decode base64 safely
 * @param {string} str - The base64 string to decode
 * @returns {string} - The decoded string
 */
function decodeBase64(str: string): string {
  try {
    if (typeof window !== 'undefined' && window.atob) {
      return decodeURIComponent(
        window
          .atob(str)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'base64').toString('utf-8');
    } else {
      const binaryString = atob(str);
      return decodeURIComponent(
        binaryString
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
}

/**
 * Check if token is expiring within the next 5 minutes
 * @param {number} expiryTime - Token expiry timestamp
 * @returns {boolean} - True if token expires soon
 */
function isTokenExpiringSoon(expiryTime: number): boolean {
  const fiveMinutesInMs = 5 * 60 * 1000;
  return Date.now() + fiveMinutesInMs > expiryTime;
}
