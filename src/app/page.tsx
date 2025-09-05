import { ChatInterface } from "@/components/chat/chat-interface";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Anyacursor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your AI-powered assistant built with Next.js, Convex, and AI SDK
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}
