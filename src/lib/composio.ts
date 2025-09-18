import { Composio } from '@composio/core';

// Raj's Composio Service with Proper Error Handling and Type Safety

export interface ComposioConfig {
  apiKey: string;
  userId?: string;
}

export interface ToolAuthorizationResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
  connectionId?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  toolName?: string;
}

export interface AvailableTool {
  name: string;
  description: string;
  toolkit: string;
  parameters?: Record<string, unknown>;
}

// Raj's Error Classification for Composio
export const COMPOSIO_ERROR_TYPES = {
  API_KEY_MISSING: 'API_KEY_MISSING',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  INVALID_TOOL: 'INVALID_TOOL',
} as const;

export type ComposioErrorType = typeof COMPOSIO_ERROR_TYPES[keyof typeof COMPOSIO_ERROR_TYPES];

// Raj's Composio Service Class
export class ComposioService {
  private composio: Composio;
  private userId: string;

  constructor(config: ComposioConfig) {
    if (!config.apiKey) {
      throw new Error(`${COMPOSIO_ERROR_TYPES.API_KEY_MISSING}: Composio API key is required`);
    }

    this.userId = config.userId || 'default-user';
    
    try {
      this.composio = new Composio({
        apiKey: config.apiKey,
      });
    } catch (error) {
      throw new Error(`Failed to initialize Composio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Raj's Defensive Programming - Input Validation
  private validateUserId(userId: string): string {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error(`${COMPOSIO_ERROR_TYPES.INVALID_TOOL}: Invalid user ID provided`);
    }
    return userId.trim();
  }

  private validateToolkit(toolkit: string): string {
    if (!toolkit || typeof toolkit !== 'string' || toolkit.trim().length === 0) {
      throw new Error(`${COMPOSIO_ERROR_TYPES.INVALID_TOOL}: Invalid toolkit name provided`);
    }
    return toolkit.trim().toUpperCase();
  }

  // Raj's Tool Authorization with Proper Error Handling
  async authorizeToolkit(userId: string, toolkit: string): Promise<ToolAuthorizationResult> {
    try {
      const validatedUserId = this.validateUserId(userId);
      const validatedToolkit = this.validateToolkit(toolkit);

      const connection = await this.composio.toolkits.authorize(validatedUserId, validatedToolkit);
      
      return {
        success: true,
        redirectUrl: connection.redirectUrl || undefined,
        connectionId: connection.id || undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authorization failed';
      return {
        success: false,
        error: `${COMPOSIO_ERROR_TYPES.AUTHORIZATION_FAILED}: ${errorMessage}`,
      };
    }
  }

  // Raj's Connection Waiting with Timeout
  async waitForConnection(userId: string, toolkit: string, timeoutMs: number = 300000): Promise<boolean> {
    try {
      const validatedUserId = this.validateUserId(userId);
      const validatedToolkit = this.validateToolkit(toolkit);

      // Create a timeout promise
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${COMPOSIO_ERROR_TYPES.CONNECTION_TIMEOUT}: Connection timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Create connection waiting promise
      const connectionPromise = this.composio.toolkits.authorize(validatedUserId, validatedToolkit)
        .then(connection => connection.waitForConnection());

      // Race between connection and timeout
      await Promise.race([connectionPromise, timeoutPromise]);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      throw new Error(`${COMPOSIO_ERROR_TYPES.CONNECTION_TIMEOUT}: ${errorMessage}`);
    }
  }

  // Raj's Tool Retrieval with Validation
  async getTools(userId: string, toolkits: string[]): Promise<AvailableTool[]> {
    try {
      const validatedUserId = this.validateUserId(userId);
      const validatedToolkits = toolkits.map(toolkit => this.validateToolkit(toolkit));

      const tools = await this.composio.tools.get(validatedUserId, { 
        toolkits: validatedToolkits 
      });

      // Transform tools to our interface
      return tools.map((tool: any) => ({
        name: tool.name || 'Unknown Tool',
        description: tool.description || 'No description available',
        toolkit: tool.toolkit || 'Unknown Toolkit',
        parameters: tool.parameters,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve tools';
      throw new Error(`${COMPOSIO_ERROR_TYPES.TOOL_EXECUTION_FAILED}: ${errorMessage}`);
    }
  }

  // Raj's Tool Execution with Error Handling
  async executeTool(userId: string, toolName: string, parameters: Record<string, unknown>): Promise<ToolExecutionResult> {
    try {
      const validatedUserId = this.validateUserId(userId);
      
      if (!toolName || typeof toolName !== 'string') {
        throw new Error('Invalid tool name provided');
      }

      const result = await this.composio.tools.execute(validatedUserId, toolName, { parameters });
      
      return {
        success: true,
        result,
        toolName,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';
      return {
        success: false,
        error: `${COMPOSIO_ERROR_TYPES.TOOL_EXECUTION_FAILED}: ${errorMessage}`,
        toolName,
      };
    }
  }

  // Raj's Available Toolkits Discovery
  async getAvailableToolkits(): Promise<string[]> {
    try {
      // This would typically come from Composio's API
      // For now, return common toolkits
      return [
        'GMAIL',
        'SLACK',
        'GITHUB',
        'NOTION',
        'LINEAR',
        'TRELLO',
        'ASANA',
        'GOOGLE_CALENDAR',
        'GOOGLE_DRIVE',
        'DROPBOX',
        'ZAPIER',
        'WEBHOOK',
      ];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve toolkits';
      throw new Error(`${COMPOSIO_ERROR_TYPES.TOOL_EXECUTION_FAILED}: ${errorMessage}`);
    }
  }

  // Raj's Available Tools Discovery
  async getAvailableTools(userId: string, toolkits: string[]): Promise<AvailableTool[]> {
    try {
      const validatedUserId = this.validateUserId(userId);
      const validatedToolkits = toolkits.map(toolkit => this.validateToolkit(toolkit));

      const tools = await this.composio.tools.get(validatedUserId, { 
        toolkits: validatedToolkits 
      });

      // Transform tools to our interface
      return tools.map((tool: any) => ({
        name: tool.name || 'Unknown Tool',
        description: tool.description || 'No description available',
        toolkit: tool.toolkit || 'Unknown Toolkit',
        parameters: tool.parameters,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve tools';
      throw new Error(`${COMPOSIO_ERROR_TYPES.TOOL_EXECUTION_FAILED}: ${errorMessage}`);
    }
  }

  // Raj's Health Check
  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - try to get available toolkits
      await this.getAvailableToolkits();
      return true;
    } catch {
      return false;
    }
  }
}

// Raj's Singleton Pattern for Composio Service
let composioServiceInstance: ComposioService | null = null;

export function getComposioService(): ComposioService {
  if (!composioServiceInstance) {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
      throw new Error(`${COMPOSIO_ERROR_TYPES.API_KEY_MISSING}: COMPOSIO_API_KEY environment variable is required`);
    }
    
    composioServiceInstance = new ComposioService({ apiKey });
  }
  
  return composioServiceInstance;
}

// Raj's Utility Functions
export function sanitizeComposioInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000); // Limit length
}

export function validateComposioConfig(config: unknown): config is ComposioConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  const composioConfig = config as Record<string, unknown>;
  return typeof composioConfig.apiKey === 'string' && composioConfig.apiKey.length > 0;
}

