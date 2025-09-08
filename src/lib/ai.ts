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
  } catch {
    // Raj's Error Handling Pattern - No console.log in production
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
  } catch {
    // No console.log in production
    throw new Error(`Failed to generate AI response with ${modelType}`);
  }
}

// Raj's Cursor Image Generation Pattern
export interface CursorGenerationOptions {
  model: string;
  prompt: string;
  referenceImageUrl?: string;
  size: string;
  format: 'png' | 'svg';
}

export async function generateCursorImage(options: CursorGenerationOptions): Promise<{
  uint8Array: Uint8Array;
  format: string;
  size: { width: number; height: number };
}> {
  const { model, prompt, referenceImageUrl, size, format } = options;

  try {
    // Model-specific generation logic
    switch (model) {
      case 'gpt-image-1':
        return await generateWithGPTImage1(prompt, size, format, referenceImageUrl);

      case 'gemini-image-edit':
        return await generateWithGeminiImage(prompt, size, format, referenceImageUrl);

      case 'gpt-5-mini':
        return await generateWithGPT5Mini(prompt, size, format, referenceImageUrl);

      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    // Raj's Error Handling Pattern
    throw new Error(`Cursor generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// GPT-Image-1 implementation
async function generateWithGPTImage1(
  prompt: string,
  size: string,
  format: 'png' | 'svg',
  referenceImageUrl?: string
) {
  // Implementation for GPT-Image-1 model
  const response = await openaiClient.images.generate({
    model: "openai/gpt-image-1",
    prompt: buildCursorPrompt(prompt, referenceImageUrl),
    size: size as "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792",
    response_format: format === 'png' ? 'url' : 'b64_json',
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from GPT-Image-1');
  }

  // Download and return image data
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  return {
    uint8Array,
    format,
    size: parseSize(size),
  };
}

// Gemini Image Edit implementation
async function generateWithGeminiImage(
  prompt: string,
  size: string,
  format: 'png' | 'svg',
  referenceImageUrl?: string
) {
  // Implementation for Gemini image editing
  const response = await openaiClient.images.generate({
    model: "google/gemini-2.5-flash-lite",
    prompt: buildCursorPrompt(prompt, referenceImageUrl),
    size: size as "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792",
    response_format: format === 'png' ? 'url' : 'b64_json',
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from Gemini');
  }

  // Download and return image data
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  return {
    uint8Array,
    format,
    size: parseSize(size),
  };
}

// GPT-5-Mini implementation
async function generateWithGPT5Mini(
  prompt: string,
  size: string,
  format: 'png' | 'svg',
  referenceImageUrl?: string
) {
  // Implementation for GPT-5-Mini
  const response = await openaiClient.images.generate({
    model: "openai/gpt-5-mini:nitro",
    prompt: buildCursorPrompt(prompt, referenceImageUrl),
    size: size as "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792",
    response_format: format === 'png' ? 'url' : 'b64_json',
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from GPT-5-Mini');
  }

  // Download and return image data
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  return {
    uint8Array,
    format,
    size: parseSize(size),
  };
}

// Helper function to build optimized prompts
function buildCursorPrompt(prompt: string, referenceImageUrl?: string): string {
  let enhancedPrompt = `Create a cursor icon: ${prompt}\n\n`;

  if (referenceImageUrl) {
    enhancedPrompt += `Reference style: Use this as inspiration\n`;
  }

  enhancedPrompt += `
Requirements:
- Optimized for 32x32 pixel usage
- High contrast for visibility
- Simple, clean design
- Suitable for cursor functionality
- Maintain aspect ratio
- PNG format with transparency support
- Professional appearance
- Accessibility friendly`;

  return enhancedPrompt;
}

// Helper function to parse size string
function parseSize(size: string): { width: number; height: number } {
  const [width, height] = size.split('x').map(Number);
  return { width, height };
}
