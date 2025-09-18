'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Image, 
  MessageSquare, 
  Globe, 
  Zap, 
  Shield, 
  Code, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// Raj's Features Section with Interactive Elements
export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Brain,
      title: "Intent Recognition",
      description: "AI automatically understands what you want - text chat, image generation, or tool execution.",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      capabilities: ["Natural language processing", "Multi-modal understanding", "Context awareness"]
    },
    {
      icon: Image,
      title: "AI Image Generation",
      description: "Create stunning images with advanced AI models. Generate, edit, and enhance visuals.",
      color: "from-green-500 to-teal-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      capabilities: ["Text-to-image generation", "Image editing", "Style transfer"]
    },
    {
      icon: MessageSquare,
      title: "Unified Chat Interface",
      description: "One conversation, infinite possibilities. Seamlessly switch between different AI capabilities.",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      capabilities: ["Real-time streaming", "Multi-step reasoning", "Context preservation"]
    },
    {
      icon: Globe,
      title: "3000+ Real-World Tools",
      description: "Access Gmail, Slack, GitHub, Notion, and thousands of other tools through natural conversation.",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      capabilities: ["Gmail integration", "Slack automation", "GitHub management"]
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with edge computing and intelligent caching for instant responses.",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      capabilities: ["Edge computing", "Smart caching", "Parallel processing"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with fine-grained permissions and data protection.",
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      capabilities: ["End-to-end encryption", "Role-based access", "Audit logging"]
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-4 py-1 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
            Built for the Future
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the next generation of AI development with cutting-edge features 
            that make complex tasks simple and powerful.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-gray-900/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all duration-500 group cursor-pointer ${
                hoveredFeature === index ? 'scale-105 shadow-2xl' : 'hover:scale-102'
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {(() => {
                      const IconComponent = feature.icon;
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.capabilities.map((capability, capIndex) => (
                    <div key={capIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{capability}</span>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 p-3 rounded-lg ${feature.bgColor} border ${feature.borderColor} transition-all duration-300 ${
                  hoveredFeature === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Learn More</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Experience the Future?
            </h3>
            <p className="text-gray-400 mb-6">
              Join thousands of developers who are already building with Anyacursor
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                onClick={() => window.location.href = '/chat'}
              >
                <Code className="w-5 h-5 mr-2 inline" />
                Start Building Now
              </button>
              <button 
                className="border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => window.location.href = '/chat/new'}
              >
                <MessageSquare className="w-5 h-5 mr-2 inline" />
                Try Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
