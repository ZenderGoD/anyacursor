#!/usr/bin/env node

/**
 * MagicUI MCP Server
 * Provides MCP interface to MagicUI components, animations, and effects
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class MagicUIMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'magicui-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'magicui_get_components',
            description: 'Get available MagicUI components',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Component category (ui, animations, effects, etc.)',
                },
                search: {
                  type: 'string',
                  description: 'Search term for components',
                },
              },
            },
          },
          {
            name: 'magicui_get_component',
            description: 'Get specific MagicUI component details',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The component name to get',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'magicui_get_animations',
            description: 'Get available MagicUI animations',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Animation type (entrance, exit, hover, etc.)',
                },
              },
            },
          },
          {
            name: 'magicui_get_effects',
            description: 'Get available MagicUI effects',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Effect category (background, border, glow, etc.)',
                },
              },
            },
          },
          {
            name: 'magicui_get_text_animations',
            description: 'Get available MagicUI text animations',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'magicui_get_buttons',
            description: 'Get available MagicUI button components',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'magicui_get_backgrounds',
            description: 'Get available MagicUI background components',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'magicui_get_components':
            return await this.handleGetComponents(args);
          case 'magicui_get_component':
            return await this.handleGetComponent(args);
          case 'magicui_get_animations':
            return await this.handleGetAnimations(args);
          case 'magicui_get_effects':
            return await this.handleGetEffects(args);
          case 'magicui_get_text_animations':
            return await this.handleGetTextAnimations();
          case 'magicui_get_buttons':
            return await this.handleGetButtons();
          case 'magicui_get_backgrounds':
            return await this.handleGetBackgrounds();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async handleGetComponents(args) {
    const { category, search } = args;
    
    const allComponents = {
      ui: [
        'marquee',
        'terminal',
        'hero-video-dialog',
        'bento-grid',
        'animated-list',
        'dock',
        'globe',
        'tweet-card',
        'client-tweet-card',
        'orbiting-circles',
        'avatar-circles',
        'icon-cloud',
        'animated-circular-progress-bar',
        'file-tree',
        'code-comparison',
        'script-copy-btn',
        'scroll-progress',
        'lens',
        'pointer'
      ],
      chat: [
        'chat-interface',
        'message-bubble',
        'typing-indicator',
        'user-presence',
        'chat-input',
        'message-list'
      ],
      forms: [
        'form-input',
        'form-select',
        'form-textarea',
        'form-checkbox',
        'form-radio',
        'form-toggle'
      ]
    };

    let components = [];
    if (category && allComponents[category]) {
      components = allComponents[category];
    } else {
      components = Object.values(allComponents).flat();
    }

    if (search) {
      components = components.filter(comp => 
        comp.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            components,
            total: components.length,
            category: category || 'all',
            search: search || null
          }, null, 2),
        },
      ],
    };
  }

  async handleGetComponent(args) {
    const { name } = args;
    
    const componentDetails = {
      'chat-interface': {
        name: 'ChatInterface',
        category: 'chat',
        description: 'Complete chat interface component with real-time messaging',
        features: ['real-time updates', 'typing indicators', 'user presence', 'message history'],
        props: ['messages', 'onSendMessage', 'isLoading', 'user'],
        dependencies: ['react', 'tailwindcss'],
        example: 'import { ChatInterface } from "@/components/chat/chat-interface"'
      },
      'typing-indicator': {
        name: 'TypingIndicator',
        category: 'chat',
        description: 'Shows when users are typing in real-time',
        features: ['real-time updates', 'multiple users', 'smooth animations'],
        props: ['users', 'isVisible', 'animation'],
        dependencies: ['react', 'framer-motion'],
        example: 'import { TypingIndicator } from "@/components/chat/typing-indicator"'
      },
      'user-presence': {
        name: 'UserPresence',
        category: 'chat',
        description: 'Shows user online/offline status with last seen',
        features: ['real-time status', 'last seen time', 'status indicators'],
        props: ['user', 'status', 'lastSeen', 'showLastSeen'],
        dependencies: ['react', 'date-fns'],
        example: 'import { UserPresence } from "@/components/chat/user-presence"'
      }
    };

    const details = componentDetails[name];
    if (!details) {
      throw new Error(`Component ${name} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(details, null, 2),
        },
      ],
    };
  }

  async handleGetAnimations(args) {
    const { type } = args;
    
    const animations = {
      entrance: [
        'fadeIn',
        'slideUp',
        'slideDown',
        'slideLeft',
        'slideRight',
        'scaleIn',
        'rotateIn'
      ],
      exit: [
        'fadeOut',
        'slideUpOut',
        'slideDownOut',
        'slideLeftOut',
        'slideRightOut',
        'scaleOut',
        'rotateOut'
      ],
      hover: [
        'hoverScale',
        'hoverRotate',
        'hoverGlow',
        'hoverShake',
        'hoverBounce'
      ],
      chat: [
        'typingPulse',
        'messageSlideIn',
        'presenceGlow',
        'notificationBounce'
      ]
    };

    let result = animations;
    if (type && animations[type]) {
      result = { [type]: animations[type] };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleGetEffects(args) {
    const { category } = args;
    
    const effects = {
      background: [
        'gradient-background',
        'animated-grid',
        'dot-pattern',
        'ripple-effect',
        'warp-background'
      ],
      border: [
        'shimmer-border',
        'neon-border',
        'animated-border',
        'glow-border'
      ],
      glow: [
        'neon-glow',
        'pulse-glow',
        'hover-glow',
        'text-glow'
      ],
      special: [
        'meteors',
        'confetti',
        'particles',
        'magic-card',
        'shine-border'
      ]
    };

    let result = effects;
    if (category && effects[category]) {
      result = { [category]: effects[category] };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleGetTextAnimations() {
    const textAnimations = [
      'text-animate',
      'line-shadow-text',
      'aurora-text',
      'number-ticker',
      'animated-shiny-text',
      'animated-gradient-text',
      'text-reveal',
      'hyper-text',
      'word-rotate',
      'typing-animation',
      'scroll-based-velocity',
      'flip-text',
      'box-reveal',
      'sparkles-text',
      'morphing-text',
      'spinning-text'
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            textAnimations,
            total: textAnimations.length,
            description: 'Available MagicUI text animation components'
          }, null, 2),
        },
      ],
    };
  }

  async handleGetButtons() {
    const buttons = [
      'rainbow-button',
      'shimmer-button',
      'shiny-button',
      'interactive-hover-button',
      'animated-subscribe-button',
      'pulsating-button',
      'ripple-button'
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            buttons,
            total: buttons.length,
            description: 'Available MagicUI button components'
          }, null, 2),
        },
      ],
    };
  }

  async handleGetBackgrounds() {
    const backgrounds = [
      'warp-background',
      'flickering-grid',
      'animated-grid-pattern',
      'retro-grid',
      'ripple',
      'dot-pattern',
      'grid-pattern',
      'interactive-grid-pattern'
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            backgrounds,
            total: backgrounds.length,
            description: 'Available MagicUI background components'
          }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MagicUI MCP Server running on stdio');
  }
}

// Start the server
const server = new MagicUIMCPServer();
await server.run();
