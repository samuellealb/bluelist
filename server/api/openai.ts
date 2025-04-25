import { defineEventHandler, readBody, createError } from 'h3';
import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  try {
    const openAI = new OpenAI({ apiKey: process.env['NUXT_OPENAI_API_KEY'] });
    const { users, lists } = await readBody(event);

    if (!users || !lists) {
      throw createError({
        statusCode: 400,
        message: 'Missing required data: users and lists are required',
      });
    }

    const systemPrompt = `You are a Bluesky list curator. Organize the given profiles into the existing lists.
      Follow these rules:
      1) Any profile can belong to more than one list.
      2) Do not add profiles to lists that they do not fit in.
      3) Let the user know which profiles are not in any list.
      4) Always double-check your response to make sure there is no non-existing list being suggested. Stick to the existing lists. Do not suggest new lists. This is very important.
      5) Read through each profile name, description, and posts carefully to determine which list they should be in.
      6) Format your response as JSON object. The only root level property should be named 'data'. Data is an Array of objects, each one having the properties 'name' (string), description (string) and lists(Array). Each lists object should have the property name.
      7) A single profile can have multiple lists suggested, as long as they are existing lists and considered a fit for that profile.
      8) Return a valid JSON object. Do not return any other text or HTML. The JSON object should be formatted as a string, and the string should be escaped properly so that it can be parsed as JSON. Do not add markdown or any other formatting to the JSON object.`;

    const userPrompt = `These are the users I follow: ${users}. These are my existing lists: ${lists}. Please organize the profiles into these lists only.`;

    if (userPrompt.length > 100000) {
      throw createError({
        statusCode: 400,
        message:
          'Request too large. Please reduce the number of users or lists.',
      });
    }

    const response = await openAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return response.choices[0].message.content;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === 'OpenAIError' ||
        (error as { status?: number }).status === 400)
    ) {
      console.error('OpenAI API error:', error);

      throw createError({
        statusCode: 400,
        statusText: error.message,
        data: error,
      });
    }

    console.error('Server error:', error);
    throw createError({
      statusCode: 500,
      statusText: (error as Error).message,
      data: error,
    });
  }
});
