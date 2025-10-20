'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function InfiniteCanvasComponent() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  }, [zoom]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const canvasX = (e.clientX - rect.left - position.x) / zoom;
      const canvasY = (e.clientY - rect.top - position.y) / zoom;
      
      // Create a text element
      const textElement = document.createElement('div');
      textElement.contentEditable = 'true';
      textElement.textContent = 'Double-click to edit';
      textElement.style.position = 'absolute';
      textElement.style.left = `${canvasX}px`;
      textElement.style.top = `${canvasY}px`;
      textElement.style.color = '#ffffff';
      textElement.style.fontSize = '16px';
      textElement.style.padding = '8px';
      textElement.style.border = '1px solid #6b7280';
      textElement.style.borderRadius = '4px';
      textElement.style.background = '#374151';
      textElement.style.minWidth = '100px';
      textElement.style.outline = 'none';
      
      const canvasContent = canvasRef.current?.querySelector('.canvas-content');
      if (canvasContent) {
        canvasContent.appendChild(textElement);
        textElement.focus();
        // Select all text in the element
        const range = document.createRange();
        range.selectNodeContents(textElement);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [position, zoom]);

  return (
    <div className="h-full w-full bg-gray-900 relative overflow-hidden">
      {/* Dark themed infinite canvas */}
      <div
        ref={canvasRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{
          background: '#1f2937',
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: `${position.x % 20}px ${position.y % 20}px`,
        }}
      >
        {/* Canvas content */}
        <div
          className="canvas-content absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Sample content */}
          <div
            style={{
              position: 'absolute',
              left: 100,
              top: 100,
              width: 200,
              height: 100,
              background: '#374151',
              border: '2px solid #6b7280',
              borderRadius: '8px',
              padding: '16px',
              color: '#ffffff',
              fontSize: '16px',
            }}
          >
            Double-click to add text
          </div>
          
          <div
            style={{
              position: 'absolute',
              left: 400,
              top: 200,
              width: 150,
              height: 150,
              background: '#4b5563',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '14px',
            }}
          >
            Circle
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Zoom In
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
          className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Zoom Out
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Info panel */}
      <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded">
        <div>Zoom: {Math.round(zoom * 100)}%</div>
        <div>Position: {Math.round(position.x)}, {Math.round(position.y)}</div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-gray-800 text-white px-4 py-3 rounded">
        <div className="font-medium mb-2">Dark Infinite Canvas</div>
        <div className="text-sm text-gray-300">
          • Drag to pan around
        </div>
        <div className="text-sm text-gray-300">
          • Scroll to zoom in/out
        </div>
        <div className="text-sm text-gray-300">
          • Double-click to add text
        </div>
      </div>
    </div>
  );
}
