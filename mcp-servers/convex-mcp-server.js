#!/usr/bin/env node

/**
 * Convex MCP Server
 * Provides MCP interface to Convex database operations
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

class ConvexMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'convex-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.convexClient = null;
    this.setupToolHandlers();
  }

  async initialize() {
    // Initialize Convex client
    const convexUrl = process.env.CONVEX_URL;
    if (!convexUrl) {
      throw new Error('CONVEX_URL environment variable is required');
    }

    this.convexClient = new ConvexHttpClient(convexUrl);
    console.error('Convex MCP Server initialized with URL:', convexUrl);
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'convex_query',
            description: 'Execute a Convex query',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The query function name to execute',
                },
                args: {
                  type: 'object',
                  description: 'Arguments to pass to the query',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'convex_mutation',
            description: 'Execute a Convex mutation',
            inputSchema: {
              type: 'object',
              properties: {
                mutation: {
                  type: 'string',
                  description: 'The mutation function name to execute',
                },
                args: {
                  type: 'object',
                  description: 'Arguments to pass to the mutation',
                },
              },
              required: ['mutation'],
            },
          },
          {
            name: 'convex_get_schema',
            description: 'Get the current Convex schema',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'convex_get_realtime_capabilities',
            description: 'Get information about real-time capabilities',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'convex_get_table_info',
            description: 'Get information about a specific table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'The table name to get information about',
                },
              },
              required: ['table'],
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
          case 'convex_query':
            return await this.handleQuery(args);
          case 'convex_mutation':
            return await this.handleMutation(args);
          case 'convex_get_schema':
            return await this.handleGetSchema();
          case 'convex_get_realtime_capabilities':
            return await this.handleGetRealtimeCapabilities();
          case 'convex_get_table_info':
            return await this.handleGetTableInfo(args);
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

  async handleQuery(args) {
    const { query, args: queryArgs } = args;
    
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      const result = await this.convexClient.query(api[query], queryArgs || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  async handleMutation(args) {
    const { mutation, args: mutationArgs } = args;
    
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      const result = await this.convexClient.mutation(api[mutation], mutationArgs || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Mutation failed: ${error.message}`);
    }
  }

  async handleGetSchema() {
    // Return schema information
    const schema = {
      tables: [
        'chatSessions',
        'chatMessages', 
        'generationRequests',
        'chatSummaries',
        'userPresence',
        'chatInvitations'
      ],
      capabilities: [
        'real-time subscriptions',
        'mutations',
        'queries',
        'indexes',
        'search indexes'
      ],
      realtimeFeatures: [
        'live queries',
        'subscription updates',
        'mutation notifications'
      ]
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  async handleGetRealtimeCapabilities() {
    const capabilities = {
      subscriptions: true,
      mutations: true,
      queries: true,
      maxConcurrentUsers: 1000,
      supportedFeatures: [
        'live queries',
        'subscription updates',
        'mutation notifications',
        'presence tracking',
        'typing indicators'
      ],
      performance: {
        averageLatency: '< 100ms',
        maxThroughput: '1000 operations/second',
        connectionLimit: 1000
      }
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(capabilities, null, 2),
        },
      ],
    };
  }

  async handleGetTableInfo(args) {
    const { table } = args;
    
    const tableInfo = {
      chatSessions: {
        fields: ['title', 'type', 'slug', 'ownerId', 'participants', 'metadata'],
        indexes: ['by_slug', 'by_owner', 'by_participant'],
        realtime: true
      },
      chatMessages: {
        fields: ['chatSessionId', 'role', 'content', 'metadata', 'status'],
        indexes: ['by_chat_session', 'by_status'],
        realtime: true
      },
      generationRequests: {
        fields: ['chatSessionId', 'type', 'prompt', 'status', 'result'],
        indexes: ['by_chat_session', 'by_type', 'by_status'],
        realtime: false
      },
      chatSummaries: {
        fields: ['chatSessionId', 'summary', 'messageCount', 'createdAt'],
        indexes: ['by_chat_session'],
        realtime: false
      },
      userPresence: {
        fields: ['userId', 'chatSessionId', 'status', 'lastSeen', 'isTyping'],
        indexes: ['by_user_chat', 'by_chat', 'by_status'],
        realtime: true
      },
      chatInvitations: {
        fields: ['chatSessionId', 'invitedUserId', 'invitedBy', 'status', 'expiresAt'],
        indexes: ['by_invited_user', 'by_chat', 'by_status'],
        realtime: false
      }
    };

    const info = tableInfo[table];
    if (!info) {
      throw new Error(`Table ${table} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(info, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Convex MCP Server running on stdio');
  }
}

// Start the server
const server = new ConvexMCPServer();
await server.initialize();
await server.run();
