import { NextRequest, NextResponse } from 'next/server';
import {
  getConversationMessages,
  sendChatMessage,
  getConversationById,
} from '@backend/chat/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await getConversationMessages(conversationId);
    return NextResponse.json({ success: true, conversation, messages });
  } catch (error: any) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await req.json();
    const { senderId, senderName, senderRole, content } = body;

    if (!senderId || !senderName || !senderRole || !content) {
      return NextResponse.json(
        { error: 'Missing required message parameters' },
        { status: 400 }
      );
    }

    const message = await sendChatMessage({
      conversationId,
      senderId,
      senderName,
      senderRole,
      content,
    });

    return NextResponse.json({
      success: true,
      message,
      wasMasked: message.isFlagged,
      violation: message.flagReason || null,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Error sending message' },
      { status: 500 }
    );
  }
}
