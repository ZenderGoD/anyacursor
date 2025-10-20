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
import { Slider } from '@/components/ui/slider';
import { 
  Video, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Clock,
  Zap,
  Film
} from 'lucide-react';

interface VideoNodeData {
  url: string;
  thumbnailUrl?: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
}

export const VideoNode = memo(({ data, selected }: NodeProps) => {
  const { url, thumbnailUrl, prompt, status, metadata } = data as unknown as VideoNodeData;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState(prompt);
  const [editDuration, setEditDuration] = useState(metadata?.duration || 4);
  const [editSpeed, setEditSpeed] = useState(1.0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(metadata?.duration || 4);

  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-video-${Date.now()}.mp4`;
      link.click();
    }
  };

  const handleRegenerate = () => {
    console.log('Regenerating video:', prompt);
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    console.log('Saving video edit:', { editPrompt, editDuration, editSpeed, trimStart, trimEnd });
    setIsEditDialogOpen(false);
  };

  const handleTrim = () => {
    console.log('Trimming video from', trimStart, 'to', trimEnd);
  };

  const handleChangeSpeed = (speed: number) => {
    setEditSpeed(speed);
    console.log('Changing speed to:', speed);
  };

  const handleAddTransition = (type: string) => {
    console.log('Adding transition:', type);
  };

  const handleDelete = () => {
    console.log('Deleting video node');
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <Video className="w-4 h-4 text-red-500" />
            <span className="font-medium text-neutral-200">Video</span>
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

      {/* Video Content */}
      <div className="p-3">
        {status === 'completed' && url ? (
          <div className="space-y-3">
            <div className="relative">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  src={url}
                  poster={thumbnailUrl}
                  className="w-full h-48 object-cover"
                  muted={isMuted}
                  controls={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Custom Controls */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={togglePlay}
                    className="bg-black/50 hover:bg-black/70"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                </div>

                {/* Video Info Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleMute}
                      className="bg-black/50 hover:bg-black/70"
                    >
                      {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </Button>
                    {metadata?.duration && (
                      <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                        {formatDuration(metadata.duration)}
                      </span>
                    )}
                  </div>
                </div>
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
                {metadata.duration && (
                  <span>{formatDuration(metadata.duration)}</span>
                )}
                {metadata.format && <span>{metadata.format.toUpperCase()}</span>}
                {metadata.size && <span>{(metadata.size / 1024 / 1024).toFixed(1)} MB</span>}
              </div>
            )}
          </div>
        ) : status === 'processing' ? (
          <div className="flex items-center justify-center h-48 bg-neutral-800 rounded-lg">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-300">Generating video...</p>
              <p className="text-xs text-neutral-400 mt-1">This may take a few minutes</p>
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
              <Video className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
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
      
      {/* Video Editing Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-50">Edit Video</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Trim, adjust speed, and add effects to your video
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Video Preview</Label>
              <div className="relative bg-neutral-800 rounded-lg p-4">
                <video
                  src={url}
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                  muted={isMuted}
                />
              </div>
            </div>

            {/* Edit Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prompt Editing */}
              <div className="space-y-2">
                <Label htmlFor="edit-prompt" className="text-neutral-300">Edit Prompt</Label>
                <Input
                  id="edit-prompt"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-50"
                  placeholder="Describe how you want to modify the video..."
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Duration (seconds)</Label>
                <Input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="bg-neutral-800 border-neutral-700 text-neutral-50"
                  min="1"
                  max="60"
                />
              </div>

              {/* Speed Control */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Playback Speed: {editSpeed}x</Label>
                <Slider
                  value={[editSpeed]}
                  onValueChange={([value]) => handleChangeSpeed(value)}
                  min={0.25}
                  max={4}
                  step={0.25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>0.25x</span>
                  <span>1x</span>
                  <span>2x</span>
                  <span>4x</span>
                </div>
              </div>

              {/* Trim Controls */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Trim Video</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="trim-start" className="text-xs text-neutral-400">Start (s)</Label>
                      <Input
                        id="trim-start"
                        type="number"
                        value={trimStart}
                        onChange={(e) => setTrimStart(Number(e.target.value))}
                        className="bg-neutral-800 border-neutral-700 text-neutral-50"
                        min="0"
                        max={metadata?.duration || 4}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="trim-end" className="text-xs text-neutral-400">End (s)</Label>
                      <Input
                        id="trim-end"
                        type="number"
                        value={trimEnd}
                        onChange={(e) => setTrimEnd(Number(e.target.value))}
                        className="bg-neutral-800 border-neutral-700 text-neutral-50"
                        min="0"
                        max={metadata?.duration || 4}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTrim}
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <Scissors className="w-3 h-3 mr-1" />
                    Apply Trim
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Quick Actions</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTransition('fade')}
                  className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                >
                  <Film className="w-3 h-3 mr-1" />
                  Fade In/Out
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTransition('zoom')}
                  className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Zoom Effect
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleChangeSpeed(0.5)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Slow Motion
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleChangeSpeed(2)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Fast Forward
                </Button>
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

VideoNode.displayName = 'VideoNode';
