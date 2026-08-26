import { defineEventHandler, readBody, createError } from 'h3';
import Anthropic from '@anthropic-ai/sdk';
import { useRuntimeConfig } from '#imports';

const buildCurationSchema = (followNames: string[], listNames: string[]) => ({
  type: 'object',
  additionalProperties: false,
  required: ['data'],
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description', 'lists'],
        properties: {
          name: { type: 'string', enum: followNames },
          description: { type: 'string' },
          lists: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name'],
              properties: { name: { type: 'string', enum: listNames } },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const anthropicApiKey = config.anthropicApiKey as string | undefined;

    if (!anthropicApiKey) {
      console.error('No AI API key found in runtime config');
      throw createError({
        statusCode: 500,
        message:
          'No AI API key configured. Set NUXT_ANTHROPIC_API_KEY in your environment.',
      });
    }

    const { users, lists } = await readBody(event);

    if (!users || !lists) {
      throw createError({
        statusCode: 400,
        message: 'Missing required data: users and lists are required',
      });
    }

    let parsedUsers: { name: string }[];
    let parsedLists: { name: string }[];
    try {
      parsedUsers = JSON.parse(users);
      parsedLists = JSON.parse(lists);
    } catch {
      throw createError({
        statusCode: 400,
        message: 'Malformed users or lists JSON',
      });
    }

    const followNames = [...new Set(parsedUsers.map((u) => u.name))];
    const listNames = [...new Set(parsedLists.map((l) => l.name))];

    if (!followNames.length || !listNames.length) {
      throw createError({
        statusCode: 400,
        message: 'Need at least one follow and one existing list to curate',
      });
    }

    const schema = buildCurationSchema(followNames, listNames);

    const systemPrompt = `You are a Bluesky list curator.

<task>
Assign each profile in <profiles> to zero or more lists from <existing_lists>,
based on how well its name and description match each list's theme.
</task>

<rules>
- A profile may belong to more than one list if it genuinely fits multiple.
- Only assign a profile to a list it is a genuine match for. Do not force-fit profiles into lists they don't belong in.
- If a profile fits no existing list, leave its lists array empty.
- Read each profile's description carefully before deciding.
</rules>`;

    const userPrompt = `<profiles>
${users}
</profiles>

<existing_lists>
${lists}
</existing_lists>

Assign each profile in <profiles> to the lists in <existing_lists> it fits, following the system instructions.`;

    if (userPrompt.length > 100000) {
      throw createError({
        statusCode: 400,
        message:
          'Request too large. Please reduce the number of users or lists.',
      });
    }

    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
      baseURL: 'https://api.anthropic.com',
    });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
      output_config: { format: { type: 'json_schema', schema } },
    });
    if (response.stop_reason === 'max_tokens') {
      throw createError({
        statusCode: 500,
        message:
          'Response truncated. Please reduce the number of users or lists.',
      });
    }
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === 'text'
    );
    if (textBlocks.length === 0) {
      throw createError({
        statusCode: 500,
        message: 'No text content in Anthropic response',
      });
    }
    return textBlocks.map((b) => b.text).join('');
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === 'APIError' ||
        (error as { status?: number }).status === 400)
    ) {
      console.error('AI API error:', error);

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
