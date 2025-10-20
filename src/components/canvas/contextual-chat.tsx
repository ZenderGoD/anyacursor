'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Image, 
  Video, 
  Box, 
  Music, 
  Code, 
  Send, 
  Loader2,
  Sparkles 
} from 'lucide-react';

interface ContextualChatProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onGenerate: (type: string, prompt: string) => void;
}

export function ContextualChat({ 
  isOpen, 
  onClose, 
  position, 
  onGenerate 
}: ContextualChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setSelectedType(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const type = selectedType || 'text';
    onGenerate(type, input.trim());
    setInput('');
    setIsLoading(true);

    // Simulate generation
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 2000);
  };

  const quickActions = [
    { 
      type: 'image', 
      label: 'Image', 
      icon: Image, 
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Generate an image'
    },
    { 
      type: 'video', 
      label: 'Video', 
      icon: Video, 
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Create a video'
    },
    { 
      type: '3d', 
      label: '3D Model', 
      icon: Box, 
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Generate 3D model'
    },
    { 
      type: 'audio', 
      label: 'Audio', 
      icon: Music, 
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Create audio/music'
    },
    { 
      type: 'code', 
      label: 'Code', 
      icon: Code, 
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Generate code'
    },
  ];

  const handleQuickAction = (type: string) => {
    setSelectedType(type);
    const action = quickActions.find(a => a.type === type);
    if (action) {
      setInput(`Generate ${action.label.toLowerCase()}: `);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <Card
        className="absolute bg-neutral-900 border-neutral-800 shadow-2xl w-80 p-4"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 200),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-neutral-200">AI Generator</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickActions.map((action) => (
            <Button
              key={action.type}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.type)}
              className={`${action.color} border-0 text-white ${
                selectedType === action.type ? 'ring-2 ring-white' : ''
              }`}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to create..."
              className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-400"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Selected Type Badge */}
          {selectedType && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                {quickActions.find(a => a.type === selectedType)?.label}
              </Badge>
              <span className="text-xs text-neutral-400">
                {quickActions.find(a => a.type === selectedType)?.description}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-3 text-xs text-neutral-400">
          <div className="font-medium mb-1">Tips:</div>
          <div>• Be specific about style and content</div>
          <div>• Include dimensions for images/videos</div>
          <div>• Mention programming language for code</div>
        </div>
      </Card>
    </div>
  );
}
