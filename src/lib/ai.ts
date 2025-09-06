import { openai } from "@ai-sdk/openai";
import { generateText, generateImage } from "ai";

// OpenRouter configuration - using OpenAI SDK with OpenRouter endpoint
export const openRouterClient = openai("openai/gpt-4o", {
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Default model for text generation
export const model = openRouterClient;

// Raj's AI Response Generation Pattern
export async function generateAIResponse(prompt: string) {
  try {
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1000,
    });

    return text;
  } catch (error) {
    // Raj's Error Handling Pattern
    console.error('AI Response Generation Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Raj's Image Generation Pattern using OpenRouter
export async function generateImageWithOpenRouter(prompt: string) {
  try {
    const result = await generateImage({
      model: openai("openai/dall-e-3", {
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      }),
      prompt,
      size: "1024x1024",
    });

    return result;
  } catch (error) {
    console.error('Image Generation Error:', error);
    throw new Error('Failed to generate image');
  }
}
