# Interactive Canvas Drag & Drop System Specification

## Overview
Transform the chat window's canvas into an interactive workspace where users can drag and drop generated images from chat messages to the canvas, and receive AI-powered recommendations for image editing and 3D model generation.

## Core Features

### 1. Drag & Drop System
- **Source**: Chat message images (generated or uploaded)
- **Target**: AI Canvas component
- **Visual Feedback**: Drag preview, drop zones, hover states
- **Multi-Image Support**: Allow multiple images on canvas simultaneously

### 2. Interactive Canvas
- **Image Management**: Position, resize, rotate canvas images
- **Layer System**: Z-index management for overlapping images
- **Canvas Tools**: Pan, zoom, grid snap, alignment guides
- **Export Options**: Save canvas as image, individual images, or project file

### 3. AI-Powered Recommendations
- **Image Analysis**: Use Gemini 2.5 Flash to analyze canvas images
- **Smart Suggestions**: Context-aware recommendations based on image content
- **Action Buttons**: Dynamic overlay buttons for recommended actions
- **Learning System**: Improve recommendations based on user interactions

### 4. Image Editing Integration
- **Gemini Image Edit**: Direct integration with Google's Gemini 2.5 Flash image editing
- **In-Place Editing**: Edit images without leaving the canvas
- **Batch Operations**: Apply edits to multiple selected images
- **Undo/Redo**: Full history management for all canvas operations

### 5. 3D Model Generation
- **Image-to-3D**: Convert canvas images to 3D models using Hunyuan 3D 2.1
- **AR Preview**: Show 3D models in AR using Google model-viewer
- **3D Canvas**: Dedicated 3D workspace for model manipulation
- **Export Options**: Download 3D models in various formats

### 6. Video Generation
- **Image-to-Video**: Convert canvas images to dynamic videos using FAL's Framepack
- **Customizable Output**: Support for various aspect ratios (16:9, 4:3, 1:1, 9:16, 3:4)
- **Prompt-Guided**: Text prompts to guide video generation process
- **High Quality**: Up to 180 frames with adjustable resolution
- **Video Canvas**: Dedicated video workspace for playback and editing

## Technical Architecture

### Component Structure
```
src/components/canvas/
├── InteractiveCanvas.tsx          # Main canvas component
├── CanvasImage.tsx               # Individual image component
├── DragDropProvider.tsx          # Drag & drop context
├── RecommendationOverlay.tsx     # AI recommendation buttons
├── CanvasToolbar.tsx             # Canvas tools and controls
├── ImageEditor.tsx               # In-place image editing
├── ThreeDViewer.tsx              # 3D model viewer
├── VideoGenerator.tsx            # Video generation component
├── VideoPlayer.tsx               # Video playback component
└── index.ts                      # Exports
```

### State Management
```typescript
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
  generatedVideo?: string;
  generated3D?: string;
}
```

### API Integration
```typescript
// Gemini Image Analysis
interface ImageAnalysis {
  objects: DetectedObject[];
  style: string;
  colors: string[];
  mood: string;
  recommendations: Recommendation[];
}

// 3D Generation
interface ThreeDGeneration {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  modelUrl?: string;
  previewUrl?: string;
}

// Video Generation
interface VideoGeneration {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  aspectRatio?: string;
}
```

## User Experience Flow

### 1. Drag & Drop Process
1. User generates image in chat
2. Image appears in chat message with drag handle
3. User drags image to canvas area
4. Canvas shows drop zone with visual feedback
5. Image appears on canvas with initial position
6. AI analyzes image and shows recommendations

### 2. Canvas Interaction
1. User clicks on canvas image
2. Selection handles appear around image
3. Recommendation buttons overlay on image
4. User can resize, move, or rotate image
5. Context menu provides additional options

### 3. AI Recommendations
1. Gemini analyzes image content
2. System generates contextual recommendations
3. Buttons appear as overlay on image
4. User clicks recommendation button
5. Action executes (edit, 3D generation, video generation, etc.)
6. Results appear on canvas or in new workspace

### 4. Video Generation Process
1. User selects "Generate Video" recommendation
2. Video generation modal opens with prompt input
3. User enters video description and selects aspect ratio
4. FAL Framepack processes image-to-video conversion
5. Progress is shown with real-time updates
6. Generated video appears in video player
7. User can play, download, or share the video

## Implementation Details

### Drag & Drop Implementation
```typescript
// HTML5 Drag & Drop API with React
const handleDragStart = (e: DragEvent, imageData: ImageData) => {
  e.dataTransfer.setData('application/json', JSON.stringify(imageData));
  e.dataTransfer.effectAllowed = 'copy';
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
  addImageToCanvas(imageData);
};
```

### Canvas Rendering
```typescript
// Canvas with Konva.js for 2D graphics
import Konva from 'konva';

const Canvas = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [images, setImages] = useState<CanvasImage[]>([]);
  
  const renderCanvas = () => {
    return (
      <Stage ref={stageRef} width={800} height={600}>
        <Layer>
          {images.map(image => (
            <CanvasImageComponent key={image.id} image={image} />
          ))}
        </Layer>
      </Stage>
    );
  };
};
```

### AI Recommendation System
```typescript
const generateRecommendations = async (imageUrl: string) => {
  const analysis = await geminiClient.analyzeImage({
    image: imageUrl,
    features: ['objects', 'style', 'colors', 'mood']
  });
  
  const recommendations = await generateRecommendationsFromAnalysis(analysis);
  return recommendations;
};

// Video Generation with FAL Framepack
const generateVideoFromImage = async (imageUrl: string, prompt: string, options: VideoOptions) => {
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
  
  return result.data;
};
```

## Integration Points

### 1. Chat Interface Integration
- Modify `ModernMessageBubble` to add drag handles to images
- Update `ModernChatInterface` to include canvas toggle
- Add canvas state to chat context

### 2. AI Services Integration
- **Gemini 2.5 Flash**: Image analysis and editing
- **Hunyuan 3D 2.1**: 3D model generation
- **FAL Framepack**: Image-to-video generation
- **OpenRouter**: Text-based recommendations

### 3. Recommendation Types
- **Edit Image**: Gemini-powered image editing with text prompts
- **Generate 3D**: Convert image to 3D model using Hunyuan 3D 2.1
- **Generate Video**: Create dynamic video from image using FAL Framepack
- **Enhance Quality**: AI-powered image enhancement
- **Style Transfer**: Apply artistic styles to images
- **Background Removal**: Remove or replace image backgrounds
- **Object Addition**: Add objects to images
- **Color Correction**: Adjust colors and lighting

### 4. Canvas State Persistence
- Save canvas state to Convex database
- Implement real-time collaboration
- Version control for canvas projects

## Performance Considerations

### 1. Image Optimization
- Lazy loading for canvas images
- Image compression and resizing
- WebP format support
- Progressive loading

### 2. Canvas Performance
- Virtual rendering for large canvases
- Debounced recommendation generation
- Efficient re-rendering strategies
- Memory management for large images

### 3. AI Service Optimization
- Batch image analysis requests
- Caching for repeated analyses
- Progressive recommendation loading
- Fallback for service failures

## Security & Privacy

### 1. Image Handling
- Secure image upload and storage
- Privacy controls for shared canvases
- Data retention policies
- User consent for AI analysis

### 2. API Security
- Rate limiting for AI services
- Input validation and sanitization
- Secure API key management
- Error handling without data leakage

## Accessibility

### 1. Keyboard Navigation
- Full keyboard support for canvas operations
- Screen reader compatibility
- Focus management
- Keyboard shortcuts

### 2. Visual Accessibility
- High contrast mode support
- Zoom functionality
- Color-blind friendly recommendations
- Alternative text for all images

## Testing Strategy

### 1. Unit Tests
- Canvas component functionality
- Drag & drop operations
- AI recommendation generation
- State management

### 2. Integration Tests
- Chat to canvas workflow
- AI service integrations
- 3D model generation
- Real-time collaboration

### 3. User Testing
- Drag & drop usability
- Canvas interaction patterns
- AI recommendation accuracy
- Performance with large images

## Success Metrics

### 1. User Engagement
- Canvas usage frequency
- Drag & drop success rate
- Recommendation click-through rate
- Time spent on canvas

### 2. AI Performance
- Recommendation accuracy
- Image analysis quality
- 3D generation success rate
- User satisfaction scores

### 3. Technical Performance
- Canvas rendering performance
- AI service response times
- Error rates
- Memory usage optimization

## Future Enhancements

### 1. Advanced Features
- Collaborative canvas editing
- AI-powered image composition
- Style transfer between images
- Advanced 3D manipulation

### 2. Integration Expansions
- More AI model providers
- Additional 3D formats
- Video generation capabilities
- AR/VR integration

### 3. Platform Extensions
- Mobile app support
- Desktop application
- Browser extension
- API for third-party integrations

## Implementation Timeline

### Phase 1: Core Drag & Drop (Week 1-2)
- Basic drag & drop functionality
- Canvas image management
- Simple recommendation system

### Phase 2: AI Integration (Week 3-4)
- Gemini image analysis
- Smart recommendations
- Image editing integration

### Phase 3: 3D Features (Week 5-6)
- 3D model generation
- AR preview integration
- 3D canvas workspace

### Phase 5: Video Generation (Week 9-10)
- FAL Framepack integration
- Video generation from images
- Video player and editing tools

### Phase 6: Polish & Optimization (Week 11-12)
- Performance optimization
- Accessibility improvements
- User testing and refinement

## Conclusion

This interactive canvas system will transform the chat interface into a powerful creative workspace, enabling users to seamlessly move between conversation and creation. The AI-powered recommendations will guide users toward optimal creative decisions, while the drag & drop interface provides an intuitive way to manage visual content.

The integration of Gemini image editing and 3D model generation creates a comprehensive creative suite that leverages the latest AI capabilities to enhance user productivity and creativity.
