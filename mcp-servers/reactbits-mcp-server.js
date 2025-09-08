#!/usr/bin/env node

/**
 * ReactBits MCP Server
 * Provides MCP interface to ReactBits patterns, hooks, and utilities
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class ReactBitsMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'reactbits-mcp-server',
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
            name: 'reactbits_get_patterns',
            description: 'Get available ReactBits patterns',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Pattern category (state, effects, performance, etc.)',
                },
                search: {
                  type: 'string',
                  description: 'Search term for patterns',
                },
              },
            },
          },
          {
            name: 'reactbits_get_pattern',
            description: 'Get specific ReactBits pattern details',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The pattern name to get',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'reactbits_get_hooks',
            description: 'Get available ReactBits hooks',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Hook category (state, effects, performance, etc.)',
                },
              },
            },
          },
          {
            name: 'reactbits_get_hook',
            description: 'Get specific ReactBits hook details',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The hook name to get',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'reactbits_get_utilities',
            description: 'Get available ReactBits utilities',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Utility category (validation, formatting, etc.)',
                },
              },
            },
          },
          {
            name: 'reactbits_get_best_practices',
            description: 'Get ReactBits best practices',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  description: 'Best practice topic (performance, security, etc.)',
                },
              },
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
          case 'reactbits_get_patterns':
            return await this.handleGetPatterns(args);
          case 'reactbits_get_pattern':
            return await this.handleGetPattern(args);
          case 'reactbits_get_hooks':
            return await this.handleGetHooks(args);
          case 'reactbits_get_hook':
            return await this.handleGetHook(args);
          case 'reactbits_get_utilities':
            return await this.handleGetUtilities(args);
          case 'reactbits_get_best_practices':
            return await this.handleGetBestPractices(args);
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

  async handleGetPatterns(args) {
    const { category, search } = args;
    
    const allPatterns = {
      state: [
        'useRealtimeChat',
        'usePresence',
        'useTypingIndicator',
        'useMessageQueue',
        'useOptimisticUpdates',
        'useLocalStorage',
        'useSessionStorage',
        'useUrlState'
      ],
      effects: [
        'useDebounce',
        'useThrottle',
        'useInterval',
        'useTimeout',
        'useEventListener',
        'useIntersectionObserver',
        'useResizeObserver',
        'useMediaQuery'
      ],
      performance: [
        'useMemo',
        'useCallback',
        'useRef',
        'useImperativeHandle',
        'useLayoutEffect',
        'useDeferredValue',
        'useTransition',
        'useId'
      ],
      data: [
        'useAsync',
        'useFetch',
        'useSWR',
        'useQuery',
        'useMutation',
        'useInfiniteQuery',
        'usePaginatedQuery'
      ],
      ui: [
        'useToggle',
        'useBoolean',
        'useCounter',
        'usePrevious',
        'useClickOutside',
        'useHover',
        'useFocus',
        'useKeyboard'
      ]
    };

    let patterns = [];
    if (category && allPatterns[category]) {
      patterns = allPatterns[category];
    } else {
      patterns = Object.values(allPatterns).flat();
    }

    if (search) {
      patterns = patterns.filter(pattern => 
        pattern.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            patterns,
            total: patterns.length,
            category: category || 'all',
            search: search || null
          }, null, 2),
        },
      ],
    };
  }

  async handleGetPattern(args) {
    const { name } = args;
    
    const patternDetails = {
      'useRealtimeChat': {
        name: 'useRealtimeChat',
        category: 'state',
        description: 'Hook for managing real-time chat state with Convex',
        features: ['real-time updates', 'message management', 'typing indicators', 'user presence'],
        parameters: ['chatSessionId'],
        returns: ['messages', 'sendMessage', 'isLoading', 'error'],
        dependencies: ['convex/react', 'convex/values'],
        example: `const { messages, sendMessage, isLoading } = useRealtimeChat(chatSessionId);`
      },
      'usePresence': {
        name: 'usePresence',
        category: 'state',
        description: 'Hook for managing user presence in real-time',
        features: ['online/offline status', 'typing indicators', 'last seen', 'real-time updates'],
        parameters: ['userId', 'chatSessionId'],
        returns: ['status', 'isTyping', 'lastSeen', 'updateStatus'],
        dependencies: ['convex/react'],
        example: `const { status, isTyping, updateStatus } = usePresence(userId, chatSessionId);`
      },
      'useTypingIndicator': {
        name: 'useTypingIndicator',
        category: 'state',
        description: 'Hook for managing typing indicators in real-time',
        features: ['typing detection', 'debounced updates', 'multiple users', 'real-time sync'],
        parameters: ['chatSessionId', 'userId'],
        returns: ['isTyping', 'typingUsers', 'setTyping'],
        dependencies: ['convex/react', 'useDebounce'],
        example: `const { isTyping, typingUsers, setTyping } = useTypingIndicator(chatSessionId, userId);`
      },
      'useDebounce': {
        name: 'useDebounce',
        category: 'effects',
        description: 'Hook for debouncing values to prevent excessive updates',
        features: ['configurable delay', 'cleanup on unmount', 'TypeScript support'],
        parameters: ['value', 'delay'],
        returns: ['debouncedValue'],
        dependencies: ['react'],
        example: `const debouncedValue = useDebounce(value, 500);`
      },
      'useThrottle': {
        name: 'useThrottle',
        category: 'effects',
        description: 'Hook for throttling function calls to limit execution frequency',
        features: ['configurable interval', 'leading/trailing options', 'cleanup'],
        parameters: ['callback', 'delay', 'options'],
        returns: ['throttledCallback'],
        dependencies: ['react'],
        example: `const throttledCallback = useThrottle(callback, 1000);`
      }
    };

    const details = patternDetails[name];
    if (!details) {
      throw new Error(`Pattern ${name} not found`);
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

  async handleGetHooks(args) {
    const { category } = args;
    
    const hooks = {
      state: [
        'useRealtimeChat',
        'usePresence',
        'useTypingIndicator',
        'useMessageQueue',
        'useOptimisticUpdates'
      ],
      effects: [
        'useDebounce',
        'useThrottle',
        'useInterval',
        'useTimeout',
        'useEventListener'
      ],
      performance: [
        'useMemo',
        'useCallback',
        'useRef',
        'useLayoutEffect',
        'useDeferredValue'
      ],
      data: [
        'useAsync',
        'useFetch',
        'useSWR',
        'useQuery',
        'useMutation'
      ],
      ui: [
        'useToggle',
        'useBoolean',
        'useCounter',
        'useClickOutside',
        'useHover'
      ]
    };

    let result = hooks;
    if (category && hooks[category]) {
      result = { [category]: hooks[category] };
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

  async handleGetHook(args) {
    const { name } = args;
    
    // Reuse pattern details for hooks (they're often the same)
    return await this.handleGetPattern(args);
  }

  async handleGetUtilities(args) {
    const { category } = args;
    
    const utilities = {
      validation: [
        'validateEmail',
        'validatePassword',
        'validateUrl',
        'validatePhone',
        'validateForm'
      ],
      formatting: [
        'formatDate',
        'formatTime',
        'formatCurrency',
        'formatNumber',
        'formatFileSize'
      ],
      data: [
        'generateId',
        'sanitizeInput',
        'deepClone',
        'mergeObjects',
        'groupBy'
      ],
      string: [
        'capitalize',
        'camelCase',
        'kebabCase',
        'snakeCase',
        'truncate'
      ],
      array: [
        'chunk',
        'unique',
        'shuffle',
        'sortBy',
        'groupBy'
      ]
    };

    let result = utilities;
    if (category && utilities[category]) {
      result = { [category]: utilities[category] };
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

  async handleGetBestPractices(args) {
    const { topic } = args;
    
    const bestPractices = {
      performance: [
        'Use React.memo for expensive components',
        'Use useMemo for expensive calculations',
        'Use useCallback for stable function references',
        'Avoid creating objects in render',
        'Use React.lazy for code splitting',
        'Implement proper dependency arrays',
        'Use useDeferredValue for non-urgent updates'
      ],
      security: [
        'Sanitize all user inputs',
        'Validate data on both client and server',
        'Use proper authentication patterns',
        'Implement proper error boundaries',
        'Avoid exposing sensitive data in client code',
        'Use HTTPS for all communications',
        'Implement proper CORS policies'
      ],
      state: [
        'Keep state as close to where it\'s used as possible',
        'Use useReducer for complex state logic',
        'Avoid prop drilling with context',
        'Use optimistic updates for better UX',
        'Implement proper error states',
        'Use proper loading states',
        'Handle edge cases gracefully'
      ],
      hooks: [
        'Follow the Rules of Hooks',
        'Use custom hooks for reusable logic',
        'Keep hooks focused and single-purpose',
        'Use proper cleanup in useEffect',
        'Avoid infinite loops in useEffect',
        'Use useCallback and useMemo appropriately',
        'Test custom hooks thoroughly'
      ],
      realtime: [
        'Implement proper connection management',
        'Handle reconnection gracefully',
        'Use debouncing for frequent updates',
        'Implement proper error handling',
        'Use optimistic updates for better UX',
        'Handle offline scenarios',
        'Implement proper cleanup on unmount'
      ]
    };

    let result = bestPractices;
    if (topic && bestPractices[topic]) {
      result = { [topic]: bestPractices[topic] };
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ReactBits MCP Server running on stdio');
  }
}

// Start the server
const server = new ReactBitsMCPServer();
await server.run();
