import { NextRequest, NextResponse } from 'next/server';
import { getComposioService, sanitizeComposioInput } from '@/lib/composio';

// Raj's Composio Authorization API with Proper Error Handling
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

    const { userId, toolkit } = body as { userId?: string; toolkit?: string };
    
    if (!userId || !toolkit) {
      return NextResponse.json(
        { error: 'MISSING_PARAMETERS', message: 'userId and toolkit are required' },
        { status: 400 }
      );
    }

    // Raj's Input Sanitization
    const sanitizedUserId = sanitizeComposioInput(userId);
    const sanitizedToolkit = sanitizeComposioInput(toolkit);

    if (!sanitizedUserId || !sanitizedToolkit) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Invalid userId or toolkit provided' },
        { status: 400 }
      );
    }

    // Raj's Service Layer
    const composioService = getComposioService();
    const result = await composioService.authorizeToolkit(sanitizedUserId, sanitizedToolkit);

    if (!result.success) {
      return NextResponse.json(
        { error: 'AUTHORIZATION_FAILED', message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
      connectionId: result.connectionId,
      message: 'Authorization URL generated successfully',
    });

  } catch (error) {
    // Raj's Error Handling - Never expose internal errors
    const errorMessage = error instanceof Error ? error.message : 'Authorization failed';
    
    return NextResponse.json(
      { 
        error: 'AUTHORIZATION_ERROR',
        message: 'Failed to generate authorization URL',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30;




