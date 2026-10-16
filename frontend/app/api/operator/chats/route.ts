import { NextRequest, NextResponse } from 'next/server';
import {
  getAllConversationsForOperator,
  getFlaggedConversationsForOperator,
  operatorIntervene,
} from '@backend/chat/operator';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'operator' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Safety Desk Operator privileges required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const flaggedOnly = searchParams.get('flagged') === 'true';

    const conversations = flaggedOnly
      ? await getFlaggedConversationsForOperator()
      : await getAllConversationsForOperator();

    return NextResponse.json({ success: true, count: conversations.length, conversations });
  } catch (error: any) {
    console.error('Error fetching operator conversations:', error);
    return NextResponse.json(
      { error: 'Error fetching operator conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'operator' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Safety Desk Operator privileges required' },
        { status: 403 }
      );
    }

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
      operatorName || session?.user?.name || 'Safety Desk Operator',
      noticeText
    );

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Error posting operator intervention:', error);
    return NextResponse.json(
      { error: 'Error posting intervention' },
      { status: 500 }
    );
  }
}
