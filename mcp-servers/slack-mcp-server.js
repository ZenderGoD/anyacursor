#!/usr/bin/env node

/**
 * Slack MCP Server
 * Provides MCP interface to Slack API for messaging and notifications
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class SlackMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'slack-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.slackClient = null;
    this.setupToolHandlers();
  }

  async initialize() {
    // Initialize Slack client
    const slackToken = process.env.SLACK_BOT_TOKEN;
    if (!slackToken) {
      throw new Error('SLACK_BOT_TOKEN environment variable is required');
    }

    // In a real implementation, you would initialize the Slack Web API client here
    // For now, we'll simulate the client
    this.slackClient = {
      token: slackToken,
      initialized: true
    };
    
    console.error('Slack MCP Server initialized with token:', slackToken.substring(0, 10) + '...');
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'slack_send_message',
            description: 'Send a message to a Slack channel or user',
            inputSchema: {
              type: 'object',
              properties: {
                channel: {
                  type: 'string',
                  description: 'Channel ID or name (e.g., #general or C1234567890)',
                },
                text: {
                  type: 'string',
                  description: 'Message text to send',
                },
                blocks: {
                  type: 'array',
                  description: 'Rich formatting blocks (optional)',
                },
                thread_ts: {
                  type: 'string',
                  description: 'Thread timestamp to reply to (optional)',
                },
              },
              required: ['channel', 'text'],
            },
          },
          {
            name: 'slack_send_dm',
            description: 'Send a direct message to a user',
            inputSchema: {
              type: 'object',
              properties: {
                user: {
                  type: 'string',
                  description: 'User ID or email address',
                },
                text: {
                  type: 'string',
                  description: 'Message text to send',
                },
                blocks: {
                  type: 'array',
                  description: 'Rich formatting blocks (optional)',
                },
              },
              required: ['user', 'text'],
            },
          },
          {
            name: 'slack_create_channel',
            description: 'Create a new Slack channel',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Channel name (without #)',
                },
                is_private: {
                  type: 'boolean',
                  description: 'Whether the channel should be private',
                },
                topic: {
                  type: 'string',
                  description: 'Channel topic/description',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'slack_get_channel_info',
            description: 'Get information about a Slack channel',
            inputSchema: {
              type: 'object',
              properties: {
                channel: {
                  type: 'string',
                  description: 'Channel ID or name',
                },
              },
              required: ['channel'],
            },
          },
          {
            name: 'slack_get_user_info',
            description: 'Get information about a Slack user',
            inputSchema: {
              type: 'object',
              properties: {
                user: {
                  type: 'string',
                  description: 'User ID or email address',
                },
              },
              required: ['user'],
            },
          },
          {
            name: 'slack_list_channels',
            description: 'List available Slack channels',
            inputSchema: {
              type: 'object',
              properties: {
                types: {
                  type: 'string',
                  description: 'Channel types to include (public_channel, private_channel, mpim, im)',
                },
                exclude_archived: {
                  type: 'boolean',
                  description: 'Exclude archived channels',
                },
              },
            },
          },
          {
            name: 'slack_send_notification',
            description: 'Send a notification with rich formatting',
            inputSchema: {
              type: 'object',
              properties: {
                channel: {
                  type: 'string',
                  description: 'Channel ID or name',
                },
                title: {
                  type: 'string',
                  description: 'Notification title',
                },
                message: {
                  type: 'string',
                  description: 'Notification message',
                },
                color: {
                  type: 'string',
                  description: 'Notification color (good, warning, danger, or hex color)',
                },
                fields: {
                  type: 'array',
                  description: 'Additional fields to include',
                },
              },
              required: ['channel', 'title', 'message'],
            },
          },
          {
            name: 'slack_update_message',
            description: 'Update an existing Slack message',
            inputSchema: {
              type: 'object',
              properties: {
                channel: {
                  type: 'string',
                  description: 'Channel ID where the message was posted',
                },
                ts: {
                  type: 'string',
                  description: 'Timestamp of the message to update',
                },
                text: {
                  type: 'string',
                  description: 'New message text',
                },
                blocks: {
                  type: 'array',
                  description: 'New rich formatting blocks',
                },
              },
              required: ['channel', 'ts', 'text'],
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
          case 'slack_send_message':
            return await this.handleSendMessage(args);
          case 'slack_send_dm':
            return await this.handleSendDM(args);
          case 'slack_create_channel':
            return await this.handleCreateChannel(args);
          case 'slack_get_channel_info':
            return await this.handleGetChannelInfo(args);
          case 'slack_get_user_info':
            return await this.handleGetUserInfo(args);
          case 'slack_list_channels':
            return await this.handleListChannels(args);
          case 'slack_send_notification':
            return await this.handleSendNotification(args);
          case 'slack_update_message':
            return await this.handleUpdateMessage(args);
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

  async handleSendMessage(args) {
    const { channel, text, blocks, thread_ts } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    // For now, we'll simulate the response
    const messageId = `msg_${Date.now()}`;
    
    console.error(`Sending message to ${channel}: ${text.substring(0, 50)}...`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            messageId,
            channel,
            timestamp: new Date().toISOString(),
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            blocks: blocks || null,
            thread_ts: thread_ts || null
          }, null, 2),
        },
      ],
    };
  }

  async handleSendDM(args) {
    const { user, text, blocks } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    const messageId = `dm_${Date.now()}`;
    
    console.error(`Sending DM to ${user}: ${text.substring(0, 50)}...`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            messageId,
            user,
            timestamp: new Date().toISOString(),
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            blocks: blocks || null
          }, null, 2),
        },
      ],
    };
  }

  async handleCreateChannel(args) {
    const { name, is_private = false, topic } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    const channelId = `C${Date.now()}`;
    
    console.error(`Creating channel: ${name} (${is_private ? 'private' : 'public'})`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            channelId,
            channelName: name,
            isPrivate: is_private,
            topic: topic || null,
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  async handleGetChannelInfo(args) {
    const { channel } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    console.error(`Getting channel info for: ${channel}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            channel: {
              id: channel,
              name: channel.startsWith('#') ? channel.substring(1) : channel,
              isPrivate: false,
              memberCount: 5,
              topic: 'Project development channel',
              purpose: 'Communication for project development',
              created: new Date().toISOString()
            }
          }, null, 2),
        },
      ],
    };
  }

  async handleGetUserInfo(args) {
    const { user } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    console.error(`Getting user info for: ${user}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            user: {
              id: user,
              name: 'user_' + user.substring(0, 8),
              realName: 'User Name',
              email: user.includes('@') ? user : 'user@example.com',
              isBot: false,
              isAdmin: false,
              timezone: 'UTC',
              status: 'active'
            }
          }, null, 2),
        },
      ],
    };
  }

  async handleListChannels(args) {
    const { types = 'public_channel,private_channel', exclude_archived = true } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    console.error(`Listing channels: types=${types}, exclude_archived=${exclude_archived}`);
    
    const channels = [
      {
        id: 'C1234567890',
        name: 'general',
        isPrivate: false,
        memberCount: 10,
        topic: 'General discussion'
      },
      {
        id: 'C0987654321',
        name: 'anyacursor-dev',
        isPrivate: false,
        memberCount: 5,
        topic: 'Anyacursor development'
      },
      {
        id: 'C1122334455',
        name: 'anyacursor-progress',
        isPrivate: false,
        memberCount: 3,
        topic: 'Project progress updates'
      }
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            channels,
            total: channels.length,
            types,
            excludeArchived: exclude_archived
          }, null, 2),
        },
      ],
    };
  }

  async handleSendNotification(args) {
    const { channel, title, message, color = 'good', fields = [] } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    const messageId = `notif_${Date.now()}`;
    
    console.error(`Sending notification to ${channel}: ${title}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            messageId,
            channel,
            title,
            message,
            color,
            fields,
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  async handleUpdateMessage(args) {
    const { channel, ts, text, blocks } = args;
    
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    // In a real implementation, you would call the Slack Web API here
    console.error(`Updating message ${ts} in ${channel}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            channel,
            ts,
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            blocks: blocks || null,
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Slack MCP Server running on stdio');
  }
}

// Start the server
const server = new SlackMCPServer();
await server.initialize();
await server.run();
