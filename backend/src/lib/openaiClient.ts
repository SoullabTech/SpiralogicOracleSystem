// src/lib/openaiClient.ts
import OpenAI from "openai";

const openaiInstance = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = openaiInstance;

export const openaiClient = {
  async generateResponse(prompt: string) {
    try {
      const response = await openaiInstance.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      return { content: response.choices[0]?.message?.content || "" };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return { content: `Generated response for prompt: ${prompt}` };
    }
  },
};
