import { NextRequest, NextResponse } from 'next/server';
import { getComposioService, sanitizeComposioInput } from '@/lib/composio';

// Raj's Composio Tools API with Proper Error Handling
export async function GET(request: NextRequest) {
  try {
    // Raj's Query Parameter Validation
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const toolkits = searchParams.get('toolkits');

    if (!userId) {
      return NextResponse.json(
        { error: 'MISSING_USER_ID', message: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Raj's Input Sanitization
    const sanitizedUserId = sanitizeComposioInput(userId);
    if (!sanitizedUserId) {
      return NextResponse.json(
        { error: 'INVALID_USER_ID', message: 'Invalid userId provided' },
        { status: 400 }
      );
    }

    // Parse toolkits parameter
    let toolkitArray: string[] = [];
    if (toolkits) {
      toolkitArray = toolkits.split(',').map(t => sanitizeComposioInput(t)).filter(Boolean);
    }

    // Raj's Service Layer
    const composioService = getComposioService();
    
    let tools;
    if (toolkitArray.length > 0) {
      tools = await composioService.getTools(sanitizedUserId, toolkitArray);
    } else {
      // Get all available toolkits if none specified
      const availableToolkits = await composioService.getAvailableToolkits();
      tools = await composioService.getTools(sanitizedUserId, availableToolkits);
    }

    return NextResponse.json({
      success: true,
      tools,
      count: tools.length,
      userId: sanitizedUserId,
    });

  } catch (error) {
    // Raj's Error Handling - Never expose internal errors
    return NextResponse.json(
      { 
        error: 'TOOLS_RETRIEVAL_ERROR',
        message: 'Failed to retrieve tools',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Raj's Input Validation
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { userId, toolName, parameters } = body as { 
      userId?: string; 
      toolName?: string; 
      parameters?: Record<string, unknown> 
    };
    
    if (!userId || !toolName) {
      return NextResponse.json(
        { error: 'MISSING_PARAMETERS', message: 'userId and toolName are required' },
        { status: 400 }
      );
    }

    // Raj's Input Sanitization
    const sanitizedUserId = sanitizeComposioInput(userId);
    const sanitizedToolName = sanitizeComposioInput(toolName);

    if (!sanitizedUserId || !sanitizedToolName) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Invalid userId or toolName provided' },
        { status: 400 }
      );
    }

    // Raj's Service Layer
    const composioService = getComposioService();
    const result = await composioService.executeTool(
      sanitizedUserId, 
      sanitizedToolName, 
      parameters || {}
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'TOOL_EXECUTION_FAILED', message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: result.result,
      toolName: result.toolName,
      message: 'Tool executed successfully',
    });

  } catch (error) {
    // Raj's Error Handling - Never expose internal errors
    return NextResponse.json(
      { 
        error: 'TOOL_EXECUTION_ERROR',
        message: 'Failed to execute tool',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 60;




