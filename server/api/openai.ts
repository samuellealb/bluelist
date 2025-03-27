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

    // Create system prompt with improved formatting instructions
    const systemPrompt = `You are a Bluesky list curator. Organize the given profiles into the existing lists.

Format your response with HTML to make it visually appealing. Follow these rules:
1) Profiles can be in multiple lists if appropriate
2) Only place profiles in lists they fit in
3) Use this HTML format:
   <div class="curated-list">
     <h2 class="list-title">List Name</h2>
     <ul class="profile-list">
       <li class="profile-item"><strong>Profile Name</strong> - Brief reason why they fit (if available)</li>
     </ul>
   </div>
4) At the end, include a section for profiles that don't fit in any list:
   <div class="unmatched-profiles">
     <h2 class="list-title">Profiles Without a List</h2>
     <ul class="profile-list">
       <li class="profile-item">Profile name</li>
     </ul>
     <p class="suggestion">Consider creating new lists for these profiles based on their themes.</p>
   </div>

Ensure your response is valid HTML within the prescribed format.`;

    const userPrompt = `These are the users I follow: ${users}. These are my existing lists: ${lists}. Please organize the profiles into these lists only.`;

    // Safety check for token limit
    if (userPrompt.length > 100000) {
      throw createError({
        statusCode: 400,
        message:
          'Request too large. Please reduce the number of users or lists.',
      });
    }

    const response = await openAI.chat.completions.create({
      model: 'gpt-3.5-turbo-16k', // Using the 16k context model for larger capacity
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
    });

    return response.choices[0].message.content;
  } catch (error: unknown) {
    // Handle OpenAI API specific errors
    if (
      error instanceof Error &&
      (error.name === 'OpenAIError' ||
        (error as { status?: number }).status === 400)
    ) {
      console.error('OpenAI API error:', error);

      throw createError({
        statusCode: 400,
        message:
          'Error processing request with OpenAI. The request may be too large or have invalid content.',
      });
    }

    // Handle other errors
    console.error('Server error:', error);
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});
