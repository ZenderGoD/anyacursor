'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Code, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw,
  Copy,
  Play,
  Check,
  Wand2,
  Bug,
  Zap,
  FileText
} from 'lucide-react';

interface CodeNodeData {
  code: string;
  language: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    lines?: number;
    complexity?: string;
    framework?: string;
  };
}

export const CodeNode = memo(({ data, selected }: NodeProps) => {
  const { code, language, prompt, status, metadata } = data as unknown as CodeNodeData;
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCode, setEditCode] = useState(code);
  const [editLanguage, setEditLanguage] = useState(language);
  const [editPrompt, setEditPrompt] = useState(prompt);

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-code-${Date.now()}.${getFileExtension(language)}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleRegenerate = () => {
    console.log('Regenerating code:', prompt);
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    console.log('Saving code edit:', { editCode, editLanguage, editPrompt });
    setIsEditDialogOpen(false);
  };

  const handleFormatCode = () => {
    // TODO: Implement code formatting
    console.log('Formatting code');
  };

  const handleDebugCode = () => {
    // TODO: Implement code debugging
    console.log('Debugging code');
  };

  const handleOptimizeCode = () => {
    // TODO: Implement code optimization
    console.log('Optimizing code');
  };

  const handleAddComments = () => {
    // TODO: Implement comment generation
    console.log('Adding comments to code');
  };

  const handleDelete = () => {
    console.log('Deleting code node');
  };

  const handleRun = () => {
    console.log('Running code:', code);
  };

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
    };
    return extensions[lang.toLowerCase()] || 'txt';
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-600',
      typescript: 'bg-blue-600',
      python: 'bg-green-600',
      java: 'bg-red-600',
      csharp: 'bg-purple-600',
      cpp: 'bg-blue-500',
      c: 'bg-gray-600',
      go: 'bg-cyan-600',
      rust: 'bg-orange-600',
      php: 'bg-indigo-600',
      ruby: 'bg-red-500',
      swift: 'bg-orange-500',
      kotlin: 'bg-purple-500',
    };
    return colors[lang.toLowerCase()] || 'bg-gray-600';
  };

  return (
    <Card className={`min-w-[400px] max-w-[600px] bg-neutral-900 border-neutral-800 ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="p-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-neutral-200">Code</span>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getLanguageColor(language)}`}
            >
              {language}
            </Badge>
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

      {/* Code Content */}
      <div className="p-3">
        {status === 'completed' && code ? (
          <div className="space-y-3">
            <div className="text-sm text-neutral-300">
              <p className="font-medium mb-1">Prompt:</p>
              <p className="text-neutral-400">{prompt}</p>
            </div>

            {/* Code Block */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    {metadata?.lines ? `${metadata.lines} lines` : 'Code'}
                  </span>
                  {metadata?.complexity && (
                    <Badge variant="outline" className="text-xs">
                      {metadata.complexity}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              <div className="bg-neutral-950 border border-neutral-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-neutral-400">{language}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopy}
                      className="h-6 px-2 text-xs"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRun}
                      className="h-6 px-2 text-xs"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className={`p-3 font-mono text-sm ${
                  isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-32 overflow-hidden'
                }`}>
                  <pre className="text-neutral-200 whitespace-pre-wrap">{code}</pre>
                </div>
              </div>
            </div>

            {metadata && (
              <div className="flex gap-2 text-xs text-neutral-400">
                {metadata.framework && <span>Framework: {metadata.framework}</span>}
                {metadata.complexity && <span>Complexity: {metadata.complexity}</span>}
              </div>
            )}
          </div>
        ) : status === 'processing' ? (
          <div className="flex items-center justify-center h-32 bg-neutral-800 rounded-lg">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-300">Generating code...</p>
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
              <Code className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
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
      
      {/* Code Editing Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-neutral-50">Edit Code</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Modify, format, and optimize your generated code
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-neutral-300">Code Editor</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleFormatCode}
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Format
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDebugCode}
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <Bug className="w-3 h-3 mr-1" />
                    Debug
                  </Button>
                </div>
              </div>
              <Textarea
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-neutral-50 font-mono text-sm min-h-[300px]"
                placeholder="Enter your code here..."
              />
            </div>

            {/* Edit Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Language</Label>
                <Select value={editLanguage} onValueChange={setEditLanguage}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="swift">Swift</SelectItem>
                    <SelectItem value="kotlin">Kotlin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt Editing */}
              <div className="space-y-2">
                <Label htmlFor="edit-prompt" className="text-neutral-300">Edit Prompt</Label>
                <Textarea
                  id="edit-prompt"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-50"
                  placeholder="Describe what you want the code to do..."
                  rows={3}
                />
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Quick Actions</Label>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOptimizeCode}
                    className="w-full bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Optimize
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddComments}
                    className="w-full bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Add Comments
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

CodeNode.displayName = 'CodeNode';
