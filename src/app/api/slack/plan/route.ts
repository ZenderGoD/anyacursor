import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-slack-signature');
    const timestamp = request.headers.get('x-slack-request-timestamp');
    
    // Verify Slack request
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    if (!signingSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const expectedSignature = createHmac('sha256', signingSecret)
      .update(`v0:${timestamp}:${body}`)
      .digest('hex');
    
    const expectedSignatureWithPrefix = `v0=${expectedSignature}`;
    
    if (signature !== expectedSignatureWithPrefix) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = new URLSearchParams(body);
    const text = formData.get('text');
    const userId = formData.get('user_id');
    const channelId = formData.get('channel_id');
    
    if (!text) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Please provide a specification or feature description. Usage: `/plan [specification or feature description]`'
      });
    }
    
    // Process the plan command
    console.log(`Processing plan command: ${text} from user ${userId} in channel ${channelId}`);
    
    return NextResponse.json({
      response_type: 'in_channel',
      text: `📋 Processing your technical plan request: "${text}"\n\n🔧 Generating technical implementation plan with MCP integration...`
    });
  } catch (error) {
    console.error('Slack plan command error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
