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

    // Create system prompt with enhanced visual formatting instructions
    const systemPrompt = `You are a Bluesky list curator. Organize the given profiles into the existing lists.
      Format your response with HTML to make it visually appealing. Follow these rules:


      1) Any profile can belong to more than one list.
      2) Do not add profiles to lists that they do not fit in. Always double-check your response to make sure there is no non-existing list being suggested.
      3) If in a current iteration there are profiles that do not fit in any existing list, let the user know that.
      4) Let the user know which profiles are not in any list.
      5) Stick to the existing lists. Do not suggest new lists. This is very important.
      6) Read through each profile name, description, and posts carefully to determine which list they should be in.
      7) Format your response with one topic per list, and one subtopic per profile. The same profile can be a subtopic for multiple list topics if it fits in more than one list.
      8) Double-check if profiles in the non-fitting section are not in any list. If so, decide whether it should be in the existing list OR in the non-fitting section.
      9) First, organize profiles by curated list:
          <h2>Curated Lists</h2>
          <div class="curated-lists-section">
            <div class="profile-cards-container">
              <div class="profile-card card">
                <div class="profile-header">
                  <h2 class="profile-name">${'$'}{Profile Name}</h2>
                  <div class="profile-avatar">
                    <!-- Profile initial as fallback -->
                    <div class="avatar-placeholder">${'$'}{Profile Name.charAt(0).toUpperCase()}</div>
                  </div>
                </div>
                <div class="profile-description">
                  <p>Brief description of the profile (if available)</p>
                </div>
                <div class="profile-lists">
                  <h3>Suggested Lists:</h3>
                  <div class="list-buttons">
                    <button onclick="console.log('Adding Profile Name to ${'$'}{List Name}')" class="list-button">
                      <span class="list-badge">${'$'}{List Name}</span>
                      <span class="list-reason-tooltip">Brief reason why they fit</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- More profile cards here -->
            </div>
          </div>
      10) At the end, include a section for profiles that don't fit in any list:
        <div class="unmatched-profiles card">
          <h2 class="list-title">Profiles Without a List</h2>
          <div class="profile-grid">
            <div class="profile-card mini-card">
              <div class="profile-header">
                <h3 class="profile-name">${'$'}{Profile Name}</h3>
                <div class="avatar-placeholder mini">${'$'}{Profile Name.charAt(0).toUpperCase()}</div>
              </div>
            </div>
            <!-- More unmatched profiles here -->
          </div>
          <p class="suggestion">Consider creating new lists for these profiles based on their themes.</p>
        </div>
      11) Ensure your response is valid HTML within the prescribed format. Use the placeholder expressions exactly as shown.`;

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
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
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
