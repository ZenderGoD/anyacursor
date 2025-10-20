'use client';

import { useCallback, useState, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge as addReactFlowEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// import { useQuery, useMutation } from 'convex/react';
// import { api } from '@/convex/_generated/api';
// import { Id } from '@/convex/_generated/dataModel';
import { offlineStorage, syncManager } from '@/lib/offline-storage';
import { WorkflowExecutor, WorkflowAI } from '@/lib/workflow-executor';

// Temporary mock types until Convex is deployed
type Id<T extends string> = string;

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Lazy load custom node types for better performance
const ImageNode = lazy(() => import('@/components/canvas/nodes/image-node').then(m => ({ default: m.ImageNode })));
const VideoNode = lazy(() => import('@/components/canvas/nodes/video-node').then(m => ({ default: m.VideoNode })));
const CodeNode = lazy(() => import('@/components/canvas/nodes/code-node').then(m => ({ default: m.CodeNode })));
const AudioNode = lazy(() => import('@/components/canvas/nodes/audio-node').then(m => ({ default: m.AudioNode })));
const ModelNode = lazy(() => import('@/components/canvas/nodes/model-node').then(m => ({ default: m.ModelNode })));

interface InfiniteCanvasComponentProps {
  canvasId?: Id<'canvases'>;
  onDoubleClick?: (event: React.MouseEvent) => void;
}

export function InfiniteCanvasComponent({ canvasId, onDoubleClick }: InfiniteCanvasComponentProps = {}) {
  // Custom node types - memoized to prevent re-renders
  const nodeTypes: NodeTypes = useMemo(() => ({
    image: ImageNode,
    video: VideoNode,
    code: CodeNode,
    audio: AudioNode,
    model: ModelNode,
  }), []);
  // Mock Convex hooks until deployment is working
  const canvas = null; // useQuery(api.canvas.getCanvas, canvasId ? { canvasId } : 'skip');
  const updateCanvasState = async (data: any) => {
    console.log('Mock: updateCanvasState', data);
    return 'mock-id';
  };
  const addNode = async (data: any) => {
    console.log('Mock: addNode', data);
    return 'mock-node-id';
  };
  const updateNode = async (data: any) => {
    console.log('Mock: updateNode', data);
    return 'mock-node-id';
  };
  const deleteNode = async (data: any) => {
    console.log('Mock: deleteNode', data);
    return 'mock-node-id';
  };
  const addEdge = async (data: any) => {
    console.log('Mock: addEdge', data);
    return 'mock-edge-id';
  };
  const deleteEdge = async (data: any) => {
    console.log('Mock: deleteEdge', data);
    return 'mock-edge-id';
  };

  // Offline state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Workflow state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<{
    current: number;
    total: number;
    currentNode: string;
  } | null>(null);

  // Initialize offline storage
  useEffect(() => {
    offlineStorage.init();
    
    // Listen for online/offline status
    const cleanup = offlineStorage.onOnlineStatusChange((online) => {
      setIsOnline(online);
    });

    return cleanup;
  }, []);

  // Track pending changes
  useEffect(() => {
    const updatePendingChanges = async () => {
      const changes = await offlineStorage.getPendingChanges();
      setPendingChanges(changes.length);
    };

    updatePendingChanges();
    const interval = setInterval(updatePendingChanges, 5000);
    return () => clearInterval(interval);
  }, []);

  // Memoize initial nodes to prevent unnecessary re-renders
  const initialNodes = useMemo(() => [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Welcome to AI Canvas' },
      style: {
        background: '#374151',
        color: '#ffffff',
        border: '2px solid #6b7280',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '16px',
      },
    },
    {
      id: '2',
      type: 'image',
      position: { x: 400, y: 200 },
      data: {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
        prompt: 'Beautiful mountain landscape',
        status: 'completed',
        metadata: {
          width: 400,
          height: 300,
          format: 'jpg',
          size: 45000,
        },
      },
    },
    {
      id: '3',
      type: 'code',
      position: { x: 700, y: 100 },
      data: {
        code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`,
        language: 'javascript',
        prompt: 'Generate a Fibonacci function in JavaScript',
        status: 'completed',
        metadata: {
          lines: 6,
          complexity: 'Beginner',
          framework: 'Vanilla JS',
        },
      },
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Sync with Convex when canvas data changes
  useEffect(() => {
    // TODO: Implement when Convex is deployed
    // if (canvas?.data) {
    //   setNodes(canvas.data.nodes || []);
    //   setEdges(canvas.data.edges || []);
    // }
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    async (params: Connection) => {
      setEdges((eds) => addReactFlowEdge(params, eds));
      
      // Sync to Convex
      if (canvasId) {
        try {
          await addEdge({
            canvasId,
            source: params.source!,
            target: params.target!,
            type: 'default',
          });
        } catch (error) {
          console.error('Failed to sync edge:', error);
          // Queue for offline sync
          await syncManager.queueChange({
            type: 'create',
            table: 'edges',
            data: {
              source: params.source!,
              target: params.target!,
              type: 'default',
            },
          });
        }
      }
    },
    [setEdges, addEdge, canvasId]
  );

  const handleAddNode = useCallback(async () => {
    const nodeId = `${Date.now()}`;
    const newNode = {
      id: nodeId,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: 'New Node' },
      style: {
        background: '#374151',
        color: '#ffffff',
        border: '2px solid #6b7280',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '16px',
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Sync to Convex
    if (canvasId) {
      try {
        await addNode({
          canvasId,
          nodeId,
          type: 'default',
          position: newNode.position,
          data: newNode.data,
        });
      } catch (error) {
        console.error('Failed to sync node:', error);
        // Queue for offline sync
        await syncManager.queueChange({
          type: 'create',
          table: 'nodes',
          data: {
            nodeId,
            type: 'default',
            position: newNode.position,
            data: newNode.data,
          },
        });
      }
    }
  }, [setNodes, addNode, canvasId]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    // Call parent onDoubleClick if provided
    if (onDoubleClick) {
      onDoubleClick(event);
      return;
    }

    // Default behavior: add node
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newNode = {
      id: `${Date.now()}`,
      type: 'default',
      position: { x: x - 100, y: y - 50 },
      data: { label: 'Double-clicked Node' },
      style: {
        background: '#1f2937',
        color: '#ffffff',
        border: '2px solid #6b7280',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '16px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, onDoubleClick]);

  // Execute workflow
  const executeWorkflow = useCallback(async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setExecutionProgress({ current: 0, total: nodes.length, currentNode: '' });

    try {
      const workflowNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position,
        connections: edges
          .filter(edge => edge.source === node.id)
          .map(edge => edge.target)
      }));

      const workflowEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default'
      }));

      const executor = new WorkflowExecutor(
        workflowNodes,
        workflowEdges,
        {
          onProgress: (step, total, nodeId) => {
            setExecutionProgress({ current: step, total, currentNode: nodeId });
          },
          onComplete: (results) => {
            console.log('Workflow completed:', results);
            setIsExecuting(false);
            setExecutionProgress(null);
          },
          onError: (error, nodeId) => {
            console.error('Workflow error:', error, nodeId);
            setIsExecuting(false);
            setExecutionProgress(null);
          }
        }
      );

      await executor.execute();
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setIsExecuting(false);
      setExecutionProgress(null);
    }
  }, [nodes, edges, isExecuting]);

  // Stop workflow execution
  const stopWorkflow = useCallback(() => {
    setIsExecuting(false);
    setExecutionProgress(null);
  }, []);

  return (
    <div className="h-full w-full ai-canvas-container relative">
      {/* Canvas Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex ai-canvas-spacing ai-canvas-toolbar rounded-lg p-2">
            <Button
              onClick={handleAddNode}
              variant="secondary"
              size="sm"
              className="ai-canvas-transition"
            >
          <Plus className="w-4 h-4 mr-2" />
          Add Node
        </Button>
        <Badge variant="secondary" className="ai-canvas-transition">
          {nodes.length} nodes
        </Badge>
        {!isOnline && (
          <Badge variant="destructive" className="ai-canvas-transition">
            Offline
          </Badge>
        )}
        {pendingChanges > 0 && (
          <Badge className="bg-blue-600 text-blue-100 ai-canvas-transition">
            {pendingChanges} pending
          </Badge>
        )}
        {isExecuting && (
          <Badge className="bg-green-600 text-green-100 ai-canvas-transition">
            Executing
          </Badge>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col ai-canvas-spacing ai-canvas-toolbar rounded-lg p-2">
        <Button
          variant="secondary"
          size="icon"
          className="ai-canvas-transition"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="ai-canvas-transition"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="ai-canvas-transition"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={isExecuting ? stopWorkflow : executeWorkflow}
          className="ai-canvas-transition"
        >
          {isExecuting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-4 h-4">▶</div>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="absolute bottom-4 left-4 z-10 ai-canvas-toolbar p-4 ai-canvas-transition">
        <div className="font-medium mb-2">AI Infinite Canvas</div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>• Drag to pan around</div>
          <div>• Scroll to zoom in/out</div>
          <div>• Double-click to add nodes</div>
          <div>• Connect nodes to create workflows</div>
          {executionProgress && (
            <div className="mt-2 p-2 bg-green-900/20 border border-green-800 rounded">
              <div className="text-green-300 text-xs">
                Executing: {executionProgress.current}/{executionProgress.total}
              </div>
              <div className="text-green-400 text-xs">
                Current: {executionProgress.currentNode}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* React Flow Canvas */}
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading canvas...</div>}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDoubleClick={handleDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            className="ai-canvas-container"
            style={{
              background: 'hsl(var(--background))',
              backgroundImage: `
                radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="hsl(var(--muted-foreground))"
            />
            <Controls 
              className="ai-canvas-toolbar"
            />
            <MiniMap 
              className="ai-canvas-toolbar"
              nodeColor="hsl(var(--muted-foreground))"
              maskColor="rgba(0, 0, 0, 0.5)"
            />
        </ReactFlow>
      </Suspense>
    </div>
  );
}
