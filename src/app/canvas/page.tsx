'use client'

import { useState, useCallback } from 'react'
import { InfiniteCanvasComponent } from '@/components/infinite-canvas'
import { ChatBar } from '@/components/canvas/chat-bar'
import { ContextualChat } from '@/components/canvas/contextual-chat'

export default function CanvasPage() {
  const [contextualChat, setContextualChat] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
  }>({
    isOpen: false,
    position: { x: 0, y: 0 }
  })

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    setContextualChat({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY }
    })
  }, [])

  const handleCloseContextualChat = useCallback(() => {
    setContextualChat(prev => ({ ...prev, isOpen: false }))
  }, [])

  const handleGenerate = useCallback((type: string, prompt: string) => {
    console.log('Generating:', type, prompt)
    // TODO: Implement actual generation logic
  }, [])

  return (
    <div className="h-screen w-full relative">
      <InfiniteCanvasComponent onDoubleClick={handleDoubleClick} />
      
      {/* Fixed Bottom Chat Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <ChatBar onGenerate={handleGenerate} />
      </div>

      {/* Contextual Chat Bubble */}
      <ContextualChat
        isOpen={contextualChat.isOpen}
        onClose={handleCloseContextualChat}
        position={contextualChat.position}
        onGenerate={handleGenerate}
      />
    </div>
  )
}