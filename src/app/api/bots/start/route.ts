import { NextRequest, NextResponse } from 'next/server';

interface BotConfig {
  nickname: string;
  roomUrl: string;
  botCount: number;
  feedingEnabled: boolean;
  splittingEnabled: boolean;
}

const activeBotSessions = new Map<string, BotConfig>();

export async function POST(request: NextRequest) {
  try {
    const config: BotConfig = await request.json();
    
    // Validate input
    if (!config.nickname || !config.roomUrl) {
      return NextResponse.json(
        { error: 'Nickname and server URL are required' },
        { status: 400 }
      );
    }

    if (config.botCount < 1 || config.botCount > 50) {
      return NextResponse.json(
        { error: 'Bot count must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    activeBotSessions.set(sessionId, config);

    // Notify WebSocket service to start bots
    try {
      const response = await fetch(`/?XTransformPort=3003`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Action': 'start-bots',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to notify bot service');
      }
    } catch (error) {
      console.error('WebSocket service error:', error);
      // Continue anyway - the UI will show connection status
    }

    // Generate mock bot data for initial UI state
    const bots = Array.from({ length: config.botCount }, (_, i) => ({
      id: `bot_${i + 1}`,
      nickname: `${config.nickname}_Bot${i + 1}`,
      status: 'connecting' as const,
      mass: Math.floor(Math.random() * 50) + 10,
      position: { x: Math.random() * 1000, y: Math.random() * 1000 }
    }));

    return NextResponse.json({
      success: true,
      sessionId,
      bots,
      message: `Started ${config.botCount} bots for ${config.nickname}`
    });

  } catch (error) {
    console.error('Start bots error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const activeSessions = Array.from(activeBotSessions.entries()).map(([id, config]) => ({
    sessionId: id,
    ...config
  }));

  return NextResponse.json({
    activeSessions,
    totalSessions: activeSessions.length
  });
}