# Raj's Senior Developer Coding Style Guide

A comprehensive guide to coding like an experienced senior developer based on Raj's patterns and practices in the IMAI codebase.

## Table of Contents
1. [IMAI Codebase Architecture](#imai-codebase-architecture)
2. [Raj's Modular Component Architecture](#rajs-modular-component-architecture)
3. [AI System Architecture & Backend Integration](#ai-system-architecture--backend-integration)
4. [Core Philosophy](#core-philosophy)
5. [TypeScript Excellence](#typescript-excellence)
6. [Convex Backend Architecture](#convex-backend-architecture)
7. [React/Next.js Frontend Patterns](#react-nextjs-frontend-patterns)
8. [Error Handling & Validation](#error-handling--validation)
9. [Code Organization & Structure](#code-organization--structure)
10. [Performance & Optimization](#performance--optimization)
11. [Security & Best Practices](#security--best-practices)
12. [AI Integration Patterns](#ai-integration-patterns)
13. [Testing & Quality Assurance](#testing--quality-assurance)
14. [Migration & Maintenance](#migration--maintenance)

---

## IMAI Codebase Architecture

### Application Overview

IMAI is a creative AI platform for product visualization and experimentation. The application enables users to:
- Create and manage products with multiple versions
- Generate AI-powered assets (images, videos, 3D models)
- Collaborate within organizations
- Chat with AI agents for creative assistance
- Manage billing and credits for AI operations

### Technology Stack

**Frontend:**
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS for styling
- Shadcn/ui component library
- Framer Motion for animations

**Backend:**
- Convex for real-time database and functions
- Convex Auth for authentication
- OpenRouter for AI model access
- Stripe for payment processin Convex Agent framework for AI chat

### Core Data Model Hierarchy

```
Organization
├── Members (users with roles)
├── Products
│   ├── Versions (1.0, 1.1, 2.0, etc.)
│   │   └── Assets (images, videos, 3D models)
│   └── Chat Threads (AI conversations)
├── References (style guides, patterns)
└── Credit System (billing & usage)
```

### Database Schema Structure

The schema is built around these core entities:

**Products Table:**
- Represents creative projects/items
- Belongs to users or organizations
- Has visibility settings (private, organization, public, unlisted)
- Contains original prompt and metadata
- Links to chat threads for AI interaction

**Versions Table:**
- Multiple versions per product (like Git branches)
- Each version has its own chat thread
- Tracks setup status for async operations
- Contains version-specific metadata and changelog

**Assets Table:**
- Generated content (images, videos, 3D models)
- Organized by asset groups (main, lifestyle, detail-shots, etc.)
- Tracks generation status and costs
- Stored in Convex storage with metadata

**Organizations Table:**
- Multi-tenant workspaces
- Credit system for AI operations
- Billing integration with Stripe
- Member management with roles

### File Structure Deep Dive

**Convex Backend (`/convex`):**
```
convex/
├── _generated/           # Auto-generated API types
├── schema.ts            # Database schema definition
├── auth.ts              # Authentication logic
├── http.ts              # HTTP endpoints (webhooks)
├── products/            # Product-related functions
│   ├── mutations.ts     # Product CRUD operations
│   ├── queries.ts       # Product data retrieval
│   └── ai/              # AI integration
│       ├── agents/      # AI agent definitions
│       └── tools/       # AI tool implementations
├── assets/              # Asset management
├── organizations/       # Organization management
├── billing/             # Payment processing
└── versions/            # Version management
```

**Frontend (`/src`):**
```
src/
├── app/                 # Next.js App Router pages
│   ├── [orgSlug]/      # Organization-scoped routes
│   └── auth/           # Authentication pages
├── components/
│   ├── ui/             # Reusable UI components
│   ├── product/        # Product-specific components
│   ├── chat/           # AI chat interface
│   └── organization/   # Org management components
├── lib/                # Utilities and configurations
└── hooks/              # Custom React hooks
```

### Data Flow Patterns

**Product Creation Flow:**
1. User creates product via mutation
2. System generates initial version
3. AI processes original prompt
4. Assets are generated asynchronously
5. Status updates tracked in real-time

**AI Chat Flow:**
1. User sends message to thread
2. Message routed to appropriate AI agent
3. Agent uses tools to perform operations
4. Results stored and displayed in real-time
5. Context maintained across conversation

**Asset Generation Flow:**
1. User requests asset via AI or direct action
2. Request queued with status tracking
3. External AI service processes request
4. Result stored in Convex storage
5. Metadata and URLs updated in database

---

## Raj's Modular Component Architecture

### 1. **Component Organization Hierarchy**

Raj structures components in a clear, scalable hierarchy:

```
src/components/
├── ui/                    # Reusable UI primitives (buttons, inputs, etc.)
├── product/              # Product-specific components
│   ├── chat-interface.tsx
│   ├── version-picker.tsx
│   └── asset-modal.tsx
├── chat/                 # AI chat system components
│   ├── message-roles/    # Message rendering components
│   ├── tool-calls/       # AI tool call UI components
│   └── tool-call-config.tsx
├── ai-elements/          # AI-specific UI components
│   ├── response.tsx      # Markdown rendering with streaming support
│   └── code-block.tsx    # Code syntax highlighting
├── organization/         # Organization management
├── home/                 # Dashboard and sidebar components
└── product-page/         # Product detail page components
```

### 2. **Component Modularity Patterns**

**Single Responsibility Pattern:**
```typescript
// ✅ Raj's Pattern - Each component has one clear purpose
export function AssetModal({ asset, onClose }: AssetModalProps) {
  // Only handles asset display and modal interactions
}

export function AssetActions({ asset, onUpdate }: AssetActionsProps) {
  // Only handles action buttons for assets
}
```

**Composition over Inheritance:**
```typescript
// ✅ Raj's Pattern - Compose components together
export function ProductDetails({ product, showActions = true }: Props) {
  return (
    <div>
      <ProductHeader product={product} />
      <ProductMetadata product={product} />
      {showActions && <ProductActions product={product} />}
    </div>
  );
}
```

### 3. **Component Export Patterns**

**Index File Pattern:**
```typescript
// components/product-page/index.ts
export { ProductDetails } from './product-details';
export { AssetModal } from './asset-modal';
export { VersionPicker } from './version-picker';
export type { ProductDetailsProps } from './product-details';

// Usage - Clean imports
import { ProductDetails, AssetModal } from '@/components/product-page';
```

**Feature-Based Organization:**
```typescript
// ✅ Raj's Pattern - Group related components by feature
src/components/
├── product/
│   ├── ProductDetails.tsx
│   ├── ProductActions.tsx
│   ├── index.ts
├── chat/
│   ├── ChatInterface.tsx
│   ├── MessageList.tsx
│   ├── index.ts
```

### 4. **Component Communication Patterns**

**Props Drilling Prevention:**
```typescript
// ✅ Raj's Pattern - Use context for shared state
const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ product, children }: Props) {
  const value = {
    product,
    updateProduct: useMutation(api.products.updateProduct),
    selectedVersion: useQuery(api.versions.getById, { id: product.versionId }),
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
```

**Custom Hooks for Logic:**
```typescript
// ✅ Raj's Pattern - Extract logic into reusable hooks
export function useProductActions(productId: Id<'products'>) {
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const handleUpdate = useCallback((updates: ProductUpdate) => {
    return updateProduct({ id: productId, ...updates });
  }, [updateProduct, productId]);

  const handleDelete = useCallback(() => {
    return deleteProduct({ id: productId });
  }, [deleteProduct, productId]);

  return { handleUpdate, handleDelete };
}
```

### 5. **UI Component Library Structure**

**Base Components:**
```typescript
// ui/button.tsx - Base button component
export function Button({
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Compound Components:**
```typescript
// ui/form.tsx - Form system with compound components
export function Form({ children, ...props }: FormProps) {
  return (
    <form {...props}>
      {children}
    </form>
  );
}

export function FormField({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FormItem({ children }: { children: ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

// Usage
<Form>
  <FormField>
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</Form>
```

---

## AI System Architecture & Backend Integration

### 1. **AI Agent Hierarchy**

Raj structures AI agents in a clear hierarchy:

```
AI Agents/
├── org/                 # Organization-level agent
│   └── orgAgent.ts      # Handles general ideation and product creation
├── main/                # Product-specific agent
│   └── productAgent.ts  # Handles asset generation and product management
└── qa/                  # Quality assurance agent
    └── qaAgent.ts       # Handles consistency checking and validation
```

**Agent Configuration Pattern:**
```typescript
// Raj's AI Agent Structure
export const productAgent = new Agent(components.agent, {
  name: 'Product Agent',
  languageModel: openrouter.chat('openai/gpt-5-mini:nitro', {
    parallelToolCalls: true,
  }),
  instructions: `
Output policy:
- Do the work using tools; then reply with one short sentence (max 20 words).
- Use markdown supported by Streamdown: short lists, tables, or code only when essential.
- No preambles, no meta commentary. Default to a single line like: Completed.

Redaction and privacy:
- Never reveal IDs of any kind (productId, versionId, assetId, etc.).
- If a tool returns IDs, omit them or replace with human labels.
- Avoid exposing internal paths, database schema details, or function names.
`,
  tools: {
    generateNewAsset,
    generateAndUpdateAsset,
    updateProduct,
    createVersion,
    // ... other tools
  },
});
```

### 2. **AI Tool System Architecture**

**Tool Definition Pattern:**
```typescript
// Raj's AI Tool Pattern
export const generateNewAsset = tool({
  args: {
    versionId: v.id('versions'),
    prompt: v.string(),
    assetGroup: v.string(),
    referenceAssetIds: v.optional(v.array(v.id('assets'))),
  },
  handler: async (ctx, args) => {
    // 1. Validate permissions
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get version and validate access
    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new ConvexError('VERSION_NOT_FOUND');
    }

    // 3. Check credits before expensive operation
    const org = await ctx.db.get(version.organizationId);
    if (org && org.credits.balance < 10) {
      throw new ConvexError('INSUFFICIENT_CREDITS');
    }

    // 4. Create asset record with pending status
    const assetId = await ctx.db.insert('assets', {
      versionId: args.versionId,
      productId: version.productId,
      ownerId: userId,
      organizationId: version.organizationId,
      type: 'image',
      assetGroup: args.assetGroup,
      status: 'pending',
      prompt: args.prompt,
      metadata: {},
    });

    // 5. Schedule async generation
    await ctx.scheduler.runAfter(0, internal.products.ai.node.actions.generateImage, {
      assetId,
      prompt: args.prompt,
      referenceAssetIds: args.referenceAssetIds,
    });

    return { assetId, status: 'pending' };
  },
});
```

### 3. **AI Backend Processing System**

**Node.js Action Pattern:**
```typescript
// Raj's AI Processing Pattern
export const generateImage = internalAction({
  args: {
    assetId: v.id('assets'),
    prompt: v.optional(v.string()),
    referenceImageUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Get asset record
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new ConvexError('ASSET_NOT_FOUND');
    }

    // 2. Update status to processing
    await ctx.db.patch(args.assetId, {
      status: 'processing',
      processingTimeMs: 0,
    });

    try {
      // 3. Generate image using AI provider
      const result = await generateImageFromAI({
        model: replicate('blackforestlabs/flux-1.1-pro'),
        prompt: args.prompt || 'Generate an image',
        size: '1024x1024',
      });

      // 4. Store in Convex storage
      const storageId = await ctx.storage.store(result.uint8Array);

      // 5. Update asset record
      await ctx.db.patch(args.assetId, {
        status: 'completed',
        storageId,
        processingTimeMs: Date.now() - startTime,
      });

    } catch (error) {
      // 6. Handle errors and update status
      await ctx.db.patch(args.assetId, {
        status: 'failed',
        statusMessage: friendlyProviderErrorMessage(error),
      });
      throw error;
    }
  },
});
```

### 4. **AI Chat Integration Pattern**

**Thread Management:**
```typescript
// Raj's Chat Thread Pattern
export const continueThread = internalAction({
  args: {
    versionId: v.id('versions'),
    userId: v.optional(v.string()),
    prompt: v.string(),
    referenceAssetIds: v.optional(v.array(v.id('assets'))),
  },
  handler: async (ctx, args) => {
    // 1. Validate version and get context
    const version = await ctx.runQuery(internal.versions.queries.getVersionInternal, {
      versionId: args.versionId,
    });

    // 2. Save user message
    const saved = await saveMessage(ctx, components.agent, {
      threadId: version.threadId,
      userId: args.userId,
      prompt: args.prompt,
    });

    // 3. Generate AI response using agent
    const response = await productAgent.generate(ctx, {
      threadId: version.threadId,
      messageId: saved.messageId,
      additionalContext: {
        currentProductId: version.productId,
        currentVersionId: args.versionId,
        referenceAssetIds: args.referenceAssetIds,
      },
    });

    return response;
  },
});
```

### 5. **AI Tool Call UI System**

**Tool Configuration Pattern:**
```typescript
// Raj's Tool Call UI Pattern
export const toolConfigs: ToolConfigs = {
  'tool-generateNewAsset': {
    callComponent: GenerateNewAssetToolCall,
    resultComponent: GenerateNewAssetToolResult,
    displayName: 'Generate New Asset',
  },
  'tool-updateProduct': {
    callComponent: UpdateProductToolCall,
    resultComponent: UpdateProductToolResult,
    displayName: 'Update Product',
  },
  // ... more tools
};

export function getToolConfig(toolName: string): ToolConfig {
  const config = toolConfigs[toolName] || defaultToolConfig;
  return {
    callComponent: config.callComponent || defaultToolConfig.callComponent!,
    resultComponent: config.resultComponent || defaultToolConfig.resultComponent!,
    displayName: config.displayName || toolName,
  };
}
```

**Tool Call Component Pattern:**
```typescript
// Raj's Tool Call Component Pattern
export function GenerateNewAssetToolCall({ tool }: ToolComponentProps) {
  if (tool.type !== 'tool-generateNewAsset') return null;

  return (
    <div className="border-border bg-muted/50 mt-1 rounded-xl border p-2 text-sm">
      <div className="flex items-center gap-2">
        <Wand2 className="size-4 animate-pulse text-purple-600" />
        <ShiningText text="Generating new asset" className="text-sm" />
      </div>
    </div>
  );
}

export function GenerateNewAssetToolResult({ tool }: ToolComponentProps) {
  if (tool.type !== 'tool-generateNewAsset') return null;

  const output = tool.output as GenerateNewAssetOutput | null;
  const data = output?.data;

  return (
    <div className="p-1 py-2">
      <img
        src={data?.assetUrl || ''}
        width={100}
        height={100}
        alt="Asset"
        className="rounded-md"
      />
    </div>
  );
}
```

### 6. **AI Response Rendering System**

**Streaming Response Pattern:**
```typescript
// Raj's AI Response Pattern
export const Response = memo(
  ({
    className,
    options,
    children,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    ...props
  }: ResponseProps) => {
    // Parse incomplete markdown for streaming
    const parsedChildren = shouldParseIncompleteMarkdown
      ? parseIncompleteMarkdown(children)
      : children;

    return (
      <div className={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}>
        <HardenedMarkdown
          allowedImagePrefixes={['*']}
          allowedLinkPrefixes={['*']}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkGfm, remarkMath]}
        >
          {parsedChildren}
        </HardenedMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
```

**Incomplete Markdown Parser:**
```typescript
// Raj's Streaming Markdown Parser
function parseIncompleteMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;

  // Handle incomplete links and images
  const linkImagePattern = /(!?\[)([^\]]*?)$/;
  const linkMatch = result.match(linkImagePattern);
  if (linkMatch) {
    const startIndex = result.lastIndexOf(linkMatch[1] || '');
    result = result.substring(0, startIndex);
  }

  // Handle incomplete bold formatting
  const boldPattern = /(\*\*)([^*]*?)$/;
  const boldMatch = result.match(boldPattern);
  if (boldMatch) {
    const asteriskPairs = (result.match(/\*\*/g) || []).length;
    if (asteriskPairs % 2 === 1) {
      result = `${result}**`;
    }
  }

  return result;
}
```

### 7. **AI Model Provider Integration**

**OpenRouter Configuration:**
```typescript
// Raj's AI Provider Pattern
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  compatibility: 'strict',
});

export const defaultTextModel = 'google/gemini-2.5-flash-lite';

// Agent language model configuration
languageModel: openrouter.chat('openai/gpt-5-mini:nitro', {
  parallelToolCalls: true,
}),
```

### 8. **AI Memory and Context Management**

**Context Building Pattern:**
```typescript
// Raj's Context Management
const contextMessages: ModelMessage[] = [];

// Add product context
const productContext = {
  productId: product._id,
  productName: product.name,
  currentVersion: activeVersion?.name,
};

// Add asset references
if (args.referenceAssetIds?.length) {
  const assets = await Promise.all(
    args.referenceAssetIds.map(id => ctx.db.get(id))
  );

  contextMessages.push({
    role: 'system',
    content: `Reference assets available: ${assets.map(a => a?.prompt).join(', ')}`,
  });
}
```

---

## Core Philosophy

### 1. Type Safety First

Never use `any` types. Always define proper interfaces and use Convex validators.

```typescript
// Avoid - Using any or loose types
const handleData = (data: any) => {
  return data.someProperty;
};

// Raj's Way - Strict typing with proper interfaces
interface UserData {
  id: Id<'users'>;
  name: string;
  email: string;
}

const handleUserData = (data: UserData): string => {
  return data.name;
};
```

### 2. Defensive Programming

Always assume things can go wrong and handle edge cases:

```typescript
// Raj's Pattern - Always validate and handle null/undefined
const getUser = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError('USER_NOT_FOUND');
  }
  return user;
};
```

### 3. Explicit Over Implicit

Make intentions clear through explicit code:

```typescript
// Implicit behavior - Avoid
const updateData = { ...args };

// Raj's Way - Explicit field handling
const updateData: Record<string, unknown> = {};

if (args.name !== undefined) updateData.name = args.name;
if (args.description !== undefined) updateData.description = args.description;
```

### 4. No Console Logs in Production

Never commit console.log statements. Use proper error handling and monitoring instead.

```typescript
// Avoid - Console logs
const processData = (data: unknown) => {
  console.log('Processing data:', data);
  // ... logic
};

// Raj's Way - Proper error handling
const processData = (data: unknown) => {
  try {
    // ... logic
  } catch (error) {
    throw new ConvexError('PROCESSING_FAILED', { cause: error });
  }
};
```

### 5. Convex Handles Timestamps

Never manually add createdAt or updatedAt fields. Convex automatically provides `_creationTime` and tracks modifications.

```typescript
// Avoid - Manual timestamps
await ctx.db.insert('products', {
  name: 'Product Name',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Raj's Way - Let Convex handle timestamps
await ctx.db.insert('products', {
  name: 'Product Name',
  // Convex automatically adds _creationTime
});

// Access creation time via _creationTime
const product = await ctx.db.get(productId);
const createdTime = product._creationTime;
```

---

## TypeScript Excellence

### 1. Strict Type Definitions

```typescript
// Use discriminated unions for status types
type AssetStatus = 
  | 'pending'
  | 'processing' 
  | 'completed'
  | 'failed';

// Use proper generic constraints
interface ValidationResult<T> {
  valid: boolean;
  errors?: Array<{
    field: keyof T;
    message: string;
  }>;
}
```

### 2. Proper Import Organization

```typescript
// Raj's Import Order:
// 1. 'use client' directive first (if needed)
'use client';

// 2. External libraries (React, Next.js, etc.)
import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. Internal UI components (grouped by type)
import { ButtonLoader } from '@/components/loaders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// 4. Convex API and types
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';

// 5. Utilities last
import { cn } from '@/lib/utils';
```

### 3. Interface Design Patterns

```typescript
// Raj's Interface Patterns
interface ComponentProps {
  // Required props first
  product: Doc<'products'>;
  selectedVersion: Doc<'versions'> | null;
  
  // Optional props with defaults
  className?: string;
  isLoading?: boolean;
  
  // Handlers grouped together
  onSuccess?: () => void;
  onError?: (error: string) => void;
  
  // Complex objects last
  assetsData?: AssetsData | null;
}

// Use proper type unions for component variants
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
```

---

## Convex Backend Architecture

### 1. Function Structure Pattern

```typescript
// Raj's Convex Function Pattern
export const createProduct = mutation({
  args: {
    // Always use proper validators
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.optional(v.id('organizations')),
    visibility: v.union(
      v.literal('organization'),
      v.literal('public'),
      v.literal('private'),
      v.literal('unlisted')
    ),
  },
  returns: v.id('products'), // Always specify return type
  handler: async (ctx, args) => {
    // 1. Authentication check first
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Permission validation
    if (args.organizationId) {
      const membership = await ctx.db
        .query('members')
        .withIndex('by_org_user', (q) =>
          q.eq('organizationId', args.organizationId!).eq('userId', userId)
        )
        .first();
      if (!membership) {
        throw new ConvexError('ACCESS_DENIED');
      }
    }

    // 3. Business logic
    const productId = await ctx.db.insert('products', {
      name: args.name,
      ownerId: userId,
      organizationId: args.organizationId,
      visibility: args.visibility,
      // No manual timestamps - Convex handles this
    });

    return productId;
  },
});
```

### 2. Query Optimization Patterns

```typescript
// Raj's Query Patterns
export const getProductsByOrg = query({
  args: { orgSlug: v.string() },
  returns: v.array(v.object({
    _id: v.id('products'),
    name: v.string(),
    description: v.optional(v.string()),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    // Always check auth first
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Use proper indexes for efficient queries
    const org = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', args.orgSlug))
      .first();
    
    if (!org) return [];

    // Verify permissions before data access
    const membership = await ctx.db
      .query('members')
      .withIndex('by_org_user', (q) =>
        q.eq('organizationId', org._id).eq('userId', userId)
      )
      .first();
    
    if (!membership) return [];

    // Efficient query with proper ordering
    return await ctx.db
      .query('products')
      .withIndex('by_organization', (q) => q.eq('organizationId', org._id))
      .order('desc')
      .take(50); // Always limit results
  },
});
```

### 3. Error Handling in Convex

```typescript
// Raj's Error Handling Pattern
export const validateInput = mutation({
  args: { email: v.string(), password: v.string() },
  returns: v.object({
    valid: v.boolean(),
    errors: v.optional(v.array(v.object({
      field: v.string(),
      message: v.string(),
    }))),
  }),
  handler: async (ctx, args) => {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate each field explicitly
    if (!isValidEmail(args.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
      });
    }

    if (args.password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters',
      });
    }

    return errors.length > 0 
      ? { valid: false, errors }
      : { valid: true };
  },
});
```

### 4. Schema Design Principles

```typescript
// Raj's Schema Patterns
const schema = defineSchema({
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id('users'),
    organizationId: v.optional(v.id('organizations')),
    
    // Use discriminated unions for status
    visibility: v.union(
      v.literal('organization'),
      v.literal('public'),
      v.literal('private'),
      v.literal('unlisted')
    ),
    
    // Optional fields for flexibility
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    
    // Structured metadata
    metadata: v.optional(v.object({
      width: v.number(),
      height: v.number(),
      fileSize: v.number(),
      mimeType: v.string(),
    })),
    
    // No manual timestamps - Convex provides _creationTime
  })
    // Always include proper indexes
    .index('by_owner', ['ownerId'])
    .index('by_organization', ['organizationId'])
    .index('by_category', ['category'])
    // Compound indexes for complex queries
    .index('by_category_owner', ['category', 'ownerId'])
    // Search indexes for full-text search
    .searchIndex('search_products', {
      searchField: 'name',
      filterFields: ['ownerId', 'category'],
    }),
});
```

---

## React/Next.js Frontend Patterns

### 1. Component Structure

```typescript
// Raj's Component Pattern
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ComponentProps } from './types';

interface Props extends ComponentProps {
  onSuccess?: () => void;
}

export function MyComponent({ 
  product, 
  selectedVersion, 
  onSuccess,
  className 
}: Props) {
  // 1. Hooks first (in logical order)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Convex hooks
  const updateProduct = useMutation(api.products.mutations.updateProduct);
  
  // 3. Memoized values
  const displayName = useMemo(() => {
    return selectedVersion?.name || product.name;
  }, [selectedVersion?.name, product.name]);
  
  // 4. Callbacks
  const handleUpdate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateProduct({ id: product._id, name: 'New Name' });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  }, [updateProduct, product._id, onSuccess]);

  // 5. Early returns for loading/error states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // 6. Main render
  return (
    <div className={cn('default-styles', className)}>
      <h1>{displayName}</h1>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
```

### 2. Form Handling with Validation

```typescript
// Raj's Form Pattern with react-hook-form + zod
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const handleSubmit = async (values: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Server-side validation first
      const validation = await validateInput(values);
      if (!validation.valid) {
        // Handle field-specific errors
        validation.errors?.forEach((error) => {
          form.setError(error.field as keyof FormData, {
            message: error.message,
          });
        });
        return;
      }

      // Proceed with submission
      await submitForm(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

### 3. Next.js App Router Patterns

```typescript
// Page component structure
interface PageProps {
  params: { orgSlug: string; id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductPage({ params, searchParams }: PageProps) {
  // Use Convex hooks for data fetching
  const product = useQuery(api.products.queries.getById, { 
    id: params.id as Id<'products'> 
  });
  
  // Handle loading states
  if (product === undefined) {
    return <ProductPageSkeleton />;
  }
  
  if (product === null) {
    return <div>Product not found</div>;
  }
  
  return <ProductDetails product={product} />;
}
```

---

## Error Handling & Validation

### 1. Comprehensive Error Classification

```typescript
// Raj's Error Types
export const ERROR_TYPES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
} as const;

// Usage in Convex functions
export const secureOperation = mutation({
  args: { resourceId: v.id('products') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError(ERROR_TYPES.UNAUTHORIZED);
    }
    
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new ConvexError(ERROR_TYPES.RESOURCE_NOT_FOUND);
    }
    
    // ... rest of logic
  },
});
```

### 2. Client-Side Error Handling

```typescript
// Raj's Client Error Handling
const handleError = (error: unknown) => {
  if (error instanceof ConvexError) {
    const errorData = error.data as {
      type?: string;
      field?: string;
      message?: string;
    };

    switch (errorData?.type) {
      case 'VALIDATION_ERROR':
        if (errorData.field) {
          form.setError(errorData.field, { message: errorData.message });
        }
        break;
      case 'RATE_LIMIT':
        setError('Too many requests. Please wait before trying again.');
        break;
      case 'INSUFFICIENT_CREDITS':
        setError('Insufficient credits. Please purchase more credits.');
        break;
      default:
        setError(errorData?.message || 'An unexpected error occurred');
    }
  } else if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('An unexpected error occurred');
  }
};
```

### 3. Input Validation Functions

```typescript
// Raj's Validation Utilities
function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000); // Limit length
}
```

---

## Code Organization & Structure

### 1. File Naming Conventions

```
Raj's Naming Patterns:
- Components: PascalCase files, kebab-case directories
  - src/components/product-page/ProductDetails.tsx
  - src/components/ui/button.tsx
  
- Convex functions: kebab-case files and directories
  - convex/products/mutations.ts
  - convex/organizations/queries.ts
  
- Utilities: kebab-case
  - src/lib/utils.ts
  - src/hooks/use-storage-url.ts
  
- Pages: kebab-case with Next.js conventions
  - src/app/[orgSlug]/products/[id]/page.tsx
```

### 2. Component Export Patterns

```typescript
// In component file - named export
export function ProductDetails({ product }: Props) {
  // Component implementation
}

// In index.ts files - re-export for clean imports
export { ProductDetails } from './product-details';
export { AssetModal } from './asset-modal';
export type { ProductDetailsProps } from './product-details';

// Usage - clean imports
import { ProductDetails, AssetModal } from '@/components/product-page';
```

### 3. Convex Function Organization

```typescript
// Group related functions in modules
// convex/products/mutations.ts
export const create = mutation({ /* ... */ });
export const update = mutation({ /* ... */ });
export const delete = mutation({ /* ... */ });

// convex/products/queries.ts  
export const getById = query({ /* ... */ });
export const listByOrg = query({ /* ... */ });
export const search = query({ /* ... */ });

// convex/products/internal.ts
export const createInternal = internalMutation({ /* ... */ });
export const updateInternal = internalMutation({ /* ... */ });
```

---

## Performance & Optimization

### 1. React Performance Patterns

```typescript
// Raj's Performance Optimizations
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive computations
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item),
    }));
  }, [data]);

  const handleClick = useCallback((id: string) => {
    // Handler logic
  }, []); // Only recreate if dependencies change

  return <div>{/* Render */}</div>;
});

// Proper dependency arrays
useEffect(() => {
  // Effect logic
}, [dependency1, dependency2]); // Include ALL dependencies
```

### 2. Database Query Optimization

```typescript
// Raj's Query Optimization
export const getProductsWithAssets = query({
  args: { orgId: v.id('organizations') },
  handler: async (ctx, args) => {
    // Use indexes for efficient queries
    const products = await ctx.db
      .query('products')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.orgId))
      .order('desc')
      .take(50); // Always limit results

    // Avoid N+1 queries - batch related data
    const productIds = products.map(p => p._id);
    const allAssets = await Promise.all(
      productIds.map(id => 
        ctx.db
          .query('assets')
          .withIndex('by_product', (q) => q.eq('productId', id))
          .take(10)
          .collect()
      )
    );

    // Combine results efficiently
    return products.map((product, index) => ({
      ...product,
      assets: allAssets[index] || [],
    }));
  },
});
```

### 3. Image and Asset Optimization

```typescript
// Use Next.js Image component for optimization
import Image from 'next/image';

// Raj's Image Pattern
export function AssetDisplay({ asset }: { asset: Doc<'assets'> }) {
  const imageUrl = useStorageUrl(asset.storageId);
  
  if (!imageUrl) {
    return <AssetSkeleton />;
  }
  
  return (
    <Image
      src={imageUrl}
      alt={asset.prompt || 'Generated asset'}
      width={asset.metadata.width || 512}
      height={asset.metadata.height || 512}
      className="rounded-lg"
      priority={false} // Only true for above-the-fold images
    />
  );
}
```

---

## Security & Best Practices

### 1. Authentication & Authorization Pattern

```typescript
// Raj's Security Pattern
export const secureOperation = mutation({
  args: { resourceId: v.id('products') },
  handler: async (ctx, args) => {
    // 1. Always check authentication first
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get the resource
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new ConvexError('RESOURCE_NOT_FOUND');
    }

    // 3. Check permissions based on ownership model
    if (resource.organizationId) {
      // Organization-level permission check
      const membership = await ctx.db
        .query('members')
        .withIndex('by_org_user', (q) =>
          q.eq('organizationId', resource.organizationId!)
          .eq('userId', userId)
        )
        .first();
      
      if (!membership) {
        throw new ConvexError('ACCESS_DENIED');
      }

      // Role-based permissions if needed
      if (membership.role !== 'owner' && membership.role !== 'admin') {
        throw new ConvexError('INSUFFICIENT_PERMISSIONS');
      }
    } else {
      // Direct ownership check
      if (resource.ownerId !== userId) {
        throw new ConvexError('ACCESS_DENIED');
      }
    }

    // 4. Proceed with operation
    // ... business logic
  },
});
```

### 2. Input Sanitization

```typescript
// Raj's Input Handling
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000); // Limit length
}

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Sanitize inputs
    const title = sanitizeInput(args.title);
    const content = sanitizeInput(args.content);

    // Validate after sanitization
    if (title.length < 1) {
      throw new ConvexError('TITLE_REQUIRED');
    }

    // Proceed with clean data
    await ctx.db.insert('posts', { title, content });
  },
});
```

---

## AI Integration Patterns

### 1. AI Agent Structure

```typescript
// Raj's AI Agent Pattern
export const productAgent = new Agent(components.agent, {
  name: 'Product Agent',
  languageModel: openrouter.chat('openai/gpt-5-mini:nitro', {
    parallelToolCalls: true,
  }),
  instructions: `
You generate and update product assets while maintaining strict version consistency.

Output policy:
- Do the work using tools; then reply with one short sentence (max 20 words).
- Use markdown supported by Streamdown: short lists, tables, or code only when essential.
- No preambles, no meta commentary. Default to a single line like: Completed.

Redaction and privacy:
- Never reveal IDs of any kind (productId, versionId, assetId, etc.).
- If a tool returns IDs, omit them or replace with human labels.

Core rules:
- Always use the main asset as reference unless explicitly told otherwise.
- Maintain product shape, geometry, proportions within a version.
- If changes alter identity, create a new version instead of updating in-place.
`,
  tools: {
    generateNewAsset,
    updateProduct,
    createVersion,
    // ... other tools
  },
});
```

### 2. AI Tool Implementation

```typescript
// Raj's AI Tool Pattern
export const generateNewAsset = tool({
  args: {
    versionId: v.id('versions'),
    prompt: v.string(),
    assetGroup: v.string(),
    referenceAssetIds: v.optional(v.array(v.id('assets'))),
  },
  handler: async (ctx, args) => {
    // 1. Validate permissions
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get version and validate access
    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new ConvexError('VERSION_NOT_FOUND');
    }

    // 3. Check credits before expensive operation
    const org = await ctx.db.get(version.organizationId);
    if (org && org.credits.balance < 10) {
      throw new ConvexError('INSUFFICIENT_CREDITS');
    }

    // 4. Create asset record with pending status
    const assetId = await ctx.db.insert('assets', {
      versionId: args.versionId,
      productId: version.productId,
      ownerId: userId,
      organizationId: version.organizationId,
      type: 'image',
      assetGroup: args.assetGroup,
      status: 'pending',
      prompt: args.prompt,
      metadata: {},
    });

    // 5. Schedule async generation
    await ctx.scheduler.runAfter(0, internal.products.ai.node.actions.generateImage, {
      assetId,
      prompt: args.prompt,
      referenceAssetIds: args.referenceAssetIds,
    });

    return { assetId, status: 'pending' };
  },
});
```

### 3. Tool Call UI Components

```typescript
// Raj's Tool Call UI Pattern
export function GenerateAssetToolCall({ tool }: ToolComponentProps) {
  const args = tool.args as {
    prompt: string;
    assetGroup: string;
  };

  return (
    <div className="border rounded-lg p-4 bg-purple-50">
      <div className="flex items-center gap-2 mb-2">
        <Wand2 className="h-4 w-4 text-purple-600" />
        <span className="font-medium text-purple-900">
          Generating {args.assetGroup} asset
        </span>
      </div>
      <p className="text-sm text-purple-700">{args.prompt}</p>
      <div className="mt-2">
        <div className="animate-pulse bg-purple-200 h-2 rounded" />
      </div>
    </div>
  );
}

export function GenerateAssetToolResult({ tool }: ToolComponentProps) {
  const result = tool.result as {
    assetId: string;
    status: string;
    error?: string;
  };

  if (result.error) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-800">Generation failed: {result.error}</div>
      </div>
    );
  }

  return (
    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
      <div className="text-green-800">Asset generation started successfully</div>
    </div>
  );
}
```

---

## Testing & Quality Assurance

### 1. Pre-commit Quality Gates

```bash
# Raj's Quality Checklist - Run before every commit:
pnpm lint          # ESLint checks
pnpm build         # Full build test
pnpm type-check    # TypeScript compilation
```

### 2. Error Boundary Implementation

```typescript
// Raj's Error Boundary Pattern
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to monitoring service - no console.log
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: any) {
    // Send to error monitoring service
    // Never use console.log in production
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary p-4 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600">Please refresh the page or contact support</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. Component Testing Patterns

```typescript
// Raj's Testing Approach
// Focus on integration tests over unit tests
// Test user workflows, not implementation details
// Use TypeScript to catch errors at compile time

// Example test structure (if using Jest/React Testing Library)
describe('ProductCreation', () => {
  it('should create product with valid data', async () => {
    // Test the complete user flow
    // Mock Convex mutations
    // Verify UI updates correctly
  });

  it('should handle validation errors', async () => {
    // Test error handling
    // Verify error messages display
  });
});
```

---

## Migration & Maintenance

### 1. Schema Evolution Strategy

```typescript
// Raj's Migration Pattern
// convex/migrations/add_asset_groups.ts
export const addAssetGroupsToAssets = internalMutation({
  args: {},
  handler: async (ctx) => {
    const assets = await ctx.db.query('assets').collect();
    
    for (const asset of assets) {
      if (!asset.assetGroup) {
        // Provide sensible defaults based on existing data
        const assetGroup = asset.type === 'image' ? 'main' : 'misc';
        
        await ctx.db.patch(asset._id, {
          assetGroup,
        });
      }
    }
  },
});
```

### 2. Backward Compatibility

```typescript
// Raj's Compatibility Pattern
export const getProduct = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    // Handle legacy data gracefully
    return {
      ...product,
      // Use _creationTime as fallback for legacy createdAt
      createdAt: product._creationTime,
      // Provide defaults for new fields
      visibility: product.visibility ?? 'private',
      tags: product.tags ?? [],
    };
  },
});
```

### 3. Feature Flag Pattern

```typescript
// Raj's Feature Flag Approach
const FEATURE_FLAGS = {
  NEW_ASSET_GENERATION: true,
  ENHANCED_CHAT: false,
} as const;

export function useFeatureFlag(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}

// Usage in components
export function ProductPage() {
  const hasNewGeneration = useFeatureFlag('NEW_ASSET_GENERATION');
  
  return (
    <div>
      {hasNewGeneration ? (
        <NewGenerationInterface />
      ) : (
        <LegacyGenerationInterface />
      )}
    </div>
  );
}
```

---

## Key Takeaways

### The Raj Mindset

1. **Always Think About Edge Cases**: What if this is null? What if the user doesn't have permission? What if the network fails?

2. **Type Everything**: If TypeScript can't infer it, explicitly type it. Avoid `any` at all costs.

3. **Validate Early and Often**: Validate on the client, validate on the server, sanitize inputs.

4. **Structure for Scale**: Organize code so it's easy to find, understand, and modify.

5. **Performance Matters**: Use proper indexes, memoize expensive operations, limit query results.

6. **Security First**: Always authenticate, always authorize, never trust client input.

7. **Plan for Change**: Write code that can evolve, use migrations for schema changes.

8. **No Debug Code in Production**: Never commit console.log statements or debug code.

9. **Trust Convex**: Let Convex handle timestamps with `_creationTime`, don't add manual `createdAt`/`updatedAt`.

### Daily Practices

- **Before coding**: Plan the types and interfaces first
- **While coding**: Write defensive code with proper error handling
- **Before committing**: Run `pnpm lint` and `pnpm build` to catch issues
- **After merging**: Monitor for errors and performance issues

### Continuous Learning

- Study Raj's commit patterns and learn from each change
- Always ask "How would Raj handle this edge case?"
- Focus on writing code that your future self (and teammates) will thank you for
- Remember: Good code is not just working code, it's maintainable, secure, and performant code

This guide is a living document. Update it as you learn more patterns from Raj's work and as the codebase evolves.