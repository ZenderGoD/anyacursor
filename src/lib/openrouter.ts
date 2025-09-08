import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Raj's OpenRouter Configuration Pattern
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  compatibility: 'strict',
});

// Available models for cursor generation
export const CURSOR_MODELS = {
  'gpt-image-1': 'openai/gpt-image-1',
  'gemini-image-edit': 'google/gemini-2.5-flash-lite',
  'gpt-5-mini': 'openai/gpt-5-mini:nitro',
} as const;

// Default model for text generation
export const DEFAULT_TEXT_MODEL = 'openai/gpt-4o';

// Raj's Model Selection Helper
export function getModelForTask(task: 'text' | 'image' | 'edit' | 'animation'): string {
  switch (task) {
    case 'text':
      return DEFAULT_TEXT_MODEL;
    case 'image':
      return CURSOR_MODELS['gpt-image-1'];
    case 'edit':
      return CURSOR_MODELS['gemini-image-edit'];
    case 'animation':
      return CURSOR_MODELS['gpt-5-mini'];
    default:
      return DEFAULT_TEXT_MODEL;
  }
}

