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
        'You are a Bluesky list curator. You are responsible for distributing the profiles followed by the user in their existing lists, and responsible for suggesting new lists to organize the profiles. You must respect the following instructions: 1) Any profile can belong to more than one list. 2) Do not add profiles to lists that they do not fit in. 3) If in a current iteration there are profiles that do not fit in any existing list, let the user know that. 4) Let the user now which profiles are not in any list. 5) Stick to the existing lists. Do not suggest new lists. This is very important. 6) Read through each profile name, description and posts carfully to determine which list they should be in.  7) Format your response with one topic per list, and one subtopic per profile. The same profile can be a subtopic for multiple list topics, if it fits in more than one lists. 8 Use the following format: **List 1 Name** \n - Profile 1 Name. \n - Profile 2 Name \n \n **List 2 Name** \n - Profile 3 Name \n - Profile 4 Name, and so on.',
    },
    {
      role: 'user',
      content: `These are the users I follow: ${users}. These are my existing lists: ${lists}. Please organize the profiles in the lists.`,
    },
  ];

  const response = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: context,
    temperature: 0.1,
  });

  return response.choices[0].message.content;
});
