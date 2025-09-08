import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-slack-signature');
    const timestamp = request.headers.get('x-slack-request-timestamp');
    
    const data = JSON.parse(body);
    
    // Handle URL verification FIRST (no signature required)
    if (data.type === 'url_verification') {
      console.log('URL verification challenge received:', data.challenge);
      return NextResponse.json({ challenge: data.challenge });
    }
    
    // For all other events, verify Slack request signature
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
    
    // Handle events
    if (data.type === 'event_callback' && data.event) {
      console.log('Received Slack event:', data.event.type);
      // Process the event here
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Slack webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
