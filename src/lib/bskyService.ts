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
      authStore.handleSessionExpired();
    }
    console.error('Error fetching timeline:', error);
    throw new Error('Error fetching feed');
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
      authStore.handleSessionExpired();
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
      authStore.handleSessionExpired();
    }
    console.error('Error fetching lists:', error);
    throw new Error('Error fetching lists');
  }
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
      authStore.handleSessionExpired();
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
          authStore.handleSessionExpired();
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
 * Creates a new list
 * @param {string} name - The name of the list
 * @param {string} description - The description of the list
 * @returns {Promise<{uri: string, success: boolean, message: string}>} - Object containing the URI of the created list and a success message
 * @throws {Error} - When user is not logged in, session expired, or API request fails
 */
export const createList = async (
  name: string,
  description: string
): Promise<{ uri: string; success: boolean; message: string }> => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    const agent = AtpService.getAgent();
    const result = await agent.com.atproto.repo.createRecord({
      repo: authStore.did,
      collection: 'app.bsky.graph.list',
      record: {
        $type: 'app.bsky.graph.list',
        purpose: 'app.bsky.graph.defs#curatelist',
        name,
        description,
        createdAt: new Date().toISOString(),
      },
    });

    return {
      uri: result.data.uri,
      success: true,
      message: 'List created successfully',
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      authStore.handleSessionExpired();
    }

    console.error('Error creating list:', error);
    throw new Error(`Failed to create list: ${(error as Error).message}`);
  }
};

/**
 * Updates an existing list
 * @param {string} uri - The URI of the list to update
 * @param {string} name - The new name of the list
 * @param {string} description - The new description of the list
 * @returns {Promise<{success: boolean, message: string}>} - Object containing a success flag and message
 * @throws {Error} - When user is not logged in, session expired, or API request fails
 */
export const updateList = async (
  uri: string,
  name: string,
  description: string
): Promise<{ success: boolean; message: string }> => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    // Extract record ID from URI
    const parts = uri.split('/');
    const rkey = parts[parts.length - 1];

    const agent = AtpService.getAgent();
    await agent.com.atproto.repo.putRecord({
      repo: authStore.did,
      collection: 'app.bsky.graph.list',
      rkey,
      record: {
        $type: 'app.bsky.graph.list',
        purpose: 'app.bsky.graph.defs#curatelist',
        name,
        description,
        createdAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: 'List updated successfully',
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      authStore.handleSessionExpired();
    }

    console.error('Error updating list:', error);
    throw new Error(`Failed to update list: ${(error as Error).message}`);
  }
};

/**
 * Deletes a list
 * @param {string} uri - The URI of the list to delete
 * @returns {Promise<{success: boolean, message: string}>} - Object containing a success flag and message
 * @throws {Error} - When user is not logged in, session expired, or API request fails
 */
export const deleteList = async (
  uri: string
): Promise<{ success: boolean; message: string }> => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    // Extract record ID from URI
    const parts = uri.split('/');
    const rkey = parts[parts.length - 1];

    const agent = AtpService.getAgent();
    await agent.com.atproto.repo.deleteRecord({
      repo: authStore.did,
      collection: 'app.bsky.graph.list',
      rkey,
    });

    return {
      success: true,
      message: 'List deleted successfully',
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      authStore.handleSessionExpired();
    }

    console.error('Error deleting list:', error);
    throw new Error(`Failed to delete list: ${(error as Error).message}`);
  }
};
