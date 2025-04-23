import { $fetch } from 'ofetch';
import { state } from '~/src/store';
import type {
  ApiResponse,
  ApiResponseItem,
  ApiResponseList,
  SimplifiedList,
  SimplifiedUser,
  SuggestionItem,
  SuggestedList,
  DataObject,
  ListItem,
  FollowItem,
} from '~/src/types';

const callListCurator = async (users: string, lists: string) => {
  try {
    const data = await $fetch('/api/openai', {
      method: 'POST',
      body: { users, lists },
    });

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error calling list curator');
  }
};

/**
 * Processes user follows and lists to suggest list curation options using OpenAI
 * @returns Formatted suggestion data and raw JSON
 */
export const curateUserLists = async (): Promise<{
  displayData: DataObject;
  suggestionsJSON: string;
}> => {
  if (!state.agent || !state.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    // Make sure we have access to follows data
    if (!state.follows.allFollows.length && !state.usersJSON) {
      throw new Error('Please fetch your follows first before curating');
    }

    // Make sure we have access to lists data
    if (!state.lists.allLists.length && !state.listsJSON) {
      throw new Error('Please fetch your lists first before curating');
    }

    // Get all follows from state (if available) or from usersJSON
    let allFollows: FollowItem[] = [];
    if (state.follows.allFollows.length > 0) {
      // Use already fetched follows from state
      allFollows = state.follows.allFollows;
    } else if (state.usersJSON) {
      // Parse follows from JSON if not in state
      const followsData = JSON.parse(state.usersJSON);
      allFollows = followsData.data;
    }

    // Get all lists from state (if available) or from listsJSON
    let allLists: ListItem[] = [];
    if (state.lists.allLists.length > 0) {
      // Use already fetched lists from state
      allLists = state.lists.allLists;
    } else if (state.listsJSON) {
      // Parse lists from JSON if not in state
      const listsData = JSON.parse(state.listsJSON);
      allLists = listsData.data;
    }

    // Get current page follows (which will be used for curation)
    const currentPage = state.follows.currentPage;
    const startIndex = (currentPage - 1) * state.follows.itemsPerPage;
    const endIndex = startIndex + state.follows.itemsPerPage;
    const currentPageFollows = allFollows.slice(startIndex, endIndex);

    const simplifiedUsers = currentPageFollows.map(
      (user: {
        handle: string;
        name?: string;
        description?: string;
      }): SimplifiedUser => ({
        name: user.name || user.handle,
        description: user.description || '',
      })
    );

    const simplifiedLists = allLists.map(
      (list: { name: string; description?: string }): SimplifiedList => ({
        name: list.name,
        description: list.description || '',
      })
    );

    const response = await callListCurator(
      JSON.stringify(simplifiedUsers),
      JSON.stringify(simplifiedLists)
    );

    let parsedResponse: ApiResponse;
    try {
      parsedResponse = JSON.parse(response);
      if (parsedResponse.error) {
        throw new Error(parsedResponse.error);
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Failed to parse API response');
    }

    // Create virtual data objects to use in transformation
    const followsData = {
      type: 'follows',
      data: currentPageFollows,
    };

    const listsData = {
      type: 'lists',
      data: allLists,
    };

    const transformedSuggestions = transformApiResponseToSuggestions(
      parsedResponse,
      simplifiedLists,
      listsData as DataObject,
      followsData as DataObject
    );

    const suggestionsData = {
      type: 'suggestions',
      data: transformedSuggestions,
      suggestions: transformedSuggestions,
    };

    return {
      displayData: suggestionsData as DataObject,
      suggestionsJSON: JSON.stringify(suggestionsData),
    };
  } catch (error) {
    console.error('Error curating lists:', error);
    throw new Error((error as Error).message);
  }
};

/**
 * Transforms the API response into the format expected by our DataCard component
 * Each suggestion item now represents a user (profile) with their suggested lists
 */
const transformApiResponseToSuggestions = (
  apiResponse: ApiResponse,
  suggestions: SimplifiedList[],
  listsData: DataObject,
  followsData: DataObject
): SuggestionItem[] => {
  const result: SuggestionItem[] = [];

  if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
    // Create maps for list data for efficient lookups
    const listDescriptionMap: Record<string, string> = {};
    suggestions.forEach((list) => {
      listDescriptionMap[list.name] = list.description || '';
    });

    const listUriMap: Record<string, string> = {};
    // Ensure we use all lists, not just the current page
    (listsData.data as ListItem[]).forEach((list) => {
      listUriMap[list.name] = list.uri || '';
    });

    // Get all follows for matching, not just the current page
    let allFollows: FollowItem[] = [];
    if (state.follows.allFollows.length > 0) {
      allFollows = state.follows.allFollows;
    } else {
      allFollows = followsData.data as FollowItem[];
    }

    apiResponse.data.forEach((item: ApiResponseItem) => {
      const userName = item.name;
      const userDescription = item.description || '';
      let userDid = '';

      // First try to find the user in the current page's follows
      let userFound = false;
      (followsData.data as FollowItem[]).forEach((user) => {
        if (userName === user.name || userName === user.handle) {
          userDid = user.did || '';
          userFound = true;
        }
      });

      // If not found in current page, check all follows
      if (!userFound && allFollows.length > 0) {
        allFollows.forEach((user) => {
          if (userName === user.name || userName === user.handle) {
            userDid = user.did || '';
          }
        });
      }

      let suggestedLists: SuggestedList[] = [];

      if (item.lists && Array.isArray(item.lists) && item.lists.length > 0) {
        suggestedLists = item.lists.map((listItem: ApiResponseList) => {
          const listName = listItem.name;
          return {
            name: listName,
            description: listDescriptionMap[listName] || '',
            uri: listUriMap[listName] || '',
          };
        });
      }

      result.push({
        name: userName,
        did: userDid,
        description: userDescription,
        suggestedLists: suggestedLists,
      });
    });
  }

  return result;
};
