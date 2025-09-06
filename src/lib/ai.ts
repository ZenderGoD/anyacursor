import OpenAI from "openai";

// OpenRouter configuration - using OpenAI SDK with OpenRouter endpoint
export const openaiClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Default model for text generation
export const model = "openai/gpt-4o";

// Raj's AI Response Generation Pattern
export async function generateAIResponse(prompt: string) {
  try {
    const completion = await openaiClient.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    // Raj's Error Handling Pattern
    console.error('AI Response Generation Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Raj's Model Selection Pattern
export async function generateWithModel(prompt: string, modelType: 'gpt4' | 'claude' | 'gemini' = 'gpt4') {
  const modelMap = {
    gpt4: "openai/gpt-4o",
    claude: "anthropic/claude-3-haiku",
    gemini: "google/gemini-pro",
  };

  try {
    const completion = await openaiClient.chat.completions.create({
      model: modelMap[modelType],
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error(`AI Response Generation Error (${modelType}):`, error);
    throw new Error(`Failed to generate AI response with ${modelType}`);
  }
}
