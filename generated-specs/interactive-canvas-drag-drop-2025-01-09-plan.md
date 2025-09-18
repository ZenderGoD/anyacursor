# Interactive Canvas Drag & Drop Implementation Plan

## Technical Implementation Strategy

### Phase 1: Foundation & Drag & Drop System (Week 1-2)

#### 1.1 Canvas Infrastructure Setup
```typescript
// New file: src/components/canvas/InteractiveCanvas.tsx
interface CanvasState {
  images: CanvasImage[];
  selectedImages: string[];
  canvasSettings: CanvasSettings;
  recommendations: Recommendation[];
  history: CanvasAction[];
  currentTool: CanvasTool;
}

interface CanvasImage {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  metadata: ImageMetadata;
  recommendations: Recommendation[];
}
```

#### 1.2 Drag & Drop Implementation
```typescript
// New file: src/components/canvas/DragDropProvider.tsx
const DragDropProvider = ({ children }: { children: React.ReactNode }) => {
  const [draggedImage, setDraggedImage] = useState<ImageData | null>(null);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  
  const handleDragStart = (e: DragEvent, imageData: ImageData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(imageData));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedImage(imageData);
  };
  
  const handleDrop = (e: DragEvent, canvasId: string) => {
    e.preventDefault();
    const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
    addImageToCanvas(canvasId, imageData);
  };
  
  return (
    <DragDropContext.Provider value={{ handleDragStart, handleDrop, draggedImage }}>
      {children}
    </DragDropContext.Provider>
  );
};
```

#### 1.3 Chat Message Integration
```typescript
// Modify: src/components/chat/modern-chat-interface.tsx
const ModernMessageBubble = ({ message }: { message: any }) => {
  const { handleDragStart } = useDragDrop();
  
  const renderImageWithDragHandle = (image: any) => (
    <div 
      className="relative group cursor-move"
      draggable
      onDragStart={(e) => handleDragStart(e, {
        src: image.url,
        metadata: { prompt: message.parts[0]?.text, timestamp: Date.now() }
      })}
    >
      <img src={image.url} alt="Generated image" className="rounded-lg" />
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 bg-blue-500/80 rounded-full flex items-center justify-center">
          <Move className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
};
```

### Phase 2: AI-Powered Recommendations (Week 3-4)

#### 2.1 Gemini Image Analysis Integration
```typescript
// New file: src/lib/gemini-image-analysis.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const analyzeImage = async (imageUrl: string): Promise<ImageAnalysis> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
    Analyze this image and provide:
    1. Objects detected
    2. Style/artistic elements
    3. Color palette
    4. Mood/atmosphere
    5. Suggested editing actions
    6. 3D conversion potential
    
    Return as JSON with the following structure:
    {
      "objects": ["object1", "object2"],
      "style": "style_description",
      "colors": ["#color1", "#color2"],
      "mood": "mood_description",
      "editingSuggestions": ["suggestion1", "suggestion2"],
      "threeDPotential": "high|medium|low"
    }
  `;
  
  const result = await model.generateContent([prompt, { inlineData: { data: imageUrl, mimeType: "image/jpeg" } }]);
  return JSON.parse(result.response.text());
};
```

#### 2.2 Recommendation System
```typescript
// New file: src/components/canvas/RecommendationOverlay.tsx
const RecommendationOverlay = ({ image, recommendations }: { image: CanvasImage; recommendations: Recommendation[] }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`absolute top-2 right-2 transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="flex flex-col gap-2">
        {recommendations.map((rec, index) => (
          <Button
            key={rec.id}
            size="sm"
            className={`${rec.color} text-white border-0 shadow-lg hover:scale-105 transition-transform`}
            onClick={() => executeRecommendation(rec, image)}
          >
            <rec.icon className="w-3 h-3 mr-1" />
            {rec.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
```

#### 2.3 Canvas Image Component
```typescript
// New file: src/components/canvas/CanvasImage.tsx
const CanvasImage = ({ image, onUpdate }: { image: CanvasImage; onUpdate: (image: CanvasImage) => void }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  useEffect(() => {
    // Generate recommendations when image is added to canvas
    const generateRecommendations = async () => {
      const analysis = await analyzeImage(image.src);
      const recs = await generateRecommendationsFromAnalysis(analysis);
      setRecommendations(recs);
    };
    
    generateRecommendations();
  }, [image.src]);
  
  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: image.position.x,
        top: image.position.y,
        width: image.size.width,
        height: image.size.height,
        transform: `rotate(${image.rotation}deg)`,
        zIndex: image.zIndex
      }}
      onClick={() => setIsSelected(!isSelected)}
    >
      <img src={image.src} alt="Canvas image" className="w-full h-full object-cover rounded-lg" />
      {isSelected && <RecommendationOverlay image={image} recommendations={recommendations} />}
    </div>
  );
};
```

### Phase 3: Image Editing Integration (Week 5-6)

#### 3.1 Gemini Image Editing
```typescript
// New file: src/lib/gemini-image-editing.ts
export const editImageWithGemini = async (
  imageUrl: string, 
  editPrompt: string
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
    Edit this image according to the following instructions: ${editPrompt}
    
    Maintain the original composition and style while applying the requested changes.
    Return the edited image as a base64 encoded string.
  `;
  
  const result = await model.generateContent([prompt, { inlineData: { data: imageUrl, mimeType: "image/jpeg" } }]);
  
  // Extract base64 image from response
  const base64Image = extractBase64FromResponse(result.response.text());
  return `data:image/jpeg;base64,${base64Image}`;
};
```

#### 3.2 In-Place Image Editor
```typescript
// New file: src/components/canvas/ImageEditor.tsx
const ImageEditor = ({ image, onSave, onCancel }: { image: CanvasImage; onSave: (editedImage: string) => void; onCancel: () => void }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = async () => {
    setIsEditing(true);
    try {
      const editedImage = await editImageWithGemini(image.src, editPrompt);
      onSave(editedImage);
    } catch (error) {
      console.error('Image editing failed:', error);
    } finally {
      setIsEditing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-white text-lg font-semibold mb-4">Edit Image</h3>
        <Textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          placeholder="Describe how you want to edit this image..."
          className="mb-4"
        />
        <div className="flex gap-2">
          <Button onClick={handleEdit} disabled={isEditing || !editPrompt.trim()}>
            {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Edit Image'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};
```

### Phase 4: 3D Model Generation (Week 7-8)

#### 4.1 3D Generation Integration
```typescript
// New file: src/lib/three-d-generation.ts
export const generateThreeDFromImage = async (imageUrl: string): Promise<ThreeDGeneration> => {
  const response = await fetch('/api/threeD/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl,
      prompt: 'Convert this image to a 3D model',
      model: 'hunyuan3d-v21'
    })
  });
  
  const result = await response.json();
  return result;
};
```

#### 4.2 3D Viewer Component
```typescript
// New file: src/components/canvas/ThreeDViewer.tsx
const ThreeDViewer = ({ modelUrl, onClose }: { modelUrl: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full h-3/4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">3D Model Viewer</h3>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        <div className="h-full">
          <model-viewer
            src={modelUrl}
            alt="3D Model"
            auto-rotate
            camera-controls
            ar
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
```

### Phase 5: Video Generation (Week 9-10)

#### 5.1 FAL Framepack Integration
```typescript
// New file: src/lib/fal-video-generation.ts
import { fal } from "@fal-ai/client";

export const generateVideoFromImage = async (
  imageUrl: string, 
  prompt: string,
  options: VideoGenerationOptions
): Promise<VideoGeneration> => {
  const result = await fal.subscribe("fal-ai/framepack", {
    input: {
      image_url: imageUrl,
      prompt: prompt,
      aspect_ratio: options.aspectRatio || "16:9",
      resolution: options.resolution || "480p",
      num_frames: options.numFrames || 60
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  
  return {
    requestId: result.requestId,
    status: 'completed',
    videoUrl: result.data.video.url,
    thumbnailUrl: result.data.thumbnail?.url,
    duration: result.data.duration,
    aspectRatio: options.aspectRatio
  };
};

interface VideoGenerationOptions {
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "3:4";
  resolution?: "480p" | "720p" | "1080p";
  numFrames?: number;
}
```

#### 5.2 Video Generation Component
```typescript
// New file: src/components/canvas/VideoGenerator.tsx
const VideoGenerator = ({ image, onVideoGenerated, onCancel }: { 
  image: CanvasImage; 
  onVideoGenerated: (videoUrl: string) => void; 
  onCancel: () => void;
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<VideoGenerationOptions['aspectRatio']>('16:9');
  const [resolution, setResolution] = useState<VideoGenerationOptions['resolution']>('480p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateVideoFromImage(image.src, prompt, {
        aspectRatio,
        resolution,
        numFrames: 60
      });
      
      onVideoGenerated(result.videoUrl!);
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-white text-lg font-semibold mb-4">Generate Video</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Video Description</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              className="mb-4"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="3:4">3:4 (Portrait)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
          </div>
          
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating video...</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Video'}
            </Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 5.3 Video Player Component
```typescript
// New file: src/components/canvas/VideoPlayer.tsx
const VideoPlayer = ({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'generated-video.mp4';
    link.click();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full h-3/4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">Generated Video</h3>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        
        <div className="h-full">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain rounded-lg"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button onClick={handlePlayPause} className="flex items-center gap-2">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Phase 6: Canvas State Management (Week 11-12)

#### 6.1 Canvas Context Provider
```typescript
// New file: src/components/canvas/CanvasContext.tsx
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    images: [],
    selectedImages: [],
    canvasSettings: defaultCanvasSettings,
    recommendations: [],
    history: [],
    currentTool: 'select'
  });
  
  const addImageToCanvas = (imageData: ImageData) => {
    const newImage: CanvasImage = {
      id: generateId(),
      src: imageData.src,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      rotation: 0,
      zIndex: canvasState.images.length,
      metadata: imageData.metadata,
      recommendations: []
    };
    
    setCanvasState(prev => ({
      ...prev,
      images: [...prev.images, newImage],
      history: [...prev.history, { type: 'add_image', data: newImage }]
    }));
  };
  
  const updateImage = (imageId: string, updates: Partial<CanvasImage>) => {
    setCanvasState(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === imageId ? { ...img, ...updates } : img
      ),
      history: [...prev.history, { type: 'update_image', data: { imageId, updates } }]
    }));
  };
  
  return (
    <CanvasContext.Provider value={{ canvasState, addImageToCanvas, updateImage }}>
      {children}
    </CanvasContext.Provider>
  );
};
```

#### 6.2 Canvas Persistence
```typescript
// New file: src/lib/canvas-persistence.ts
export const saveCanvasToConvex = async (canvasState: CanvasState, userId: string) => {
  const canvasData = {
    userId,
    images: canvasState.images,
    settings: canvasState.canvasSettings,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  return await convex.mutation(api.canvas.saveCanvas, canvasData);
};

export const loadCanvasFromConvex = async (canvasId: string) => {
  return await convex.query(api.canvas.getCanvas, { canvasId });
};
```

### Phase 7: Performance Optimization (Week 13-14)

#### 7.1 Image Optimization
```typescript
// New file: src/lib/image-optimization.ts
export const optimizeImageForCanvas = async (imageUrl: string): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = Math.min(img.width, 800);
      canvas.height = Math.min(img.height, 800);
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const optimizedUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(optimizedUrl);
    };
    img.src = imageUrl;
  });
};
```

#### 6.2 Virtual Rendering
```typescript
// New file: src/components/canvas/VirtualCanvas.tsx
const VirtualCanvas = ({ images }: { images: CanvasImage[] }) => {
  const [visibleImages, setVisibleImages] = useState<CanvasImage[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateVisibleImages = () => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const visible = images.filter(img => 
        img.position.x < rect.width && 
        img.position.y < rect.height &&
        img.position.x + img.size.width > 0 &&
        img.position.y + img.size.height > 0
      );
      
      setVisibleImages(visible);
    };
    
    updateVisibleImages();
    window.addEventListener('scroll', updateVisibleImages);
    return () => window.removeEventListener('scroll', updateVisibleImages);
  }, [images]);
  
  return (
    <div ref={canvasRef} className="relative w-full h-full">
      {visibleImages.map(image => (
        <CanvasImage key={image.id} image={image} />
      ))}
    </div>
  );
};
```

## Integration with Existing System

### 1. Chat Interface Updates
```typescript
// Modify: src/components/chat/modern-chat-interface.tsx
const ModernChatInterface = () => {
  const [showCanvas, setShowCanvas] = useState(false);
  
  return (
    <div className="flex h-screen">
      <div className={`${showCanvas ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        {/* Existing chat interface */}
      </div>
      {showCanvas && (
        <div className="w-1/2 border-l border-gray-700">
          <InteractiveCanvas />
        </div>
      )}
      <Button
        onClick={() => setShowCanvas(!showCanvas)}
        className="fixed top-4 right-4 z-50"
      >
        {showCanvas ? 'Hide Canvas' : 'Show Canvas'}
      </Button>
    </div>
  );
};
```

### 2. API Route Updates
```typescript
// New file: src/app/api/canvas/analyze/route.ts
export async function POST(request: Request) {
  const { imageUrl } = await request.json();
  
  try {
    const analysis = await analyzeImage(imageUrl);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
```

### 3. Convex Schema Updates
```typescript
// Modify: convex/schema.ts
export default defineSchema({
  // ... existing tables
  canvas: defineTable({
    userId: v.id('users'),
    images: v.array(v.object({
      id: v.string(),
      src: v.string(),
      position: v.object({ x: v.number(), y: v.number() }),
      size: v.object({ width: v.number(), height: v.number() }),
      rotation: v.number(),
      zIndex: v.number(),
      metadata: v.any(),
      recommendations: v.array(v.any())
    })),
    settings: v.any(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),
  
  canvasRecommendations: defineTable({
    imageId: v.string(),
    userId: v.id('users'),
    recommendations: v.array(v.object({
      id: v.string(),
      type: v.string(),
      label: v.string(),
      action: v.string(),
      confidence: v.number()
    })),
    createdAt: v.number()
  }).index('by_image', ['imageId'])
});
```

## Testing Strategy

### 1. Unit Tests
```typescript
// tests/canvas.test.ts
describe('Canvas Functionality', () => {
  test('should add image to canvas', () => {
    const { result } = renderHook(() => useCanvas());
    const imageData = { src: 'test.jpg', metadata: {} };
    
    act(() => {
      result.current.addImageToCanvas(imageData);
    });
    
    expect(result.current.canvasState.images).toHaveLength(1);
  });
  
  test('should generate recommendations', async () => {
    const recommendations = await generateRecommendations('test-image.jpg');
    expect(recommendations).toHaveLength(3);
    expect(recommendations[0]).toHaveProperty('type');
  });
});
```

### 2. Integration Tests
```typescript
// tests/canvas-integration.test.ts
describe('Canvas Integration', () => {
  test('should drag image from chat to canvas', async () => {
    render(<ChatWithCanvas />);
    
    const image = screen.getByAltText('Generated image');
    const canvas = screen.getByTestId('canvas');
    
    fireEvent.dragStart(image);
    fireEvent.dragOver(canvas);
    fireEvent.drop(canvas);
    
    expect(screen.getByTestId('canvas-image')).toBeInTheDocument();
  });
});
```

## Deployment Considerations

### 1. Environment Variables
```bash
# .env.local
GOOGLE_AI_API_KEY=your_gemini_api_key
FAL_API_KEY=your_fal_api_key
NEXT_PUBLIC_CONVEX_URL=your_convex_url
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Dependencies
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@fal-ai/client": "^0.15.0",
    "konva": "^9.2.0",
    "react-konva": "^18.2.10",
    "@google/model-viewer": "^3.4.0"
  }
}
```

### 3. Performance Monitoring
```typescript
// src/lib/performance-monitoring.ts
export const trackCanvasPerformance = (action: string, duration: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'canvas_performance', {
      action,
      duration,
      timestamp: Date.now()
    });
  }
};
```

## Success Metrics

### 1. User Engagement
- Canvas usage rate: >30% of chat users
- Drag & drop success rate: >95%
- Recommendation click-through rate: >20%
- Average session time increase: >50%

### 2. Technical Performance
- Canvas rendering time: <100ms
- AI analysis response time: <3s
- 3D generation success rate: >90%
- Memory usage: <500MB for 10 images

### 3. User Satisfaction
- User rating: >4.5/5
- Feature adoption rate: >60%
- Support ticket reduction: >25%
- User retention increase: >20%

This implementation plan provides a comprehensive roadmap for building the interactive canvas system, with clear phases, technical specifications, and success metrics. The modular approach allows for iterative development and testing, ensuring a robust and user-friendly final product.
