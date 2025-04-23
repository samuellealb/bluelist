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
  if (!state.usersJSON || !state.listsJSON) {
    throw new Error('Please fetch your follows and lists before curating');
  }

  try {
    const followsData = JSON.parse(state.usersJSON);
    const listsData = JSON.parse(state.listsJSON);

    const simplifiedUsers = followsData.data.map(
      (user: {
        handle: string;
        name?: string;
        description?: string;
      }): SimplifiedUser => ({
        name: user.name || user.handle,
        description: user.description || '',
      })
    );

    const simplifiedLists = listsData.data.map(
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

    const transformedSuggestions = transformApiResponseToSuggestions(
      parsedResponse,
      simplifiedLists,
      listsData,
      followsData
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
    const listDescriptionMap: Record<string, string> = {};
    suggestions.forEach((list) => {
      listDescriptionMap[list.name] = list.description || '';
    });

    const listUriMap: Record<string, string> = {};
    suggestions.forEach((list) => {
      (listsData.data as ListItem[]).forEach((l) => {
        if (l.name === list.name) {
          listUriMap[list.name] = l.uri || '';
        }
      });
    });

    console.log(followsData.data);

    apiResponse.data.forEach((item: ApiResponseItem) => {
      const userName = item.name;
      const userDescription = item.description || '';
      let userDid = '';

      (followsData.data as FollowItem[]).forEach((user) => {
        if (userName === user.name) {
          userDid = user.did || '';
        }
      });

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
