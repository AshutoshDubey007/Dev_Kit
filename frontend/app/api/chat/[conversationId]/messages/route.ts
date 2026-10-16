import { NextRequest, NextResponse } from 'next/server';
import {
  getConversationMessages,
  sendChatMessage,
  getConversationById,
} from '@backend/chat/service';
import {
  checkRateLimit,
  RATE_LIMIT_POLICIES,
  createRateLimitResponse,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/security/rate-limit';
import { validateString } from '@/lib/security/validation';

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
      { error: 'Error fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    // 1. Rate Limiting Protection (30 messages/min)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(RATE_LIMIT_POLICIES.chat, clientIp);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const { conversationId } = await params;
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Enforce closed thread lifecycle invariant
    if (conversation.status === 'closed') {
      return NextResponse.json(
        { error: 'This conversation thread has been closed because verification concluded or the issue was resolved.' },
        { status: 403, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const body = await req.json();
    const { senderId, senderName, senderRole, content } = body;

    const contentVal = validateString(content, {
      fieldName: 'Message content',
      minLength: 1,
      maxLength: 5000,
      required: true,
    });
    const senderIdVal = validateString(senderId, {
      fieldName: 'Sender ID',
      minLength: 1,
      maxLength: 100,
      required: true,
    });
    const senderNameVal = validateString(senderName, {
      fieldName: 'Sender Name',
      minLength: 1,
      maxLength: 100,
      required: true,
    });
    const senderRoleVal = validateString(senderRole, {
      fieldName: 'Sender Role',
      minLength: 1,
      maxLength: 50,
      required: true,
    });

    if (!contentVal.valid || !senderIdVal.valid || !senderNameVal.valid || !senderRoleVal.valid) {
      return NextResponse.json(
        { error: 'Missing or invalid required message parameters' },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const message = await sendChatMessage({
      conversationId,
      senderId: senderIdVal.value,
      senderName: senderNameVal.value,
      senderRole: senderRoleVal.value as any,
      content: contentVal.value,
    });

    return NextResponse.json(
      {
        success: true,
        message,
        wasMasked: message.isFlagged,
        violation: message.flagReason || null,
      },
      {
        headers: getRateLimitHeaders(rateLimit),
      }
    );
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Error sending message' },
      { status: 500 }
    );
  }
}
