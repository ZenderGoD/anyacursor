'use client';

import { memo, useState, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

interface AudioNodeData {
  url: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    duration?: number;
    format?: string;
    size?: number;
    voice?: string;
  };
}

export const AudioNode = memo(({ data, selected }: NodeProps) => {
  const { url, prompt, status, metadata } = data as unknown as AudioNodeData;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-audio-${Date.now()}.mp3`;
      link.click();
    }
  };

  const handleRegenerate = () => {
    console.log('Regenerating audio:', prompt);
  };

  const handleEdit = () => {
    console.log('Editing audio:', url);
  };

  const handleDelete = () => {
    console.log('Deleting audio node');
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <Music className="w-4 h-4 text-green-500" />
            <span className="font-medium text-neutral-200">Audio</span>
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

      {/* Audio Content */}
      <div className="p-3">
        {status === 'completed' && url ? (
          <div className="space-y-3">
            <div className="text-sm text-neutral-300">
              <p className="font-medium mb-1">Prompt:</p>
              <p className="text-neutral-400">{prompt}</p>
            </div>

            {/* Audio Player */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <audio
                ref={audioRef}
                src={url}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => {
                  // Audio loaded
                }}
              />
              
              {/* Waveform Visualization (placeholder) */}
              <div className="h-16 bg-neutral-900 rounded-lg mb-3 flex items-center justify-center">
                <div className="flex gap-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-neutral-600 rounded-full"
                      style={{
                        height: `${Math.random() * 40 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={togglePlay}
                  className="bg-neutral-700 hover:bg-neutral-600"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-neutral-400">
                      {formatTime(currentTime)}
                    </span>
                    <div className="flex-1 h-1 bg-neutral-700 rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ 
                          width: metadata?.duration 
                            ? `${(currentTime / metadata.duration) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400">
                      {metadata?.duration ? formatTime(metadata.duration) : '0:00'}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-neutral-400 hover:text-neutral-200"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {metadata && (
              <div className="flex gap-2 text-xs text-neutral-400">
                {metadata.duration && (
                  <span>{formatTime(metadata.duration)}</span>
                )}
                {metadata.format && <span>{metadata.format.toUpperCase()}</span>}
                {metadata.voice && <span>Voice: {metadata.voice}</span>}
                {metadata.size && <span>{(metadata.size / 1024).toFixed(1)} KB</span>}
              </div>
            )}
          </div>
        ) : status === 'processing' ? (
          <div className="flex items-center justify-center h-32 bg-neutral-800 rounded-lg">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-300">Generating audio...</p>
            </div>
          </div>
        ) : status === 'failed' ? (
          <div className="flex items-center justify-center h-32 bg-red-900/20 rounded-lg border border-red-800">
            <div className="text-center">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-xs">!</span>
              </div>
              <p className="text-sm text-red-300">Generation failed</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-neutral-800 rounded-lg">
            <div className="text-center">
              <Music className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
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

AudioNode.displayName = 'AudioNode';
