import { NextRequest, NextResponse } from 'next/server';
import {
  getAllConversationsForOperator,
  getFlaggedConversationsForOperator,
  operatorIntervene,
} from '@backend/chat/operator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const flaggedOnly = searchParams.get('flagged') === 'true';

    const conversations = flaggedOnly
      ? await getFlaggedConversationsForOperator()
      : await getAllConversationsForOperator();

    return NextResponse.json({ success: true, count: conversations.length, conversations });
  } catch (error: any) {
    console.error('Error fetching operator conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching operator conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, operatorName, noticeText } = body;

    if (!conversationId || !noticeText) {
      return NextResponse.json(
        { error: 'Missing required parameters: conversationId, noticeText' },
        { status: 400 }
      );
    }

    const message = await operatorIntervene(
      conversationId,
      operatorName || 'System Moderator',
      noticeText
    );

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Error posting operator intervention:', error);
    return NextResponse.json(
      { error: error.message || 'Error posting intervention' },
      { status: 500 }
    );
  }
}
