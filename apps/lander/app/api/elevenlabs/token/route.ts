import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();

    console.log('Received agentId:', agentId);
    console.log('API Key exists:', !!process.env.ELEVENLABS_API_KEY);

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Generate conversation token using ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });

    console.log('ElevenLabs API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return NextResponse.json({
        error: 'Failed to create conversation token',
        details: error,
        status: response.status
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('ElevenLabs API success:', data);
    console.log('Available fields:', Object.keys(data));
    return NextResponse.json({
      conversationToken: data.token || data.conversation_token || data.access_token,
      fullResponse: data
    });
  } catch (error) {
    console.error('Error generating conversation token:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
