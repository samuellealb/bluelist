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
  ListMemberItem,
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
 * Fetches posts from a specific list
 * @param {string} listUri - The URI of the list to fetch posts from
 * @param {number} [limit=30] - The number of posts to fetch
 * @returns {Promise<{displayData: DataObject, listPostsJSON: string}>} - Object containing formatted list posts data and raw JSON
 * @throws {Error} - When user is not logged in, token has expired, or there's an error fetching the list posts
 */
export const getListPosts = async (
  listUri: string,
  limit: number = 30
): Promise<{
  displayData: DataObject;
  listPostsJSON: string;
}> => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    const agent = AtpService.getAgent();
    const { data } = await agent.app.bsky.feed.getListFeed({
      list: listUri,
      limit,
    });

    const posts = data.feed.map((item) => ({
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

    // Get list details for title
    const listDetails = await agent.app.bsky.graph.getList({
      list: listUri,
      limit: 1,
    });

    const listPostsData = {
      type: 'list-posts',
      data: posts,
      listInfo: {
        name: listDetails.data.list.name,
        description: listDetails.data.list.description,
        uri: listUri,
      },
    };

    const jsonData = JSON.stringify(listPostsData);

    return {
      displayData: listPostsData as DataObject,
      listPostsJSON: jsonData,
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      authStore.handleSessionExpired();
    }
    console.error('Error fetching list posts:', error);
    throw new Error('Error fetching list posts');
  }
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
  const listsStore = useListsStore() as ListsStore;

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

    // Set dirty flag after successful operation
    listsStore.setMembersCacheDirty(true);

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
  const listsStore = useListsStore() as ListsStore;

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

        // Mark the members cache as dirty when a user is successfully added
        listsStore.setMembersCacheDirty(true);
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

/**
 * Removes a user from a list
 * @param {string} itemUri - The URI of the list item to remove
 * @returns {Promise<{success: boolean, message: string}>} - Object containing a success flag and message
 * @throws {Error} - When user is not logged in, token has expired, or API request fails
 */
export const removeUserFromList = async (
  itemUri: string
): Promise<{ success: boolean; message: string }> => {
  const authStore = useAuthStore();
  const listsStore = useListsStore() as ListsStore;

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    const parts = itemUri.split('/');
    const rkey = parts[parts.length - 1];

    const agent = AtpService.getAgent();
    await agent.com.atproto.repo.deleteRecord({
      repo: authStore.did,
      collection: 'app.bsky.graph.listitem',
      rkey,
    });

    // Set dirty flag after successful removal
    listsStore.setMembersCacheDirty(true);

    return {
      success: true,
      message: 'User successfully removed from list',
    };
  } catch (error) {
    if ((error as Error).message === 'Token has expired') {
      authStore.handleSessionExpired();
    }

    console.error('Error removing user from list:', error);
    throw new Error(`Failed to remove from list: ${(error as Error).message}`);
  }
};

/**
 * Removes multiple users from a list in batch
 * @param {Array<string>} itemUris - Array of list item URIs to remove
 * @returns {Promise<Array<{itemUri: string, success: boolean, message: string}>>} - An array of results for each operation
 * @throws {Error} - When user is not logged in
 */
export const removeUsersFromList = async (
  itemUris: Array<string>
): Promise<
  Array<{
    itemUri: string;
    success: boolean;
    message: string;
  }>
> => {
  const authStore = useAuthStore();
  const listsStore = useListsStore() as ListsStore;

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  const results: Array<{
    itemUri: string;
    success: boolean;
    message: string;
  }> = [];

  for (const itemUri of itemUris) {
    try {
      const parts = itemUri.split('/');
      const rkey = parts[parts.length - 1];

      const agent = AtpService.getAgent();
      await agent.com.atproto.repo.deleteRecord({
        repo: authStore.did,
        collection: 'app.bsky.graph.listitem',
        rkey,
      });

      results.push({
        itemUri,
        success: true,
        message: 'User successfully removed from list',
      });

      // Mark the members cache as dirty if at least one removal succeeded
      listsStore.setMembersCacheDirty(true);
    } catch (error) {
      if ((error as Error).message === 'Token has expired') {
        authStore.handleSessionExpired();
      }

      results.push({
        itemUri,
        success: false,
        message: `Failed to remove from list: ${(error as Error).message}`,
      });

      console.error('Error removing user from list:', error);
    }
  }

  return results;
};

/**
 * Fetches all members (profiles) from a specified list with pagination support
 * @param {string} listUri - The URI of the list to fetch members from
 * @param {number} [page] - Optional page number to fetch (defaults to current page in state)
 * @param {boolean} [refresh=false] - Whether to refresh and start from the first page
 * @param {number} [limit=20] - The maximum number of members to fetch per request
 * @returns {Promise<{displayData: DataObject, membersJSON: string}>} - Object containing formatted list members data and raw JSON
 * @throws {Error} - When user is not logged in, token has expired, or there's an error fetching the list members
 */
export const getListMembers = async (
  listUri: string,
  page?: number,
  refresh: boolean = false,
  limit: number = 20
): Promise<{
  displayData: DataObject;
  membersJSON: string;
}> => {
  const authStore = useAuthStore();
  const listsStore = useListsStore() as ListsStore;
  const uiStore = useUiStore();

  if (!authStore.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    // If the list URI is different from the active list, reset members data and set the new active list
    listsStore.setActiveListUri(listUri);

    if (refresh) {
      listsStore.resetAllMembersData();
      listsStore.setActiveListUri(listUri);
    }

    const requestedPage = page || listsStore.members.currentPage;
    const maxAvailablePage = Math.max(
      1,
      Math.ceil(
        listsStore.members.allMembers.length / listsStore.members.itemsPerPage
      )
    );

    // Check if we need to fetch more data
    const needsMoreData =
      (requestedPage > maxAvailablePage && !!listsStore.members.cursor) ||
      (refresh && listsStore.members.allMembers.length === 0);

    // Return cached data if available and not forcing refresh
    if (
      !needsMoreData &&
      !refresh &&
      listsStore.members.allMembers.length > 0
    ) {
      const validPage = Math.min(
        requestedPage,
        Math.ceil(
          listsStore.members.allMembers.length / listsStore.members.itemsPerPage
        )
      );

      listsStore.setMembersCurrentPage(validPage);
      const pageData = getCurrentMembersPageData(
        validPage,
        listUri,
        listsStore
      );

      uiStore.setDisplayData(pageData.displayData);
      return pageData;
    }

    if (listsStore.members.isFetching && !refresh) {
      console.info('Already fetching list members data, will wait');
      throw new Error('Already fetching list members data');
    }

    listsStore.setMembersIsFetching(true);

    try {
      const agent = AtpService.getBskyAgent();

      if (listsStore.members.allMembers.length === 0 || refresh) {
        const firstBatch = await fetchMembersBatch(null, listUri, agent, limit);
        listsStore.setMembers(firstBatch.members);
        listsStore.setMembersPrefetchedPages(1);
        listsStore.setMembersCursor(firstBatch.cursor);
        listsStore.setMembersHasMorePages(!!firstBatch.cursor);
      }
      // Otherwise, if we need more data (for a later page)
      else if (needsMoreData) {
        const newBatch = await fetchMembersBatch(
          listsStore.members.cursor,
          listUri,
          agent,
          limit
        );

        if (newBatch.members.length > 0) {
          listsStore.addMembers(newBatch.members);
          listsStore.setMembersPrefetchedPages(
            listsStore.members.prefetchedPages + 1
          );
          listsStore.setMembersCursor(newBatch.cursor);
          listsStore.setMembersHasMorePages(!!newBatch.cursor);

          const newMaxAvailablePage = Math.ceil(
            listsStore.members.allMembers.length /
              listsStore.members.itemsPerPage
          );

          // If we still need more pages, recursively call getListMembers
          if (
            requestedPage > newMaxAvailablePage &&
            listsStore.members.cursor
          ) {
            return await getListMembers(listUri, requestedPage, false, limit);
          }
        } else {
          listsStore.setMembersHasMorePages(false);
          listsStore.setMembersCursor(null);
        }
      }

      const validPage = Math.min(
        requestedPage,
        Math.ceil(
          listsStore.members.allMembers.length / listsStore.members.itemsPerPage
        )
      );

      if (validPage !== requestedPage) {
        console.log(
          `Requested page ${requestedPage} is out of bounds, using page ${validPage} instead`
        );
      }

      listsStore.setMembersCurrentPage(validPage);
      const pageData = getCurrentMembersPageData(
        validPage,
        listUri,
        listsStore
      );

      uiStore.setDisplayData(pageData.displayData);
      return pageData;
    } finally {
      listsStore.setMembersIsFetching(false);
    }
  } catch (error) {
    listsStore.setMembersIsFetching(false);
    if ((error as Error).message === 'Token has expired') {
      authStore.handleSessionExpired();
    }
    console.error('Error fetching list members:', error);
    throw new Error('Error fetching list members');
  }
};

/**
 * Helper function to fetch a single batch of members from the API
 * @param {string|null} cursor - Optional cursor for pagination
 * @param {string} listUri - The URI of the list
 * @param {BskyAgent} agent - The API agent
 * @param {number} limit - The maximum number of members to fetch per request
 * @returns {Promise<{members: ListMemberItem[], cursor: string|null}>} - Object containing members data and next cursor
 * @throws {Error} - When API request fails
 */
const fetchMembersBatch = async (
  cursor: string | null,
  listUri: string,
  agent: BskyAgent,
  limit: number
): Promise<{
  members: ListMemberItem[];
  cursor: string | null;
}> => {
  const apiParams: { list: string; limit: number; cursor?: string } = {
    list: listUri,
    limit,
  };

  if (cursor) {
    apiParams.cursor = cursor;
  }

  try {
    // First, fetch the list items
    const { data } = await agent.app.bsky.graph.getList(apiParams);

    // Create an array to store the members with proper types
    const members: ListMemberItem[] = [];

    // Process each list item
    for (const item of data.items) {
      if (!item.subject?.did) {
        continue; // Skip items without a valid subject DID
      }

      // We need to fetch the full profile for each member since the list items only contain DIDs
      try {
        const profileResponse = await agent.getProfile({
          actor: item.subject.did,
        });
        const profile = profileResponse.data;

        // Ensure we have a valid URI - required by ListMemberItem
        const memberUri =
          item.uri ||
          `at://${profile.did}/app.bsky.graph.listitem/${Date.now()}`;

        // Create a properly typed member object
        members.push({
          did: profile.did,
          handle: profile.handle,
          name: profile.displayName,
          description: profile.description,
          avatar: profile.avatar,
          uri: memberUri,
        });
      } catch (error) {
        // If profile fetch fails, create a minimal valid member with required fields
        const fallbackUri =
          item.uri ||
          `at://${item.subject.did}/app.bsky.graph.listitem/${Date.now()}`;

        members.push({
          did: item.subject.did,
          handle: item.subject.did, // Use DID as fallback handle when profile fetch fails
          uri: fallbackUri,
        });

        console.error(
          `Failed to fetch profile for ${item.subject.did}:`,
          error
        );
      }
    }

    return {
      members,
      cursor: data.cursor || null,
    };
  } catch (error) {
    console.error('Error fetching list members:', error);
    throw error;
  }
};

/**
 * Get the data for the current page from the prefetched members
 * @param {number} page - The page number to get
 * @param {string} listUri - The URI of the list
 * @param {ListsStore} listsStore - The lists store
 * @returns {Object} - Object containing formatted members data and JSON for the requested page
 * @returns {DataObject} - displayData Formatted members data
 * @returns {string} - membersJSON JSON string representation of the formatted data
 */
const getCurrentMembersPageData = (
  page: number,
  listUri: string,
  listsStore: ListsStore
) => {
  const startIndex = (page - 1) * listsStore.members.itemsPerPage;
  const endIndex = startIndex + listsStore.members.itemsPerPage;
  const pageMembers = listsStore.members.allMembers.slice(startIndex, endIndex);

  const membersData = {
    type: 'list-members',
    data: pageMembers,
    listInfo: {
      name: listsStore.activeList.name,
      description: listsStore.activeList.description,
      uri: listUri,
    },
    pagination: {
      currentPage: page,
      hasMorePages:
        listsStore.members.hasMorePages ||
        endIndex < listsStore.members.allMembers.length,
      totalPages:
        Math.ceil(
          listsStore.members.allMembers.length / listsStore.members.itemsPerPage
        ) + (listsStore.members.hasMorePages ? 1 : 0),
      totalPrefetched: listsStore.members.allMembers.length,
    },
  };

  const jsonData = JSON.stringify(membersData);

  return {
    displayData: membersData as DataObject,
    membersJSON: jsonData,
  };
};
