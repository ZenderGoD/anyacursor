'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Image, 
  Edit,
  Globe,
  Shield,
  Rocket
} from 'lucide-react';

// Raj's Hero Section with Fancy Animations
export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: Brain, text: "Intent Recognition", color: "from-blue-500 to-purple-600" },
    { icon: Image, text: "AI Image Generation", color: "from-green-500 to-teal-600" },
    { icon: MessageSquare, text: "Unified Chat", color: "from-purple-500 to-pink-600" },
    { icon: Globe, text: "3000+ Tools", color: "from-orange-500 to-red-600" },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-6 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Development Environment
            </Badge>
          </div>

          {/* Main Heading */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Anyacursor
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mt-4 font-light">
              The Future of AI Development
            </p>
          </div>

          {/* Feature Showcase */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700 max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${features[currentFeature].color} flex items-center justify-center transition-all duration-500`}>
                    {(() => {
                      const IconComponent = features[currentFeature].icon;
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <span className="text-2xl font-semibold text-white">
                    {features[currentFeature].text}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all duration-300 ${
                        index === currentFeature
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <feature.icon className={`w-8 h-8 mx-auto mb-2 ${
                        index === currentFeature ? 'text-purple-400' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        index === currentFeature ? 'text-purple-300' : 'text-gray-300'
                      }`}>
                        {feature.text}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Experience the power of unified AI with intent recognition, image generation, 
              and access to 3000+ real-world tools. Build, create, and automate like never before.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 px-8 py-4 text-lg font-semibold group"
                onClick={() => window.location.href = '/chat'}
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Start Building
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/chat/new'}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Try Chat
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">3000+</div>
                <div className="text-gray-400">Available Tools</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">AI</div>
                <div className="text-gray-400">Intent Recognition</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">∞</div>
                <div className="text-gray-400">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
