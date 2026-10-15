import { getDatabase } from '../../frontend/lib/mongodb';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import crypto from 'crypto';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

const DEMO_OPERATOR_CONVERSATION: Conversation = {
  conversationId: 'conv_demo',
  orderId: 'ORD-8491-RAZORPAY',
  kitId: 'kit-razorpay-pro',
  kitSlug: 'nextjs-razorpay-pro',
  kitTitle: 'Next.js 15 Razorpay Pro Kit',
  buyerId: 'buyer_ashutosh',
  buyerEmail: 'ashutosh@agency.dev',
  buyerName: 'Ashutosh Dubey (Buyer)',
  sellerId: 'seller_devkit_core',
  sellerEmail: 'support@devkit.store',
  sellerName: 'DevKit Core Team (Seller)',
  status: 'flagged',
  flaggedCount: 1,
  lastMessageSnippet: 'Can I get your WhatsApp number [🔒 Contact info hidden]?',
  lastMessageAt: new Date(),
  createdAt: new Date(Date.now() - 3600000),
  updatedAt: new Date(),
};

/**
 * Retrieves all conversations for operator audit
 */
export async function getAllConversationsForOperator(): Promise<Conversation[]> {
  try {
    const db = await getDatabase();
    const stored = await db
      .collection<Conversation>(CONVERSATIONS_COLLECTION)
      .find({})
      .sort({ lastMessageAt: -1 })
      .toArray();

    return stored;
  } catch (err) {
    console.error('Error fetching operator conversations:', err);
    return [];
  }
}

/**
 * Retrieves only flagged conversations where leak attempts occurred
 */
export async function getFlaggedConversationsForOperator(): Promise<Conversation[]> {
  try {
    const db = await getDatabase();
    const stored = await db
      .collection<Conversation>(CONVERSATIONS_COLLECTION)
      .find({ status: 'flagged' })
      .sort({ lastMessageAt: -1 })
      .toArray();

    return stored;
  } catch (err) {
    console.error('Error fetching flagged conversations:', err);
    return [];
  }
}

/**
 * Allows an Operator to post an authoritative system moderation message into the thread
 */
export async function operatorIntervene(
  conversationId: string,
  operatorName: string,
  noticeText: string
): Promise<Message> {
  const db = await getDatabase();
  const now = new Date();

  const message: Message = {
    messageId: `op_msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    conversationId,
    senderId: 'operator_system',
    senderName: `Operator (${operatorName})`,
    senderRole: 'operator',
    originalContent: noticeText,
    filteredContent: noticeText,
    isFlagged: false,
    isSystemEvent: true,
    createdAt: now,
  };

  await db.collection<Message>(MESSAGES_COLLECTION).insertOne(message);

  await db.collection<Conversation>(CONVERSATIONS_COLLECTION).updateOne(
    { conversationId },
    {
      $set: {
        lastMessageSnippet: `[Moderator Notice]: ${noticeText.slice(0, 80)}`,
        lastMessageAt: now,
        updatedAt: now,
      },
    }
  );

  return message;
}
