import { $fetch } from 'ofetch';
import { state } from '~/src/store';

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
 * @returns Formatted suggestion data
 */
export const curateUserLists = async (): Promise<string> => {
  if (!state.usersJSON || !state.listsJSON) {
    throw new Error('Please fetch your follows and lists before curating');
  }

  try {
    const followsData = JSON.parse(state.usersJSON);
    const listsData = JSON.parse(state.listsJSON);

    const simplifiedUsers = followsData.data.map(
      (user: { handle: string; name?: string; description?: string }) => ({
        name: user.name || user.handle,
        description: user.description || '',
      })
    );

    const simplifiedLists = listsData.data.map(
      (list: { name: string; description: string }) => ({
        name: list.name,
        description: list.description || '',
      })
    );

    const response = await callListCurator(
      JSON.stringify(simplifiedUsers),
      JSON.stringify(simplifiedLists)
    );

    let parsedResponse = JSON.parse(response);
    if (parsedResponse.error) {
      throw new Error(parsedResponse.error);
    }

    parsedResponse = { type: 'suggestions', ...parsedResponse };
    return `<h2>Your Lists</h2><pre>${JSON.stringify(
      parsedResponse,
      null,
      2
    )}</pre>`;
  } catch (error) {
    console.error('Error curating lists:', error);
    throw new Error((error as Error).message);
  }
};
