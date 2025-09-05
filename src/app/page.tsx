import { ChatInterface } from "@/components/chat/chat-interface";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Anyacursor
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered assistant built with Next.js, Convex, and AI SDK
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}
