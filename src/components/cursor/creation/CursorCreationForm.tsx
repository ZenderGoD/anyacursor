'use client';

import { useState, useCallback, useMemo } from 'react';
// Temporarily disabled for development
// import { useMutation } from 'convex/react';
// import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Raj's Component Structure Pattern
interface CursorCreationFormProps {
  onSuccess?: (cursorId: string) => void;
  className?: string;
}

interface FormData {
  name: string;
  description: string;
  visibility: 'private' | 'public' | 'unlisted';
  style: string;
  colorScheme: string;
  tags: string[];
  prompt: string;
}

export function CursorCreationForm({ onSuccess, className }: CursorCreationFormProps) {
  // Raj's Hooks Organization Pattern
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    visibility: 'private',
    style: '',
    colorScheme: '',
    tags: [],
    prompt: '',
  });

  // Mock Convex mutations for development
  // const createCursor = useMutation(api.cursors.mutations.createCursor);
  const createCursor = useMemo(() => async (args: {
    name: string;
    description?: string;
    visibility: string;
    tags: string[];
    metadata?: Record<string, unknown>;
  }): Promise<string> => {
    console.log('Mock createCursor called with:', args);
    return `cursor-${Date.now()}`;
  }, []);

  // Memoized values
  const isFormValid = useMemo(() => {
    return formData.name.trim().length > 0 && formData.prompt.trim().length > 0;
  }, [formData.name, formData.prompt]);

  const availableStyles = [
    'minimalist',
    'geometric',
    'hand-drawn',
    'pixel-art',
    'modern',
    'vintage',
    'futuristic',
    'organic',
  ];

  const availableColorSchemes = [
    'monochrome',
    'pastel',
    'vibrant',
    'dark',
    'neon',
    'earth-tones',
    'cool',
    'warm',
  ];

  // Callbacks
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setReferenceImage(file);
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const cursorId = await createCursor({
        name: formData.name,
        description: formData.description || undefined,
        visibility: formData.visibility,
        tags: formData.tags,
        metadata: {
          style: formData.style,
          color: formData.colorScheme,
          size: { width: 32, height: 32 }, // Standard cursor size
        },
      });

      // TODO: Generate initial variant using AI
      // This will be handled by the AI agent system

      onSuccess?.(cursorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cursor');
    } finally {
      setIsLoading(false);
    }
  }, [createCursor, formData, isFormValid, onSuccess]);

  // Early returns for loading/error states
  if (isLoading) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Wand2 className="h-5 w-5 animate-spin" />
            <span>Creating your cursor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto border-red-200', className)}>
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Creation Failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create Custom Cursor</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Design your perfect cursor using AI-powered generation
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cursor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="My Awesome Cursor"
                required
                className="mt-1 rounded-xl border-slate-300 dark:border-slate-600 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 dark:bg-slate-700"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your cursor design..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: string) => handleInputChange('visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Design Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Design Preferences</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="style">Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value: string) => handleInputChange('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose style" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select
                  value={formData.colorScheme}
                  onValueChange={(value: string) => handleInputChange('colorScheme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose colors" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColorSchemes.map((scheme) => (
                      <SelectItem key={scheme} value={scheme}>
                        {scheme.charAt(0).toUpperCase() + scheme.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {/* AI Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">AI Generation Prompt *</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Describe your cursor in detail. Be specific about shape, style, colors, and any special features..."
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground">
              The more detailed your description, the better your cursor will turn out!
            </p>
          </div>

          {/* Reference Image */}
          <div className="space-y-2">
            <Label>Reference Image (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              {referenceImage ? (
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">{referenceImage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(referenceImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReferenceImage(null)}
                    className="mt-2"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a reference image for image-to-image generation
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Cursor
              </>
            )}
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
