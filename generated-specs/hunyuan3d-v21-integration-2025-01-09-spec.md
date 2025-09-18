# Hunyuan 3D 2.1 Integration Specification

## Overview

This specification outlines the integration of Hunyuan 3D 2.1 image-to-3D generation capabilities into the Anyacursor platform. The feature will enable users to upload 2D images and generate high-quality 3D models with Physically-Based Rendering (PBR) materials through a seamless chat interface.

## Feature Description

### Core Functionality
- **Image-to-3D Generation**: Convert 2D images to 3D models using Hunyuan 3D 2.1
- **PBR Material Support**: Generate both white mesh and textured mesh variants
- **Real-time Processing**: Live progress tracking and status updates
- **Interactive 3D Viewer**: Built-in 3D model preview and manipulation
- **Asset Management**: Store, organize, and manage generated 3D assets

### User Experience Flow
1. User uploads an image through the chat interface
2. System validates image and shows generation options
3. User configures generation parameters (optional)
4. System processes image through Hunyuan 3D 2.1 API
5. Real-time progress updates via chat interface
6. Generated 3D model displayed in interactive viewer
7. User can download, share, or integrate the 3D asset

## Technical Architecture

### API Integration
- **Primary Service**: Fal.ai Hunyuan 3D 2.1 endpoint
- **Endpoint**: `https://fal.run/fal-ai/hunyuan3d-v21`
- **Authentication**: Fal.ai API key management
- **Rate Limiting**: Implemented with user credit system

### Database Schema (Convex)
```typescript
// New table for 3D generation requests
generationRequests: {
  id: string;
  userId: Id<'users'>;
  sessionId: Id<'chatSessions'>;
  inputImageUrl: string;
  parameters: {
    numInferenceSteps?: number;
    guidanceScale?: number;
    octreeResolution?: number;
    texturedMesh?: boolean;
    seed?: number;
  };
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: {
    modelGlb?: string;
    modelGlbPbr?: string;
    modelMesh?: string;
    seed: number;
  };
  metadata: {
    cost: number;
    generationTime: number;
    model: string;
  };
  createdAt: number;
  updatedAt: number;
}

// New table for 3D assets
threeDAssets: {
  id: string;
  userId: Id<'users'>;
  generationRequestId: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  format: 'glb' | 'gltf' | 'obj';
  hasPBR: boolean;
  metadata: {
    vertices: number;
    faces: number;
    materials: number;
    textures: string[];
  };
  tags: string[];
  visibility: 'private' | 'public' | 'unlisted';
  createdAt: number;
}
```

### Frontend Components

#### MagicUI Integration
- **MagicCard**: For 3D model preview cards with hover effects
- **AnimatedBeam**: For showing generation progress and data flow
- **BorderBeam**: For highlighting active generation processes
- **Particles**: For loading states and visual feedback
- **Confetti**: For successful generation celebrations

#### React Three Fiber Integration
- **3D Model Viewer**: Interactive 3D scene with orbit controls
- **Material Inspector**: PBR material property visualization
- **Lighting Controls**: Adjustable scene lighting
- **Export Options**: Multiple format download capabilities

### Chat Interface Integration
- **Image Upload**: Drag-and-drop or click-to-upload interface
- **Parameter Configuration**: Inline form for generation settings
- **Progress Tracking**: Real-time status updates with MagicUI animations
- **Result Display**: Embedded 3D viewer within chat messages
- **Asset Actions**: Download, share, and manage generated assets

## API Specifications

### Hunyuan 3D 2.1 Parameters
```typescript
interface Hunyuan3DParams {
  input_image_url: string;           // Required: Image URL
  seed?: number;                     // Optional: Random seed
  num_inference_steps?: number;      // Default: 50, Range: 1-50
  guidance_scale?: number;           // Default: 7.5, Range: 0-20
  octree_resolution?: number;        // Default: 256, Range: 1-1024
  textured_mesh?: boolean;          // Default: false (3x cost if true)
}
```

### Response Format
```typescript
interface Hunyuan3DResponse {
  model_glb: {
    file_size: number;
    file_name: string;
    content_type: string;
    url: string;
  };
  model_glb_pbr?: {
    file_size: number;
    file_name: string;
    content_type: string;
    url: string;
  };
  model_mesh: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  seed: number;
}
```

## User Interface Design

### Chat Integration
- **Upload Button**: Prominent upload interface in chat input
- **Image Preview**: Thumbnail preview before generation
- **Parameter Panel**: Collapsible advanced options
- **Progress Indicator**: Animated progress with MagicUI effects
- **3D Viewer**: Embedded Three.js scene in chat message
- **Action Buttons**: Download, share, regenerate options

### 3D Viewer Features
- **Orbit Controls**: Mouse/touch navigation
- **Material Toggle**: Switch between white mesh and PBR
- **Lighting Presets**: Studio, outdoor, indoor lighting
- **Export Formats**: GLB, GLTF, OBJ download options
- **Fullscreen Mode**: Immersive 3D viewing experience

## Security & Performance

### Security Measures
- **Image Validation**: File type, size, and content validation
- **Rate Limiting**: Per-user generation limits
- **Cost Controls**: Credit-based usage tracking
- **Secure Storage**: Encrypted asset storage
- **Access Control**: User-based asset permissions

### Performance Optimization
- **Async Processing**: Non-blocking generation requests
- **Caching**: Generated model caching for repeated requests
- **CDN Integration**: Fast asset delivery
- **Progressive Loading**: Streaming 3D model loading
- **Memory Management**: Efficient Three.js scene cleanup

## Error Handling

### Common Error Scenarios
- **Invalid Image Format**: Clear error messages with supported formats
- **API Rate Limits**: Graceful degradation with retry options
- **Generation Failures**: Detailed error reporting and recovery
- **Storage Issues**: Fallback storage options
- **Network Problems**: Offline mode with queued requests

### User Feedback
- **Loading States**: Clear progress indicators
- **Error Messages**: User-friendly error descriptions
- **Retry Options**: Easy retry mechanisms
- **Support Integration**: Direct help and support access

## Integration Points

### Existing Systems
- **Chat Interface**: Seamless integration with current chat system
- **User Management**: Integration with existing user authentication
- **Credit System**: Usage tracking and billing integration
- **Asset Management**: Integration with existing file storage
- **Analytics**: Usage tracking and performance monitoring

### MCP Services
- **Convex MCP**: Real-time database operations and schema management
- **MagicUI MCP**: Enhanced UI components and animations
- **ReactBits MCP**: React patterns and utilities for 3D integration
- **Slack MCP**: Notifications and team collaboration features

## Success Metrics

### User Engagement
- **Generation Volume**: Number of 3D models generated per day
- **User Retention**: Return usage of 3D generation feature
- **Feature Adoption**: Percentage of users trying 3D generation
- **Asset Downloads**: Number of generated assets downloaded

### Technical Performance
- **Generation Success Rate**: Percentage of successful generations
- **Average Generation Time**: Time from request to completion
- **API Response Times**: Fal.ai API performance monitoring
- **Error Rates**: System and API error tracking

### Business Impact
- **Credit Usage**: Revenue from 3D generation feature
- **User Satisfaction**: Feedback and rating scores
- **Feature Requests**: User-requested enhancements
- **Integration Success**: Successful asset usage in projects

## Future Enhancements

### Phase 2 Features
- **Batch Processing**: Multiple image generation
- **Custom Materials**: User-defined material libraries
- **Animation Support**: Animated 3D model generation
- **Collaborative Editing**: Multi-user 3D model editing

### Advanced Capabilities
- **AI-Powered Optimization**: Automatic parameter tuning
- **Style Transfer**: Apply artistic styles to 3D models
- **Texture Enhancement**: AI-powered texture improvement
- **Model Variants**: Generate multiple variations

## Implementation Timeline

### Phase 1: Core Integration (2-3 weeks)
- Fal.ai API integration
- Basic image upload and generation
- Simple 3D viewer implementation
- Chat interface integration

### Phase 2: Enhanced UX (1-2 weeks)
- MagicUI component integration
- Advanced parameter controls
- Improved 3D viewer features
- Asset management system

### Phase 3: Polish & Optimization (1 week)
- Performance optimization
- Error handling improvements
- User feedback integration
- Analytics and monitoring

## Conclusion

The Hunyuan 3D 2.1 integration will significantly enhance the Anyacursor platform by providing users with powerful image-to-3D generation capabilities. The feature leverages modern web technologies, real-time communication, and enhanced UI components to deliver a seamless and engaging user experience. The implementation follows Raj's architectural patterns and integrates seamlessly with existing MCP services for optimal performance and maintainability.



