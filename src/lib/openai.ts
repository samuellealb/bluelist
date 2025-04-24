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
} from '~/src/types/index';

/**
 * Calls the List Curator API endpoint to process users and lists.
 *
 * @param users - String representation of users to be processed
 * @param lists - String representation of lists to be processed
 * @returns The data returned from the API endpoint
 * @throws Error if the API call fails
 */
const callOpenAiAPI = async (users: string, lists: string) => {
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
 * @returns {Promise<Object>} - Object containing the suggestions data
 * @throws {Error} - If the API call fails or if parsing the response fails
 */
export const curateUserLists = async (): Promise<{
  suggestionsJSON: string;
}> => {
  if (!state.agent || !state.isLoggedIn) {
    throw new Error('Please login first');
  }

  try {
    if (!state.follows.allFollows.length && !state.usersJSON) {
      throw new Error('Please fetch your follows first before curating');
    }

    if (!state.lists.allLists.length && !state.listsJSON) {
      throw new Error('Please fetch your lists first before curating');
    }

    let allFollows: FollowItem[] = [];
    if (state.follows.allFollows.length > 0) {
      allFollows = state.follows.allFollows;
    } else if (state.usersJSON) {
      const followsData = JSON.parse(state.usersJSON);
      allFollows = followsData.data;
    }

    let allLists: ListItem[] = [];
    if (state.lists.allLists.length > 0) {
      allLists = state.lists.allLists;
    } else if (state.listsJSON) {
      const listsData = JSON.parse(state.listsJSON);
      allLists = listsData.data;
    }

    const currentPage = state.follows.currentPage;
    const startIndex = (currentPage - 1) * state.follows.itemsPerPage;
    const endIndex = startIndex + state.follows.itemsPerPage;
    const currentPageFollows = allFollows.slice(startIndex, endIndex);

    if (currentPageFollows.length === 0) {
      throw new Error('No follows available on the current page to curate');
    }

    const simplifiedFollows = currentPageFollows.map(
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

    const response = await callOpenAiAPI(
      JSON.stringify(simplifiedFollows),
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
      listsData as DataObject,
      followsData as DataObject
    );

    const suggestionsData = {
      data: transformedSuggestions,
    };

    return {
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
 *
 * @param {ApiResponse} suggestions - The parsed API response containing user and list suggestions
 * @param {DataObject} listsData - Object containing all the user's lists data
 * @param {DataObject} followsData - Object containing all the user's follows data
 * @returns {SuggestionItem[]} Array of suggestion items formatted for the DataCard component
 * @throws {Error} If the suggestions data structure is invalid or cannot be processed
 */
const transformApiResponseToSuggestions = (
  suggestions: ApiResponse,
  listsData: DataObject,
  followsData: DataObject
): SuggestionItem[] => {
  const result: SuggestionItem[] = [];

  const hasSuggestions =
    suggestions && suggestions.data && Array.isArray(suggestions.data);

  if (hasSuggestions) {
    const createListDescriptionMap = (
      lists: ListItem[]
    ): Record<string, string> => {
      const map: Record<string, string> = {};
      lists.forEach((list) => {
        map[(list as ListItem).name] = (list as ListItem).description || '';
      });
      return map;
    };
    const listDescriptionMap = createListDescriptionMap(
      listsData.data as ListItem[]
    );

    const createListUriMap = (lists: ListItem[]): Record<string, string> => {
      const map: Record<string, string> = {};
      lists.forEach((list) => {
        map[list.name] = list.uri || '';
      });
      return map;
    };
    const listUriMap = createListUriMap(listsData.data as ListItem[]);

    suggestions.data.forEach((profile: ApiResponseItem) => {
      const followName = profile.name;
      const followDescription = profile.description || '';

      const restoreFollowDid = (followName: string): string => {
        let did = '';
        (followsData.data as FollowItem[]).forEach((follow) => {
          if (followName === follow.name || followName === follow.handle) {
            did = follow.did || '';
          }
        });
        return did;
      };
      const followDid = restoreFollowDid(followName);

      const buildSuggestedLists = (
        profileLists: ApiResponseList[] | undefined,
        listDescriptionMap: Record<string, string>,
        listUriMap: Record<string, string>
      ): SuggestedList[] => {
        const profileHasSuggestedLists =
          profile.lists &&
          Array.isArray(profile.lists) &&
          profile.lists.length > 0;

        if (!profileHasSuggestedLists) {
          return [];
        }

        return profileLists!.map((listItem: ApiResponseList) => {
          const listName = listItem.name;
          return {
            name: listName,
            description: listDescriptionMap[listName] || '',
            uri: listUriMap[listName] || '',
          };
        });
      };
      const suggestedLists = buildSuggestedLists(
        profile.lists,
        listDescriptionMap,
        listUriMap
      );

      result.push({
        name: followName,
        did: followDid,
        description: followDescription,
        suggestedLists: suggestedLists,
      });
    });
  }

  return result;
};
