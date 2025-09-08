import { openrouter } from './openrouter';
import { fal } from '@fal-ai/client';
import { tool } from 'ai';
import { z } from 'zod';

// Configure Fal client for chat interface
fal.config({
  credentials: process.env.FAL_KEY,
});

// Raj's Chat AI Integration Patterns

// Text Generation Tool for OpenRouter with Context Management
export const generateTextTool = tool({
  description: 'Generate text response using OpenRouter LLM with chat context',
  inputSchema: z.object({
    prompt: z.string().describe('The text prompt for generation'),
    model: z.string().optional().describe('OpenRouter model to use'),
    context: z.string().optional().describe('Previous conversation context'),
    chatHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional().describe('Recent chat history for context'),
    summary: z.string().optional().describe('Chat summary for long conversations'),
  }),
  execute: async ({ prompt, model = 'openai/gpt-4o', context, chatHistory, summary }) => {
    try {
      // Raj's Error Handling Pattern - Authentication check first
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured');
      }

      const startTime = Date.now();
      
      // Build context-aware messages
      const messages = [];
      
      // Add system context if available
      if (context) {
        messages.push({ role: 'system' as const, content: context });
      }
      
      // Add chat summary for long conversations
      if (summary) {
        messages.push({ 
          role: 'system' as const, 
          content: `Previous conversation summary: ${summary}` 
        });
      }
      
      // Add recent chat history
      if (chatHistory && chatHistory.length > 0) {
        messages.push(...chatHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })));
      }
      
      // Add current prompt
      messages.push({ role: 'user' as const, content: prompt });
      
      // Use OpenRouter for text generation
      const response = await openrouter.chat(model).generate({
        messages,
        maxTokens: 1000,
        temperature: 0.7,
      });

      const generationTime = Date.now() - startTime;

      return {
        content: response.text,
        model,
        generationTime,
        cost: 0.01, // Estimate - would need actual cost calculation
      };
    } catch (error) {
      throw new Error(`Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Text-to-Image Generation Tool using FAL AI Flux Pro
export const generateImageTool = tool({
  description: 'Generate image from text using FAL AI Flux Pro v1.1 Ultra',
  inputSchema: z.object({
    prompt: z.string().describe('The image generation prompt'),
    numImages: z.number().optional().describe('Number of images to generate'),
    outputFormat: z.enum(['jpeg', 'png']).optional().describe('Output format'),
  }),
  execute: async ({ prompt, numImages = 1, outputFormat = 'jpeg' }) => {
    try {
      // Raj's Error Handling Pattern - Authentication check first
      if (!process.env.FAL_KEY) {
        throw new Error('FAL_KEY not configured');
      }

      const startTime = Date.now();

      const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
        input: {
          prompt,
          num_images: numImages,
          output_format: outputFormat,
          image_size: "landscape_4_3",
          num_inference_steps: 28,
          enable_safety_checker: true,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generating image with Flux Pro...");
          }
        },
      });

      const generationTime = Date.now() - startTime;

      return {
        images: result.data.images,
        model: 'fal-ai/flux-pro/v1.1-ultra',
        generationTime,
        cost: 0.05 * numImages, // Estimate - would need actual cost calculation
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Image-to-Image Editing Tool using FAL AI Gemini 2.5 Flash
export const editImageTool = tool({
  description: 'Edit existing image using FAL AI Gemini 2.5 Flash Image',
  inputSchema: z.object({
    prompt: z.string().describe('The image editing prompt'),
    imageUrls: z.array(z.string()).describe('Input images for editing'),
    numImages: z.number().optional().describe('Number of images to generate'),
    outputFormat: z.enum(['jpeg', 'png']).optional().describe('Output format'),
  }),
  execute: async ({ prompt, imageUrls, numImages = 1, outputFormat = 'jpeg' }) => {
    try {
      // Raj's Error Handling Pattern - Authentication check first
      if (!process.env.FAL_KEY) {
        throw new Error('FAL_KEY not configured');
      }

      const startTime = Date.now();

      const result = await fal.subscribe("fal-ai/gemini-25-flash-image/edit", {
        input: {
          prompt,
          image_urls: imageUrls,
          num_images: numImages,
          output_format: outputFormat,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Editing image with Gemini 2.5 Flash...");
          }
        },
      });

      const generationTime = Date.now() - startTime;

      return {
        images: result.data.images,
        description: result.data.description,
        model: 'fal-ai/gemini-25-flash-image/edit',
        generationTime,
        cost: 0.03 * numImages, // Estimate - would need actual cost calculation
      };
    } catch (error) {
      throw new Error(`Image editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Raj's Tool Set for Chat Interface
export const chatTools = [
  generateTextTool,
  generateImageTool,
  editImageTool,
] as const;

// Raj's Model Selection Helper for Chat
export function getChatModelForType(type: 'text' | 'text-to-image' | 'image-to-image'): string {
  switch (type) {
    case 'text':
      return 'openai/gpt-4o';
    case 'text-to-image':
      return 'fal-ai/flux-pro/v1.1-ultra';
    case 'image-to-image':
      return 'fal-ai/gemini-25-flash-image/edit';
    default:
      return 'openai/gpt-4o';
  }
}

// Raj's Content Type Detection
export function detectContentType(input: string): 'text' | 'text-to-image' | 'image-to-image' {
  const lowerInput = input.toLowerCase();
  
  // Check for image editing keywords
  if (lowerInput.includes('edit') || lowerInput.includes('modify') || lowerInput.includes('change')) {
    return 'image-to-image';
  }
  
  // Check for image generation keywords
  if (lowerInput.includes('generate') || lowerInput.includes('create') || lowerInput.includes('draw') || lowerInput.includes('paint')) {
    return 'text-to-image';
  }
  
  // Default to text
  return 'text';
}

// Raj's Error Classification for Chat
export const CHAT_ERROR_TYPES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT: 'RATE_LIMIT',
  GENERATION_FAILED: 'GENERATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  API_ERROR: 'API_ERROR',
} as const;

export type ChatErrorType = keyof typeof CHAT_ERROR_TYPES;

// Raj's Context Management Utilities
export function buildChatContext(
  messages: any[],
  maxContextMessages: number = 50,
  summary?: string
): {
  recentMessages: any[];
  shouldSummarize: boolean;
  contextSummary?: string;
} {
  const shouldSummarize = messages.length > maxContextMessages;
  
  if (shouldSummarize) {
    // Take the most recent messages for context
    const recentMessages = messages.slice(-maxContextMessages);
    return {
      recentMessages,
      shouldSummarize: true,
      contextSummary: summary,
    };
  }
  
  return {
    recentMessages: messages,
    shouldSummarize: false,
  };
}

// Raj's Message Context Builder
export function buildMessageContext(
  messages: any[],
  summary?: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const contextMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  
  // Add summary as system context if available
  if (summary) {
    contextMessages.push({
      role: 'assistant',
      content: `[Previous conversation summary: ${summary}]`
    });
  }
  
  // Add recent messages (last 20 for context)
  const recentMessages = messages.slice(-20);
  for (const message of recentMessages) {
    if (message.role === 'user' || message.role === 'assistant') {
      contextMessages.push({
        role: message.role,
        content: message.content || message.parts?.[0]?.text || ''
      });
    }
  }
  
  return contextMessages;
}
