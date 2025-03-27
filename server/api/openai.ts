import { defineEventHandler } from 'h3';
import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const openAI = new OpenAI({ apiKey: config.public.openaiApiKey });

  const { users, lists } = await readBody(event);

  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'You are a Bluesky list curator. You are responsible for distributing the profiles followed by the user in their existing lists, and responsible for suggesting new lists to organize the profiles. You must respect the following constraints: 1) Any profile can belong to more than one list. 2) Profiles with no fit in any existing list should not be added to any list. 3) If in a current iteration there are profiles that do not fit in any existing list, let the user know that. 4) Format your response with the following format: **List 1 Name** \n - Profile 1 Name. \n - Profile 2 Name \n \n **List 2 Name** \n - Profile 3 Name \n - Profile 4 Name, and so on 5) Let the user now which profiles are not in any list. 6) Stick to the existing lists. Do not suggest new lists.',
    },
    {
      role: 'user',
      content: `These are the users I follow: ${users}. These are my existing lists: ${lists}. Please organize the profiles in the lists.`,
    },
  ];

  const response = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: context,
    temperature: 0.3,
  });

  return response.choices[0].message.content;
});
