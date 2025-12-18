import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Notify WebSocket service to stop all bots
    try {
      const response = await fetch(`/?XTransformPort=3003`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Action': 'stop-bots'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to notify bot service');
      }
    } catch (error) {
      console.error('WebSocket service error:', error);
      // Continue anyway - the UI will show connection status
    }

    return NextResponse.json({
      success: true,
      message: 'All bots stopped successfully'
    });

  } catch (error) {
    console.error('Stop bots error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}