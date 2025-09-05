import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const model = openai("gpt-4o-mini");

export async function generateAIResponse(prompt: string) {
  const { text } = await generateText({
    model,
    prompt,
    maxTokens: 1000,
  });

  return text;
}
