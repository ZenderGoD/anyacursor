'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getComposioService, type AvailableTool, type ToolExecutionResult } from '@/lib/composio';
import { Loader2, Zap, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface ComposioIntegrationProps {
  userId?: string;
  onToolExecuted?: (result: ToolExecutionResult) => void;
}

export function ComposioIntegration({ userId = 'default-user', onToolExecuted }: ComposioIntegrationProps) {
  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolParameters, setToolParameters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ToolExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available tools on component mount
  useEffect(() => {
    loadAvailableTools();
  }, []);

  const loadAvailableTools = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const composioService = getComposioService();
      const tools = await composioService.getAvailableTools(userId, [
        'GMAIL',
        'SLACK',
        'GOOGLE_CALENDAR',
        'NOTION',
        'TRELLO',
        'GITHUB',
        'DROPBOX',
        'ZAPIER',
        'WEBHOOK',
      ]);
      
      setAvailableTools(tools);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    setToolParameters({});
    setLastResult(null);
    setError(null);
  };

  const handleParameterChange = (key: string, value: string) => {
    setToolParameters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    setError(null);

    try {
      const composioService = getComposioService();
      const result = await composioService.executeTool(userId, selectedTool, toolParameters);
      
      setLastResult(result);
      onToolExecuted?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute tool');
    } finally {
      setIsExecuting(false);
    }
  };

  const authorizeToolkit = async (toolkit: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const composioService = getComposioService();
      const result = await composioService.authorizeToolkit(userId, toolkit);
      
      if (result.success && result.redirectUrl) {
        // Open authorization URL in new tab
        window.open(result.redirectUrl, '_blank');
      } else {
        setError(result.error || 'Authorization failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedToolInfo = availableTools.find(tool => tool.name === selectedTool);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Composio Integration
          </CardTitle>
          <CardDescription>
            Execute actions across 100+ tools and services with AI-powered automation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Available Tools */}
          <div>
            <Label className="text-sm font-medium">Available Tools</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading tools...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {availableTools.map((tool) => (
                  <Button
                    key={tool.name}
                    variant={selectedTool === tool.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToolSelect(tool.name)}
                    className="justify-start"
                  >
                    <Badge variant="secondary" className="mr-2 text-xs">
                      {tool.toolkit}
                    </Badge>
                    {tool.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Tool Selection */}
          {selectedTool && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Selected Tool</Label>
                <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{selectedToolInfo?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedToolInfo?.description}
                      </p>
                    </div>
                    <Badge variant="outline">{selectedToolInfo?.toolkit}</Badge>
                  </div>
                </div>
              </div>

              {/* Tool Parameters */}
              <div>
                <Label className="text-sm font-medium">Parameters</Label>
                <div className="mt-2 space-y-2">
                  {selectedToolInfo?.parameters && Object.keys(selectedToolInfo.parameters).length > 0 ? (
                    Object.entries(selectedToolInfo.parameters).map(([key, param]) => (
                      <div key={key}>
                        <Label htmlFor={key} className="text-xs">
                          {key}
                        </Label>
                        <Input
                          id={key}
                          value={toolParameters[key] || ''}
                          onChange={(e) => handleParameterChange(key, e.target.value)}
                          placeholder={`Enter ${key}`}
                          className="mt-1"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No parameters required for this tool
                    </div>
                  )}
                </div>
              </div>

              {/* Execute Button */}
              <Button
                onClick={executeTool}
                disabled={isExecuting}
                className="w-full"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Execute Tool
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Authorization Section */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Authorize New Toolkit</Label>
            <div className="mt-2 flex gap-2">
              <Select onValueChange={(value) => authorizeToolkit(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select toolkit to authorize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GMAIL">Gmail</SelectItem>
                  <SelectItem value="SLACK">Slack</SelectItem>
                  <SelectItem value="GOOGLE_CALENDAR">Google Calendar</SelectItem>
                  <SelectItem value="NOTION">Notion</SelectItem>
                  <SelectItem value="TRELLO">Trello</SelectItem>
                  <SelectItem value="GITHUB">GitHub</SelectItem>
                  <SelectItem value="DROPBOX">Dropbox</SelectItem>
                  <SelectItem value="ZAPIER">Zapier</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 border border-destructive/20 rounded-lg bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Result Display */}
          {lastResult && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Execution Result</Label>
              <div className={`p-3 border rounded-lg ${
                lastResult.success 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {lastResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    lastResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {lastResult.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                {lastResult.result && (
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                    {JSON.stringify(lastResult.result, null, 2)}
                  </pre>
                )}
                {lastResult.error && (
                  <p className="text-sm text-red-600">{lastResult.error}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



