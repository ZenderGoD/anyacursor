'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ExternalLink
} from 'lucide-react';

interface ModelNodeData {
  modelUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    format?: string;
    vertices?: number;
    faces?: number;
    size?: number;
    materials?: number;
  };
}

export const ModelNode = memo(({ data, selected }: NodeProps) => {
  const { modelUrl, thumbnailUrl, prompt, status, metadata } = data as unknown as ModelNodeData;
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    if (modelUrl) {
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = `generated-model-${Date.now()}.glb`;
      link.click();
    }
  };

  const handleRegenerate = () => {
    console.log('Regenerating 3D model:', prompt);
  };

  const handleEdit = () => {
    console.log('Editing 3D model:', modelUrl);
  };

  const handleDelete = () => {
    console.log('Deleting 3D model node');
  };

  const handleRotate = () => {
    setRotation(prev => prev + 90);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Card className={`min-w-[350px] max-w-[450px] bg-neutral-900 border-neutral-800 ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="p-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-neutral-200">3D Model</span>
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                status === 'completed' ? 'bg-green-600' :
                status === 'processing' ? 'bg-yellow-600' :
                status === 'failed' ? 'bg-red-600' :
                'bg-gray-600'
              }`}
            >
              {status}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleRegenerate}>
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3D Model Content */}
      <div className="p-3">
        {status === 'completed' && modelUrl ? (
          <div className="space-y-3">
            <div className="text-sm text-neutral-300">
              <p className="font-medium mb-1">Prompt:</p>
              <p className="text-neutral-400">{prompt}</p>
            </div>

            {/* 3D Model Viewer */}
            <div className="relative bg-neutral-800 rounded-lg overflow-hidden">
              <div className="h-48 flex items-center justify-center relative">
                {thumbnailUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={thumbnailUrl}
                      alt="3D Model Preview"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `rotate(${rotation}deg) scale(${zoom})`,
                        transition: 'transform 0.3s ease',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                      3D Model
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Box className="w-12 h-12 text-neutral-500 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">3D Model Preview</p>
                    <p className="text-xs text-neutral-500">Click to view in 3D</p>
                  </div>
                )}
              </div>

              {/* 3D Controls */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleRotate}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleZoomIn}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleZoomOut}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
              </div>

              {/* View in 3D Button */}
              <div className="absolute bottom-2 right-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(modelUrl, '_blank')}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View 3D
                </Button>
              </div>
            </div>

            {metadata && (
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                {metadata.vertices && (
                  <div>
                    <span className="font-medium">Vertices:</span> {metadata.vertices.toLocaleString()}
                  </div>
                )}
                {metadata.faces && (
                  <div>
                    <span className="font-medium">Faces:</span> {metadata.faces.toLocaleString()}
                  </div>
                )}
                {metadata.materials && (
                  <div>
                    <span className="font-medium">Materials:</span> {metadata.materials}
                  </div>
                )}
                {metadata.format && (
                  <div>
                    <span className="font-medium">Format:</span> {metadata.format.toUpperCase()}
                  </div>
                )}
                {metadata.size && (
                  <div className="col-span-2">
                    <span className="font-medium">Size:</span> {(metadata.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                )}
              </div>
            )}
          </div>
        ) : status === 'processing' ? (
          <div className="flex items-center justify-center h-48 bg-neutral-800 rounded-lg">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-300">Generating 3D model...</p>
              <p className="text-xs text-neutral-400 mt-1">This may take several minutes</p>
            </div>
          </div>
        ) : status === 'failed' ? (
          <div className="flex items-center justify-center h-48 bg-red-900/20 rounded-lg border border-red-800">
            <div className="text-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">!</span>
              </div>
              <p className="text-sm text-red-300">Generation failed</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-neutral-800 rounded-lg">
            <div className="text-center">
              <Box className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Waiting to start...</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {status === 'completed' && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleDownload}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRegenerate}
              className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});

ModelNode.displayName = 'ModelNode';
