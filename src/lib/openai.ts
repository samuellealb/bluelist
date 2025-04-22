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
  displayData: string;
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

    console.log('API Response:', parsedResponse);

    const transformedSuggestions = transformApiResponseToSuggestions(
      parsedResponse,
      simplifiedLists
    );

    const suggestionsData = {
      type: 'suggestions',
      data: transformedSuggestions,
      suggestions: {
        existingLists: transformedSuggestions,
        newLists: [] as SuggestionItem[],
      },
    };

    const jsonData = JSON.stringify(suggestionsData);
    const displayData = `<h2>Your Suggested Lists</h2><pre>${JSON.stringify(
      suggestionsData,
      null,
      2
    )}</pre>`;

    return { displayData, suggestionsJSON: jsonData };
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
  existingLists: SimplifiedList[]
): SuggestionItem[] => {
  const result: SuggestionItem[] = [];

  // If the API response has the expected structure with a data property
  if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
    // Create a map of list names to their descriptions for quick lookup
    const listDescriptionMap: Record<string, string> = {};
    existingLists.forEach((list) => {
      listDescriptionMap[list.name] = list.description || '';
    });

    // Process each user in the API response
    apiResponse.data.forEach((item: ApiResponseItem) => {
      const userName = item.name;
      const userDescription = item.description || '';

      // Initialize suggestedLists array - empty by default
      let suggestedLists: SuggestedList[] = [];

      // If the user has suggested lists, process them
      if (item.lists && Array.isArray(item.lists) && item.lists.length > 0) {
        // Transform the lists to include descriptions
        suggestedLists = item.lists.map((listItem: ApiResponseList) => {
          const listName = listItem.name;
          return {
            name: listName,
            description: listDescriptionMap[listName] || '',
          };
        });
      }

      // Add the user with their suggested lists to the result
      // Even if the suggestedLists array is empty
      result.push({
        name: userName,
        description: userDescription,
        suggestedLists: suggestedLists,
      });
    });
  }

  return result;
};
