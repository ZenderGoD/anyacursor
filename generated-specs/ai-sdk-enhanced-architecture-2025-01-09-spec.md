# AI SDK Enhanced App Architecture Specification

## Overview
This specification enhances our comprehensive app architecture with the latest AI SDK features, including AI Elements, advanced hooks, and modern AI integration patterns for Anyacursor.

## Latest AI SDK Integration with OpenRouter

### 1. OpenRouter Provider Setup
```typescript
// OpenRouter provider configuration
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText, generateObject, embed, experimental_generateImage } from 'ai';

// Create OpenRouter provider instance
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Available models through OpenRouter
const models = {
  // Chat models (recommended)
  claude: openrouter.chat('anthropic/claude-3.5-sonnet'),
  gpt4: openrouter.chat('openai/gpt-4o'),
  gemini: openrouter.chat('google/gemini-2.5-flash'),
  llama: openrouter.chat('meta-llama/llama-3.1-405b-instruct'),
  
  // Completion models
  claudeCompletion: openrouter.completion('anthropic/claude-3.5-sonnet'),
  gpt4Completion: openrouter.completion('openai/gpt-4o'),
};

// Text generation with streaming using OpenRouter
export const generateStreamingResponse = async (prompt: string, modelType: 'claude' | 'gpt4' | 'gemini' | 'llama' = 'gpt4') => {
  const result = await streamText({
    model: models[modelType],
    prompt,
    onFinish: (result) => {
      console.log('Generation completed:', result);
    },
  });
  
  return result;
};

// Structured data generation with OpenRouter
export const generateStructuredData = async (prompt: string, modelType: 'claude' | 'gpt4' | 'gemini' = 'claude') => {
  const result = await generateObject({
    model: models[modelType],
    prompt,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
    }),
  });
  
  return result.object;
};

// Image generation with OpenRouter
export const generateImage = async (prompt: string) => {
  const result = await experimental_generateImage({
    model: openrouter.chat('openai/dall-e-3'),
    prompt,
  });
  
  return result.image;
};
```

### 2. AI SDK UI Hooks Enhancement
```typescript
// Enhanced chat interface with AI SDK UI
import { useChat, useCompletion, useObject, useAssistant } from 'ai/react';

// Advanced chat with OpenRouter and tool calling
export const useEnhancedChat = (modelType: 'claude' | 'gpt4' | 'gemini' | 'llama' = 'gpt4') => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat/enhanced',
    body: {
      model: modelType, // Pass model preference to API
    },
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: 'You are a helpful AI assistant with access to various tools including image generation, 3D model creation, and video generation.',
      },
    ],
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: (message) => {
      console.log('Message finished:', message);
    },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  };
};

// Object streaming for structured responses with OpenRouter
export const useStructuredGeneration = (modelType: 'claude' | 'gpt4' | 'gemini' = 'claude') => {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate/structured',
    body: {
      model: modelType,
    },
    schema: z.object({
      recommendations: z.array(z.object({
        type: z.string(),
        title: z.string(),
        description: z.string(),
        confidence: z.number(),
      })),
    }),
  });

  return { object, submit, isLoading, error };
};

// Assistant integration with OpenRouter
export const useAIAssistant = (modelType: 'claude' | 'gpt4' | 'gemini' = 'claude') => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useAssistant({
    api: '/api/assistant',
    body: {
      model: modelType,
    },
    threadId: 'main-thread',
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  };
};
```

### 3. AI Elements Integration
```typescript
// Pre-built AI components from AI Elements
import { 
  Conversation, 
  Message, 
  MessageList, 
  MessageInput,
  MessageActions,
  MessageContent,
  MessageAvatar,
  MessageStatus
} from 'ai/react';

// Enhanced conversation component with OpenRouter
export const AIConversation = ({ modelType = 'gpt4' }: { modelType?: 'claude' | 'gpt4' | 'gemini' | 'llama' }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useEnhancedChat(modelType);

  return (
    <Conversation className="h-full flex flex-col">
      <MessageList className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message}>
            <MessageAvatar />
            <MessageContent />
            <MessageActions />
            <MessageStatus />
          </Message>
        ))}
      </MessageList>
      
      <MessageInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        disabled={isLoading}
        placeholder="Ask me anything..."
        className="border-t border-gray-700 p-4"
      />
    </Conversation>
  );
};
```

### 4. Enhanced Chat Context Provider
```typescript
// Updated chat context with AI SDK features
import { useChat } from 'ai/react';
import { createContext, useContext, ReactNode } from 'react';

interface EnhancedChatContextType {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: Error | undefined;
  stop: () => void;
  reload: () => void;
  append: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setInput: (input: string) => void;
  modelType: 'claude' | 'gpt4' | 'gemini' | 'llama';
  setModelType: (model: 'claude' | 'gpt4' | 'gemini' | 'llama') => void;
}

const EnhancedChatContext = createContext<EnhancedChatContextType | undefined>(undefined);

export const EnhancedChatProvider = ({ 
  children, 
  chatSlug,
  initialModel = 'gpt4'
}: { 
  children: ReactNode; 
  chatSlug?: string;
  initialModel?: 'claude' | 'gpt4' | 'gemini' | 'llama';
}) => {
  const [modelType, setModelType] = useState(initialModel);
  
  const chat = useChat({
    api: '/api/chat/enhanced',
    id: chatSlug,
    body: {
      model: modelType,
    },
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: 'You are a helpful AI assistant with access to various tools and capabilities including image generation, 3D model creation, and video generation.',
      },
    ],
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  return (
    <EnhancedChatContext.Provider value={{
      ...chat,
      modelType,
      setModelType,
    }}>
      {children}
    </EnhancedChatContext.Provider>
  );
};

export const useEnhancedChatContext = () => {
  const context = useContext(EnhancedChatContext);
  if (!context) {
    throw new Error('useEnhancedChatContext must be used within EnhancedChatProvider');
  }
  return context;
};
```

### 5. OpenRouter Model Management
```typescript
// OpenRouter model configuration and management
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Model configuration with cost tracking
export const modelConfig = {
  claude: {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Most capable model for complex reasoning',
    costPerToken: 0.003, // $3 per 1M input tokens
    maxTokens: 200000,
    capabilities: ['reasoning', 'coding', 'analysis'],
  },
  gpt4: {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Latest GPT-4 model with vision capabilities',
    costPerToken: 0.005, // $5 per 1M input tokens
    maxTokens: 128000,
    capabilities: ['reasoning', 'vision', 'coding'],
  },
  gemini: {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast and efficient model for general tasks',
    costPerToken: 0.00075, // $0.75 per 1M input tokens
    maxTokens: 1000000,
    capabilities: ['reasoning', 'vision', 'multimodal'],
  },
  llama: {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    description: 'Open-source model for various tasks',
    costPerToken: 0.0027, // $2.7 per 1M input tokens
    maxTokens: 128000,
    capabilities: ['reasoning', 'coding', 'analysis'],
  },
};

// Model selection based on task type
export const selectModelForTask = (taskType: 'reasoning' | 'coding' | 'vision' | 'general') => {
  switch (taskType) {
    case 'reasoning':
      return 'claude'; // Best for complex reasoning
    case 'coding':
      return 'gpt4'; // Best for coding tasks
    case 'vision':
      return 'gemini'; // Best for vision tasks
    case 'general':
    default:
      return 'gemini'; // Most cost-effective for general tasks
  }
};

// Cost tracking and optimization
export const trackModelUsage = (modelId: string, tokens: number) => {
  const model = Object.values(modelConfig).find(m => m.id === modelId);
  if (model) {
    const cost = (tokens / 1000000) * model.costPerToken;
    console.log(`Model: ${model.name}, Tokens: ${tokens}, Cost: $${cost.toFixed(4)}`);
    return cost;
  }
  return 0;
};

// OpenRouter provider with cost tracking
export const createOptimizedOpenRouter = () => {
  return createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    onResponse: (response) => {
      // Track usage and costs
      const tokens = response.usage?.totalTokens || 0;
      const modelId = response.model;
      trackModelUsage(modelId, tokens);
    },
  });
};
```

### 6. Tool Integration with AI SDK
```typescript
// Enhanced tool calling with AI SDK
import { tool } from 'ai';
import { z } from 'zod';

// Image generation tool
export const imageGenerationTool = tool({
  description: 'Generate images from text prompts',
  parameters: z.object({
    prompt: z.string().describe('The image generation prompt'),
    style: z.enum(['realistic', 'artistic', 'cartoon']).optional(),
    size: z.enum(['256x256', '512x512', '1024x1024']).optional(),
  }),
  execute: async ({ prompt, style = 'realistic', size = '512x512' }) => {
    const openrouter = createOptimizedOpenRouter();
    const result = await experimental_generateImage({
      model: openrouter.chat('openai/dall-e-3'),
      prompt: `${prompt}, ${style} style`,
    });
    
    return {
      imageUrl: result.image.url,
      prompt,
      style,
      size,
    };
  },
});

// 3D model generation tool
export const threeDGenerationTool = tool({
  description: 'Generate 3D models from images',
  parameters: z.object({
    imageUrl: z.string().describe('URL of the image to convert to 3D'),
    quality: z.enum(['low', 'medium', 'high']).optional(),
  }),
  execute: async ({ imageUrl, quality = 'medium' }) => {
    const result = await fal.subscribe('fal-ai/hunyuan3d-v21', {
      input: {
        input_image_url: imageUrl,
        num_inference_steps: quality === 'high' ? 50 : quality === 'medium' ? 30 : 20,
      },
    });
    
    return {
      modelUrl: result.data.model_glb.url,
      imageUrl,
      quality,
    };
  },
});

// Video generation tool
export const videoGenerationTool = tool({
  description: 'Generate videos from images',
  parameters: z.object({
    imageUrl: z.string().describe('URL of the image to convert to video'),
    prompt: z.string().describe('Description of the video to generate'),
    aspectRatio: z.enum(['16:9', '4:3', '1:1', '9:16']).optional(),
  }),
  execute: async ({ imageUrl, prompt, aspectRatio = '16:9' }) => {
    const result = await fal.subscribe('fal-ai/framepack', {
      input: {
        image_url: imageUrl,
        prompt,
        aspect_ratio: aspectRatio,
      },
    });
    
    return {
      videoUrl: result.data.video.url,
      imageUrl,
      prompt,
      aspectRatio,
    };
  },
});
```

### 7. Enhanced API Routes with OpenRouter
```typescript
// Enhanced API route with OpenRouter integration
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { imageGenerationTool, threeDGenerationTool, videoGenerationTool } from '@/lib/ai-tools';
import { modelConfig, selectModelForTask } from '@/lib/model-config';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages, model, taskType } = await req.json();

  // Select optimal model based on task type or user preference
  const selectedModel = model || selectModelForTask(taskType || 'general');
  const modelInfo = modelConfig[selectedModel];

  const result = await streamText({
    model: openrouter.chat(modelInfo.id),
    messages,
    tools: {
      generateImage: imageGenerationTool,
      generate3D: threeDGenerationTool,
      generateVideo: videoGenerationTool,
    },
    maxTokens: modelInfo.maxTokens,
    onFinish: async (result) => {
      // Log completion with cost tracking
      console.log('Chat completed:', {
        model: modelInfo.name,
        tokens: result.usage?.totalTokens,
        cost: result.usage?.totalTokens ? 
          (result.usage.totalTokens / 1000000) * modelInfo.costPerToken : 0,
      });
    },
  });

  return result.toDataStreamResponse();
}

// Model selection API endpoint
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskType = searchParams.get('taskType') as 'reasoning' | 'coding' | 'vision' | 'general';
  
  const recommendedModel = selectModelForTask(taskType || 'general');
  const modelInfo = modelConfig[recommendedModel];
  
  return Response.json({
    recommended: recommendedModel,
    model: modelInfo,
    alternatives: Object.entries(modelConfig).map(([key, config]) => ({
      id: key,
      ...config,
    })),
  });
}
```

### 8. AI Elements Styling Integration
```typescript
// Custom styling for AI Elements
import { Conversation, Message, MessageList, MessageInput } from 'ai/react';

export const StyledAIConversation = ({ modelType = 'gpt4' }: { modelType?: 'claude' | 'gpt4' | 'gemini' | 'llama' }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useEnhancedChat(modelType);

  return (
    <Conversation className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <MessageList className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <Message 
            key={message.id} 
            message={message}
            className="group"
          >
            <div className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : 'bg-gradient-to-r from-green-600 to-teal-600'
              }`}>
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              
              <div className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}>
                <MessageContent className="prose prose-invert max-w-none" />
                
                {message.toolInvocations && message.toolInvocations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.toolInvocations.map((toolInvocation) => (
                      <div key={toolInvocation.toolCallId} className="bg-gray-700 rounded p-3">
                        <div className="text-sm font-medium text-gray-300">
                          {toolInvocation.toolName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {toolInvocation.state === 'result' && toolInvocation.result && (
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(toolInvocation.result, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Message>
        ))}
      </MessageList>
      
      <div className="border-t border-gray-700 p-4">
        <MessageInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          disabled={isLoading}
          placeholder="Ask me anything... I can generate images, 3D models, and videos!"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </Conversation>
  );
};
```

### 9. Model Selector Component
```typescript
// Model selector component for OpenRouter
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { modelConfig } from '@/lib/model-config';

interface ModelSelectorProps {
  currentModel: 'claude' | 'gpt4' | 'gemini' | 'llama';
  onModelChange: (model: 'claude' | 'gpt4' | 'gemini' | 'llama') => void;
}

export const ModelSelector = ({ currentModel, onModelChange }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        {modelConfig[currentModel].name}
        <Badge variant="secondary" className="text-xs">
          ${modelConfig[currentModel].costPerToken}/1M tokens
        </Badge>
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-80 z-50">
          <CardHeader>
            <CardTitle>Select AI Model</CardTitle>
            <CardDescription>
              Choose the best model for your task
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(modelConfig).map(([key, config]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  currentModel === key
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => {
                  onModelChange(key as any);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{config.name}</h4>
                    <p className="text-sm text-gray-400">{config.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      ${config.costPerToken}/1M
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {config.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

### 10. Performance Optimizations with AI SDK
```typescript
// Optimized AI operations with OpenRouter
import { generateText, streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Cached text generation
const textGenerationCache = new Map();

export const generateCachedText = async (prompt: string, modelType: 'claude' | 'gpt4' | 'gemini' | 'llama' = 'gpt4', options: any = {}) => {
  const cacheKey = JSON.stringify({ prompt, modelType, options });
  
  if (textGenerationCache.has(cacheKey)) {
    return textGenerationCache.get(cacheKey);
  }
  
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  
  const result = await generateText({
    model: openrouter.chat(modelConfig[modelType].id),
    prompt,
    ...options,
  });
  
  textGenerationCache.set(cacheKey, result);
  return result;
};

// Streaming with error handling and OpenRouter
export const streamTextWithErrorHandling = async (prompt: string, modelType: 'claude' | 'gpt4' | 'gemini' | 'llama' = 'gpt4') => {
  try {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    
    const result = await streamText({
      model: openrouter.chat(modelConfig[modelType].id),
      prompt,
      onError: (error) => {
        console.error('Streaming error:', error);
        throw error;
      },
    });
    
    return result;
  } catch (error) {
    console.error('Text generation failed:', error);
    throw new Error('Failed to generate text');
  }
};
```

### 11. AI SDK CLI Integration
```typescript
// CLI integration for development
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const testAIModel = async (prompt: string, modelType: 'claude' | 'gpt4' | 'gemini' | 'llama' = 'gpt4') => {
  try {
    const modelId = modelConfig[modelType].id;
    const { stdout } = await execAsync(`npx ai generate "${prompt}" --model ${modelId}`);
    return stdout;
  } catch (error) {
    console.error('CLI test failed:', error);
    throw error;
  }
};

export const streamFromCLI = async (prompt: string, modelType: 'claude' | 'gpt4' | 'gemini' | 'llama' = 'gpt4') => {
  try {
    const modelId = modelConfig[modelType].id;
    const { stdout } = await execAsync(`npx ai generate "${prompt}" --model ${modelId} --stream`);
    return stdout;
  } catch (error) {
    console.error('CLI streaming failed:', error);
    throw error;
  }
};
```

### 12. Enhanced Error Handling
```typescript
// AI SDK specific error handling
import { AIError } from 'ai';

export const handleAIError = (error: unknown) => {
  if (error instanceof AIError) {
    switch (error.code) {
      case 'INVALID_API_KEY':
        return 'Invalid API key. Please check your configuration.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Rate limit exceeded. Please try again later.';
      case 'MODEL_NOT_FOUND':
        return 'Model not found. Please check your model configuration.';
      default:
        return `AI Error: ${error.message}`;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Enhanced chat with error handling
export const useChatWithErrorHandling = () => {
  const chat = useChat({
    api: '/api/chat/enhanced',
    onError: (error) => {
      const errorMessage = handleAIError(error);
      console.error('Chat error:', errorMessage);
      // Show user-friendly error message
    },
  });
  
  return chat;
};
```

## Implementation Benefits

### 1. **Unified AI Experience**
- Single API for all AI operations
- Consistent error handling across all AI services
- Seamless switching between AI providers

### 2. **Enhanced User Experience**
- Real-time streaming responses
- Pre-built UI components
- Smooth animations and transitions

### 3. **Developer Experience**
- Type-safe AI operations
- Comprehensive error handling
- Built-in tool calling support

### 4. **Performance Optimizations**
- Streaming responses for better UX
- Caching for repeated operations
- Optimized bundle size

### 5. **Modern AI Features**
- Tool calling for complex operations
- Structured data generation
- Image and video generation
- Assistant integration

## Updated Implementation Plan

### Phase 1: AI SDK Integration (Week 1-2)
1. Update to latest AI SDK version
2. Implement AI Elements components
3. Enhance chat context with AI SDK hooks
4. Add tool calling capabilities

### Phase 2: Advanced Features (Week 3-4)
1. Implement structured data generation
2. Add image and video generation tools
3. Create enhanced error handling
4. Add performance optimizations

### Phase 3: UI Enhancement (Week 5-6)
1. Style AI Elements components
2. Add custom animations
3. Implement responsive design
4. Add accessibility features

## OpenRouter Integration Benefits

### 1. **Universal Model Access**
- **One API Key**: Access hundreds of models from multiple providers
- **No Vendor Lock-in**: Switch between providers seamlessly
- **Latest Models**: Immediate access to new models as they're released
- **Cost Transparency**: Clear per-token pricing for all models

### 2. **Cost Optimization**
- **Pay-as-you-go**: No monthly fees or commitments
- **Model Selection**: Choose the most cost-effective model for each task
- **Usage Tracking**: Real-time cost monitoring and optimization
- **Budget Control**: Set spending limits and alerts

### 3. **Enhanced Performance**
- **High Availability**: Enterprise-grade infrastructure with automatic failover
- **Global CDN**: Fast response times worldwide
- **Load Balancing**: Automatic traffic distribution
- **99.9% Uptime**: Reliable service with minimal downtime

### 4. **Developer Experience**
- **Unified API**: Standardized interface across all models
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error management
- **Documentation**: Extensive guides and examples

### 5. **Model Comparison**
```typescript
// Cost-effective model selection
const modelComparison = {
  claude: {
    bestFor: 'Complex reasoning, analysis, coding',
    cost: '$3/1M tokens',
    speed: 'Medium',
    quality: 'Excellent'
  },
  gpt4: {
    bestFor: 'General tasks, vision, coding',
    cost: '$5/1M tokens', 
    speed: 'Medium',
    quality: 'Excellent'
  },
  gemini: {
    bestFor: 'Fast responses, multimodal, general tasks',
    cost: '$0.75/1M tokens',
    speed: 'Fast',
    quality: 'Very Good'
  },
  llama: {
    bestFor: 'Open-source alternative, general tasks',
    cost: '$2.7/1M tokens',
    speed: 'Medium',
    quality: 'Good'
  }
};
```

### 6. **Environment Configuration**
```bash
# .env.local
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_OPENROUTER_URL=https://openrouter.ai/api/v1
```

### 7. **Implementation Checklist**
- [ ] Install OpenRouter AI SDK provider
- [ ] Configure environment variables
- [ ] Set up model configuration
- [ ] Implement cost tracking
- [ ] Add model selector component
- [ ] Update API routes
- [ ] Test with different models
- [ ] Monitor usage and costs

This enhanced specification leverages the latest AI SDK features with OpenRouter integration to create a more powerful, cost-effective, and maintainable AI-powered application.
