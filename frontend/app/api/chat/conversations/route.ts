import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations } from '@backend/chat/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing required query parameter: email' },
        { status: 400 }
      );
    }

    const conversations = await getUserConversations(userEmail);
    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error('Error fetching user conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching conversations' },
      { status: 500 }
    );
  }
}
