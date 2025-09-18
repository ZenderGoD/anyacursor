# Hunyuan 3D 2.1 Integration Technical Plan

## Implementation Overview

This technical plan outlines the step-by-step implementation of Hunyuan 3D 2.1 image-to-3D generation capabilities into the Anyacursor platform, following Raj's architectural patterns and leveraging MCP services for enhanced functionality.

## Architecture Design

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │    │   (Convex)      │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Chat UI       │◄──►│ • API Routes    │◄──►│ • Fal.ai API    │
│ • 3D Viewer     │    │ • Database      │    │ • File Storage  │
│ • MagicUI       │    │ • Real-time     │    │ • CDN           │
│ • React Three   │    │ • Auth          │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **3D Rendering**: React Three Fiber, Three.js
- **UI Components**: MagicUI, shadcn/ui
- **Backend**: Convex (real-time database, functions, storage)
- **External API**: Fal.ai Hunyuan 3D 2.1
- **File Storage**: Convex File Storage + CDN
- **State Management**: Convex reactive queries

## Database Schema Implementation

### Convex Schema Updates
```typescript
// convex/schema.ts additions
export default defineSchema({
  // ... existing tables ...
  
  generationRequests: defineTable({
    userId: v.id('users'),
    sessionId: v.id('chatSessions'),
    inputImageUrl: v.string(),
    parameters: v.object({
      numInferenceSteps: v.optional(v.number()),
      guidanceScale: v.optional(v.number()),
      octreeResolution: v.optional(v.number()),
      texturedMesh: v.optional(v.boolean()),
      seed: v.optional(v.number()),
    }),
    status: v.union(
      v.literal('queued'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    result: v.optional(v.object({
      modelGlb: v.optional(v.string()),
      modelGlbPbr: v.optional(v.string()),
      modelMesh: v.optional(v.string()),
      seed: v.number(),
    })),
    metadata: v.object({
      cost: v.number(),
      generationTime: v.number(),
      model: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId', '_creationTime'])
    .index('by_session', ['sessionId', '_creationTime'])
    .index('by_status', ['status', '_creationTime']),

  threeDAssets: defineTable({
    userId: v.id('users'),
    generationRequestId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    fileUrl: v.string(),
    fileSize: v.number(),
    format: v.union(v.literal('glb'), v.literal('gltf'), v.literal('obj')),
    hasPBR: v.boolean(),
    metadata: v.object({
      vertices: v.number(),
      faces: v.number(),
      materials: v.number(),
      textures: v.array(v.string()),
    }),
    tags: v.array(v.string()),
    visibility: v.union(
      v.literal('private'),
      v.literal('public'),
      v.literal('unlisted')
    ),
    createdAt: v.number(),
  })
    .index('by_user', ['userId', '_creationTime'])
    .index('by_visibility', ['visibility', '_creationTime'])
    .searchIndex('search_assets', {
      searchField: 'name',
      filterFields: ['userId', 'visibility', 'tags'],
    }),
});
```

## Backend Implementation

### Convex Functions

#### 1. Generation Request Management
```typescript
// convex/generationRequests.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createGenerationRequest = mutation({
  args: {
    sessionId: v.id('chatSessions'),
    inputImageUrl: v.string(),
    parameters: v.object({
      numInferenceSteps: v.optional(v.number()),
      guidanceScale: v.optional(v.number()),
      octreeResolution: v.optional(v.number()),
      texturedMesh: v.optional(v.boolean()),
      seed: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('UNAUTHORIZED');

    const requestId = await ctx.db.insert('generationRequests', {
      userId,
      sessionId: args.sessionId,
      inputImageUrl: args.inputImageUrl,
      parameters: args.parameters,
      status: 'queued',
      metadata: {
        cost: 0,
        generationTime: 0,
        model: 'hunyuan3d-v21',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Trigger async processing
    await ctx.scheduler.runAfter(0, 'generationRequests:processRequest', {
      requestId,
    });

    return requestId;
  },
});

export const getGenerationRequests = query({
  args: { sessionId: v.id('chatSessions') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('UNAUTHORIZED');

    return await ctx.db
      .query('generationRequests')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .collect();
  },
});
```

#### 2. Fal.ai API Integration
```typescript
// convex/generationRequests.ts (continued)
export const processRequest = action({
  args: { requestId: v.id('generationRequests') },
  handler: async (ctx, args) => {
    const request = await ctx.runQuery('generationRequests:getRequest', {
      requestId: args.requestId,
    });

    if (!request || request.status !== 'queued') {
      throw new ConvexError('INVALID_REQUEST');
    }

    // Update status to processing
    await ctx.runMutation('generationRequests:updateStatus', {
      requestId: args.requestId,
      status: 'processing',
    });

    try {
      const startTime = Date.now();
      
      // Call Fal.ai API
      const response = await fetch('https://fal.run/fal-ai/hunyuan3d-v21', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_image_url: request.inputImageUrl,
          num_inference_steps: request.parameters.numInferenceSteps || 50,
          guidance_scale: request.parameters.guidanceScale || 7.5,
          octree_resolution: request.parameters.octreeResolution || 256,
          textured_mesh: request.parameters.texturedMesh || false,
          seed: request.parameters.seed,
        }),
      });

      if (!response.ok) {
        throw new Error(`Fal.ai API error: ${response.statusText}`);
      }

      const result = await response.json();
      const generationTime = Date.now() - startTime;

      // Calculate cost (simplified)
      const baseCost = 0.1;
      const texturedCost = request.parameters.texturedMesh ? 0.3 : 0;
      const totalCost = baseCost + texturedCost;

      // Update request with result
      await ctx.runMutation('generationRequests:completeRequest', {
        requestId: args.requestId,
        result: {
          modelGlb: result.model_glb?.url,
          modelGlbPbr: result.model_glb_pbr?.url,
          modelMesh: result.model_mesh?.url,
          seed: result.seed,
        },
        metadata: {
          cost: totalCost,
          generationTime,
          model: 'hunyuan3d-v21',
        },
      });

      // Create 3D asset record
      await ctx.runMutation('threeDAssets:createAsset', {
        generationRequestId: args.requestId,
        name: `Generated 3D Model ${new Date().toLocaleDateString()}`,
        fileUrl: result.model_glb?.url || '',
        fileSize: result.model_glb?.file_size || 0,
        format: 'glb',
        hasPBR: !!result.model_glb_pbr,
        metadata: {
          vertices: 0, // Would need to parse GLB to get this
          faces: 0,
          materials: request.parameters.texturedMesh ? 1 : 0,
          textures: request.parameters.texturedMesh ? ['base_color'] : [],
        },
        tags: ['generated', 'hunyuan3d'],
        visibility: 'private',
      });

    } catch (error) {
      await ctx.runMutation('generationRequests:updateStatus', {
        requestId: args.requestId,
        status: 'failed',
      });
      throw error;
    }
  },
});
```

## Frontend Implementation

### 1. Chat Interface Integration

#### Image Upload Component
```typescript
// src/components/chat/ImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MagicCard } from '@/components/magicui/magic-card';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onGenerate3D: (imageUrl: string, parameters: GenerationParameters) => void;
}

export function ImageUpload({ onImageSelect, onGenerate3D }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [parameters, setParameters] = useState<GenerationParameters>({
    numInferenceSteps: 50,
    guidanceScale: 7.5,
    octreeResolution: 256,
    texturedMesh: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelect(file);
    }
  };

  const handleGenerate = () => {
    if (selectedImage && previewUrl) {
      onGenerate3D(previewUrl, parameters);
    }
  };

  return (
    <MagicCard className="w-full max-w-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected"
                className="max-w-full max-h-48 mx-auto rounded"
              />
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload an image for 3D generation
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {/* Parameters */}
          {selectedImage && (
            <div className="space-y-3">
              <h4 className="font-medium">Generation Parameters</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Inference Steps</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={parameters.numInferenceSteps}
                    onChange={(e) => setParameters(prev => ({
                      ...prev,
                      numInferenceSteps: parseInt(e.target.value)
                    }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Guidance Scale</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={parameters.guidanceScale}
                    onChange={(e) => setParameters(prev => ({
                      ...prev,
                      guidanceScale: parseFloat(e.target.value)
                    }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="texturedMesh"
                  checked={parameters.texturedMesh}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    texturedMesh: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="texturedMesh" className="text-sm">
                  Generate textured mesh (3x cost)
                </label>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {selectedImage && (
            <Button
              onClick={handleGenerate}
              className="w-full"
              disabled={!selectedImage}
            >
              Generate 3D Model
            </Button>
          )}
        </div>
      </CardContent>
    </MagicCard>
  );
}
```

#### 3D Model Viewer Component
```typescript
// src/components/chat/ThreeDViewer.tsx
'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { MagicCard } from '@/components/magicui/magic-card';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Settings } from 'lucide-react';
import * as THREE from 'three';

interface ThreeDViewerProps {
  modelUrl: string;
  hasPBR?: boolean;
  onDownload?: () => void;
}

function Model({ url, hasPBR }: { url: string; hasPBR?: boolean }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

export function ThreeDViewer({ modelUrl, hasPBR, onDownload }: ThreeDViewerProps) {
  const [showControls, setShowControls] = useState(false);
  const [lighting, setLighting] = useState<'studio' | 'outdoor' | 'indoor'>('studio');

  return (
    <MagicCard className="w-full h-96">
      <div className="relative h-full">
        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {lighting === 'studio' && (
              <Environment preset="studio" />
            )}
            {lighting === 'outdoor' && (
              <Environment preset="sunset" />
            )}
            {lighting === 'indoor' && (
              <Environment preset="apartment" />
            )}
            
            <Model url={modelUrl} hasPBR={hasPBR} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Suspense>
        </Canvas>

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowControls(!showControls)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          {showControls && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
              <div>
                <label className="text-xs font-medium">Lighting</label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value as any)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="studio">Studio</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="indoor">Indoor</option>
                </select>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onDownload}
                className="w-full"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="text-sm text-gray-600">Loading 3D model...</div>
        </div>
      </div>
    </MagicCard>
  );
}
```

### 2. Chat Message Integration

#### 3D Generation Message Component
```typescript
// src/components/chat/ThreeDGenerationMessage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ThreeDViewer } from './ThreeDViewer';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { Particles } from '@/components/magicui/particles';
import { Card, CardContent } from '@/components/ui/card';

interface ThreeDGenerationMessageProps {
  requestId: Id<'generationRequests'>;
  sessionId: Id<'chatSessions'>;
}

export function ThreeDGenerationMessage({ requestId, sessionId }: ThreeDGenerationMessageProps) {
  const [showProgress, setShowProgress] = useState(true);
  
  const request = useQuery(api.generationRequests.getRequest, { requestId });
  const asset = useQuery(api.threeDAssets.getByRequestId, { requestId });

  useEffect(() => {
    if (request?.status === 'completed') {
      setShowProgress(false);
    }
  }, [request?.status]);

  if (!request) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      {showProgress && request.status !== 'completed' && (
        <Card className="relative overflow-hidden">
          <Particles
            className="absolute inset-0"
            quantity={50}
            ease={80}
            color="#3b82f6"
          />
          <CardContent className="relative p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium">Generating 3D Model...</p>
                <p className="text-sm text-gray-600">
                  Status: {request.status}
                </p>
              </div>
            </div>
            
            {request.status === 'processing' && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Processing with Hunyuan 3D 2.1...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3D Model Display */}
      {request.status === 'completed' && request.result?.modelGlb && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Generated 3D Model</h4>
            <div className="flex space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Completed
              </span>
              {request.parameters.texturedMesh && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  PBR Materials
                </span>
              )}
            </div>
          </div>
          
          <ThreeDViewer
            modelUrl={request.result.modelGlb}
            hasPBR={!!request.result.modelGlbPbr}
            onDownload={() => {
              // Implement download functionality
              window.open(request.result?.modelGlb, '_blank');
            }}
          />
          
          <div className="text-xs text-gray-500">
            Generation time: {request.metadata.generationTime}ms | 
            Cost: ${request.metadata.cost.toFixed(3)}
          </div>
        </div>
      )}

      {/* Error State */}
      {request.status === 'failed' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 font-medium">Generation Failed</p>
            <p className="text-red-600 text-sm">
              There was an error generating your 3D model. Please try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## API Routes Implementation

### Next.js API Route for File Upload
```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Upload to Convex storage
    const storageId = await convex.mutation(api.files.upload, {
      file: await file.arrayBuffer(),
    });

    // Get the URL
    const url = await convex.query(api.files.getUrl, { storageId });

    return NextResponse.json({ url, storageId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

## Environment Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key
FAL_KEY=your_fal_ai_api_key
NEXT_PUBLIC_CDN_URL=your_cdn_url
```

### Package Dependencies
```json
{
  "dependencies": {
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.158.0",
    "@types/three": "^0.158.0",
    "convex": "^1.0.0",
    "magicui": "^0.1.0"
  }
}
```

## Testing Strategy

### Unit Tests
- Component rendering tests
- API integration tests
- Database operation tests
- Error handling tests

### Integration Tests
- End-to-end generation workflow
- File upload and processing
- 3D model rendering
- Real-time updates

### Performance Tests
- Large file handling
- Concurrent generation requests
- 3D model loading performance
- Memory usage optimization

## Deployment Plan

### Phase 1: Development Environment
1. Set up Convex development environment
2. Configure Fal.ai API access
3. Implement basic generation workflow
4. Test with sample images

### Phase 2: Staging Environment
1. Deploy to staging with full feature set
2. Load testing with multiple users
3. Performance optimization
4. Security review

### Phase 3: Production Deployment
1. Production environment setup
2. CDN configuration
3. Monitoring and analytics
4. User feedback collection

## Monitoring and Analytics

### Key Metrics
- Generation success rate
- Average processing time
- User engagement
- Error rates
- Cost tracking

### Monitoring Tools
- Convex dashboard for database metrics
- Fal.ai dashboard for API usage
- Custom analytics for user behavior
- Error tracking with Sentry

## Security Considerations

### Data Protection
- Image data encryption
- Secure API key management
- User data privacy
- GDPR compliance

### Access Control
- User authentication
- Rate limiting
- Resource quotas
- Audit logging

This technical plan provides a comprehensive roadmap for implementing Hunyuan 3D 2.1 integration into the Anyacursor platform, following Raj's architectural patterns and leveraging MCP services for enhanced functionality.



