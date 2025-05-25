// src/lib/oracle/dreamQuery.ts

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export type DreamResult = {
  interpretation: string;
};

export async function dreamQuery(prompt: string): Promise<DreamResult> {
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a mystical dream interpreter.' },
      { role: 'user', content: prompt },
    ]
  });

  const interpretation = completion.data.choices[0].message?.content.trim() || '';
  return { interpretation };
}
