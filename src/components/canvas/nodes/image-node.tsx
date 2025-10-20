'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Image, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  Crop,
  RotateCw,
  Palette,
  Wand2
} from 'lucide-react';

interface ImageNodeData {
  url: string;
  thumbnailUrl?: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
}

export const ImageNode = memo(({ data, selected }: NodeProps) => {
  const { url, thumbnailUrl, prompt, status, metadata } = data as unknown as ImageNodeData;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState(prompt);
  const [editStyle, setEditStyle] = useState('photorealistic');
  const [editSize, setEditSize] = useState('1024x1024');

  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.jpg`;
      link.click();
    }
  };

  const handleRegenerate = () => {
    // TODO: Implement regeneration logic
    console.log('Regenerating image:', prompt);
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // TODO: Implement save edit logic
    console.log('Saving edit:', { editPrompt, editStyle, editSize });
    setIsEditDialogOpen(false);
  };

  const handleApplyFilter = (filter: string) => {
    // TODO: Implement filter application
    console.log('Applying filter:', filter);
  };

  const handleCrop = () => {
    // TODO: Implement crop functionality
    console.log('Cropping image');
  };

  const handleRotate = () => {
    // TODO: Implement rotate functionality
    console.log('Rotating image');
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Deleting image node');
  };

  return (
    <Card className={`min-w-[300px] max-w-[400px] bg-neutral-900 border-neutral-800 ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="p-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-neutral-200">Image</span>
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

      {/* Image Content */}
      <div className="p-3">
        {status === 'completed' && url ? (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={thumbnailUrl || url}
                alt={prompt}
                className="w-full h-48 object-cover rounded-lg border border-neutral-700"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo=';
                }}
              />
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(url, '_blank')}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-neutral-300">
              <p className="font-medium mb-1">Prompt:</p>
              <p className="text-neutral-400">{prompt}</p>
            </div>

            {metadata && (
              <div className="flex gap-2 text-xs text-neutral-400">
                {metadata.width && metadata.height && (
                  <span>{metadata.width} × {metadata.height}</span>
                )}
                {metadata.format && <span>{metadata.format.toUpperCase()}</span>}
                {metadata.size && <span>{(metadata.size / 1024).toFixed(1)} KB</span>}
              </div>
            )}
          </div>
        ) : status === 'processing' ? (
          <div className="flex items-center justify-center h-48 bg-neutral-800 rounded-lg">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-300">Generating image...</p>
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
              <Image className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
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
      
      {/* Image Editing Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-50">Edit Image</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Modify your image with AI-powered editing tools
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Image Preview */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Current Image</Label>
              <div className="relative">
                <img
                  src={thumbnailUrl || url}
                  alt={prompt}
                  className="w-full h-48 object-cover rounded-lg border border-neutral-700"
                />
              </div>
            </div>

            {/* Edit Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prompt Editing */}
              <div className="space-y-2">
                <Label htmlFor="edit-prompt" className="text-neutral-300">Edit Prompt</Label>
                <Input
                  id="edit-prompt"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-50"
                  placeholder="Describe how you want to modify the image..."
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Style</Label>
                <Select value={editStyle} onValueChange={setEditStyle}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="oil-painting">Oil Painting</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Selection */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Size</Label>
                <Select value={editSize} onValueChange={setEditSize}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="512x512">512 × 512</SelectItem>
                    <SelectItem value="1024x1024">1024 × 1024</SelectItem>
                    <SelectItem value="1024x768">1024 × 768</SelectItem>
                    <SelectItem value="768x1024">768 × 1024</SelectItem>
                    <SelectItem value="1920x1080">1920 × 1080</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Quick Actions</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplyFilter('enhance')}
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Enhance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCrop}
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <Crop className="w-3 h-3 mr-1" />
                    Crop
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRotate}
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <RotateCw className="w-3 h-3 mr-1" />
                    Rotate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplyFilter('colorize')}
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <Palette className="w-3 h-3 mr-1" />
                    Colorize
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

ImageNode.displayName = 'ImageNode';
