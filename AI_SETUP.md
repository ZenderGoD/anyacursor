# AI Setup Guide

This project uses OpenRouter for AI text generation and Fal for image generation, providing access to hundreds of AI models through unified APIs.

## 🚀 OpenRouter Setup

### What is OpenRouter?

OpenRouter provides a unified API that gives you access to hundreds of AI models through a single endpoint, while automatically handling fallbacks and selecting the most cost-effective options.

### Getting Started

1. **Sign up at OpenRouter**: Visit [OpenRouter.ai](https://openrouter.ai) and create an account
2. **Get your API key**: Navigate to the API Keys section in your dashboard
3. **Add to environment**: Set `OPENROUTER_API_KEY` in your `.env.local` file

### Configuration

The OpenRouter client is pre-configured in `src/lib/ai.ts`:

```typescript
import OpenAI from "openai";

// OpenRouter configuration - using OpenAI SDK with OpenRouter endpoint
export const openaiClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

### Available Models

OpenRouter provides access to models from multiple providers:

- **OpenAI**: GPT-4, GPT-3.5 Turbo
- **Anthropic**: Claude 3, Claude 2
- **Google**: Gemini, PaLM
- **Meta**: Llama models
- **And many more...**

### Usage Examples

```typescript
import { generateAIResponse, generateWithModel } from '@/lib/ai';

// Basic text generation with GPT-4
const response = await generateAIResponse("Explain quantum computing");

// Advanced model selection
const claudeResponse = await generateWithModel("Analyze this data", 'claude');
const geminiResponse = await generateWithModel("Create a creative story", 'gemini');
```

### Direct OpenRouter API Usage

```typescript
import { openaiClient } from '@/lib/ai';

// Custom API calls with OpenRouter
const completion = await openaiClient.chat.completions.create({
  model: "anthropic/claude-3-opus",
  messages: [{ role: "user", content: "Hello!" }],
  max_tokens: 1000,
});
```

### Model Selection

```typescript
// Choose the right model for your use case
const responses = await Promise.all([
  generateWithModel("Code review this function", 'claude'),      // Best for coding
  generateWithModel("Write a marketing email", 'gpt4'),         // Best for creative writing
  generateWithModel("Analyze financial data", 'gemini'),        // Best for analysis
]);
```

### Advanced Configuration

```typescript
// Using different models
const claudeClient = openai("anthropic/claude-3-haiku", {
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const geminiClient = openai("google/gemini-pro", {
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

## 🎨 Fal Setup

### What is Fal?

Fal is a specialized platform for AI image generation, providing fast and high-quality results with models like Flux.

### Getting Started

1. **Sign up at Fal**: Visit [Fal.ai](https://fal.ai) and create an account
2. **Get your API key**: Navigate to the API Keys section in your dashboard
3. **Add to environment**: Set `FAL_KEY` in your `.env.local` file

### Configuration

The Fal client is configured in `src/lib/fal.ts`:

```typescript
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});
```

### Available Models

- **Flux Schnell**: Fast, high-quality image generation
- **Flux Pro**: Advanced model with more control and higher quality
- **Stable Diffusion**: Classic model with extensive fine-tuning options

### Usage Examples

```typescript
import { generateImageWithFal, generateImageAdvanced } from '@/lib/fal';

// Basic image generation
const result = await generateImageWithFal("A serene mountain landscape");

// Advanced generation with options
const advancedResult = await generateImageAdvanced("A cyberpunk city", {
  style: "digital art",
  aspectRatio: "landscape_16_9",
  numImages: 2,
});

// Extract image URLs
import { extractImageUrls } from '@/lib/fal';
const urls = extractImageUrls(result);
```

### Advanced Features

```typescript
// Batch generation
const batchResult = await generateImageAdvanced("Various animals", {
  numImages: 4,
  style: "watercolor",
});

// Style variations
const styles = ["photorealistic", "anime", "oil painting", "digital art"];
const styledImages = await Promise.all(
  styles.map(style =>
    generateImageAdvanced("A beautiful sunset", { style })
  )
);
```

## 🔧 Environment Variables

Add these to your `.env.local` file:

```bash
# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Fal
FAL_KEY=your_fal_api_key_here

# Optional: Direct OpenAI access
OPENAI_API_KEY=your_openai_api_key_here
```

## 📊 Cost Optimization

### OpenRouter Cost Optimization

OpenRouter automatically selects the most cost-effective model that meets your requirements:

```typescript
// Let OpenRouter choose the best model
const response = await generateAIResponse("Complex analysis task");

// Or specify a model for consistency
const specificModel = openai("openai/gpt-4o-mini", {
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

### Fal Cost Optimization

Choose the right model based on your needs:

```typescript
// Fast generation (lower cost)
const fastImage = await generateImageWithFal("Quick sketch");

// High quality (higher cost)
const proImage = await generateImageAdvanced("Professional render", {
  // Flux Pro settings
});
```

## 🐛 Troubleshooting

### Common Issues

1. **OpenRouter API Key Issues**:
   ```bash
   # Check if key is set
   echo $OPENROUTER_API_KEY

   # Test the connection
   curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
        https://openrouter.ai/api/v1/models
   ```

2. **Fal API Key Issues**:
   ```bash
   # Check if key is set
   echo $FAL_KEY

   # Test the connection
   curl -H "Authorization: Key $FAL_KEY" \
        https://fal.run/fal-ai/flux/schnell
   ```

3. **Rate Limiting**:
   - OpenRouter: Check your usage dashboard
   - Fal: Monitor your credits and usage

4. **Model Availability**:
   - Some models may have temporary outages
   - OpenRouter automatically handles fallbacks

## 📚 Additional Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Model Rankings](https://openrouter.ai/models)
- [Fal Documentation](https://fal.ai/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)

## 🎯 Best Practices

1. **Error Handling**: Always wrap AI calls in try-catch blocks
2. **Rate Limiting**: Implement proper rate limiting for production
3. **Caching**: Cache frequent responses to reduce API calls
4. **Fallbacks**: Use OpenRouter's automatic fallbacks for reliability
5. **Cost Monitoring**: Track usage and costs regularly
