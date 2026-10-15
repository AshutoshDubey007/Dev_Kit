import { getDatabase } from '../../frontend/lib/mongodb';
import { Conversation } from '../models/Conversation';
import { Message, MessageSenderRole } from '../models/Message';
import { sanitizeChatMessage } from './filter';
import { KITS } from '../../frontend/data/kits';
import crypto from 'crypto';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

/**
 * Automatically connects buyer with seller upon confirmed order payment.
 * Injects seller's welcome message with the step-by-step README setup guide.
 */
export async function autoConnectBuyerSeller(order: {
  orderId: string;
  kitId: string;
  kitSlug: string;
  kitTitle: string;
  customerEmail: string;
  customerName: string;
  kitData?: any;
}): Promise<Conversation> {
  const db = await getDatabase();
  const now = new Date();

  // Find kit details for seller info and README guide
  let kit: any = null;
  try {
    kit = await db.collection('kits').findOne({ slug: order.kitSlug });
  } catch (err) {
    console.warn('Could not query kits collection in autoConnectBuyerSeller:', err);
  }
  if (!kit) {
    kit = KITS.find((k) => k.slug === order.kitSlug) || order.kitData;
  }

  // Authoritative seller details come from the kit author record
  const sellerId = kit?.sellerId || 'seller_devkit_core';
  const sellerName = kit?.sellerName || 'DevKit Verified Core Team';
  const sellerEmail = kit?.sellerEmail || 'support@devkit.store';

  // Check if conversation already exists for this order
  const existingConv = await db
    .collection<Conversation>(CONVERSATIONS_COLLECTION)
    .findOne({ orderId: order.orderId });

  if (existingConv) {
    return existingConv;
  }

  const conversationId = `conv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const newConversation: Conversation = {
    conversationId,
    orderId: order.orderId,
    kitId: order.kitId,
    kitSlug: order.kitSlug,
    kitTitle: order.kitTitle,
    buyerId: order.customerEmail,
    buyerEmail: order.customerEmail,
    buyerName: order.customerName,
    sellerId,
    sellerEmail,
    sellerName,
    status: 'active',
    flaggedCount: 0,
    lastMessageSnippet: 'Automated onboarding and setup guide dispatched',
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<Conversation>(CONVERSATIONS_COLLECTION).insertOne(newConversation);

  // Auto-generate Seller Onboarding Message with Step-by-Step README
  const initialSetupReadme = kit?.readmeContent
    ? `### 👋 Welcome to ${order.kitTitle}!

Thank you for your purchase. Here is your author setup guide:

${kit.readmeContent}

---
💬 **Need help with setup?** Ask your questions directly in this secure chat! 
*(Note: Phone numbers and external contacts are automatically masked to keep both buyer and seller protected).*`
    : `### 👋 Welcome to ${order.kitTitle}!

Thank you for your purchase. Here is your quickstart setup guide:

#### 1. Quickstart Steps
- Download your source package using your order receipt.
- Unpack into your Next.js workspace.
- Install dependencies: \`npm install\`
- Copy environment template: \`cp .env.example .env.local\`

#### 2. Verification Status
- Runtime Tested: Next.js ${kit?.verification?.nextjsVersion || '15.1.0'}
- Pass Rate: ${kit?.verification?.testSuitePassRate || 100}% (${kit?.verification?.automatedTestsCount || 18} automated tests)

${
  kit?.verification?.knownLimitations && kit.verification.knownLimitations.length > 0
    ? `#### 3. Honest Limitations\n${kit.verification.knownLimitations
        .map((l: string) => `- ${l}`)
        .join('\n')}\n`
    : ''
}
---
💬 **Need help with setup?** Ask your questions directly in this secure chat! 
*(Note: Phone numbers and external contacts are automatically masked to keep both buyer and seller protected).*`;

  const welcomeMessage: Message = {
    messageId: `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    conversationId,
    senderId: sellerId,
    senderName: sellerName,
    senderRole: 'seller',
    originalContent: initialSetupReadme,
    filteredContent: initialSetupReadme,
    isFlagged: false,
    isSystemEvent: false,
    metadata: {
      isAutomatedReadme: true,
      orderId: order.orderId,
    },
    createdAt: now,
  };

  await db.collection<Message>(MESSAGES_COLLECTION).insertOne(welcomeMessage);

  try {
    const notifCollection = db.collection('notifications');
    await notifCollection.insertOne({
      id: `notif_${Date.now()}_buyer`,
      userId: order.customerEmail,
      type: 'purchase',
      title: `Order Confirmed: ${order.kitTitle}`,
      message: `Your payment was verified. Setup guide is ready in your chat support thread.`,
      link: `/chat`,
      read: false,
      createdAt: now,
    });
    if (sellerEmail) {
      await notifCollection.insertOne({
        id: `notif_${Date.now()}_seller`,
        userId: sellerEmail,
        type: 'purchase',
        title: `Kit Sold: ${order.kitTitle}`,
        message: `${order.customerName} purchased ${order.kitTitle}. Setup guide auto-dispatched.`,
        link: `/chat`,
        read: false,
        createdAt: now,
      });
    }
  } catch (notifErr) {
    console.warn('Could not insert purchase notifications:', notifErr);
  }

  return newConversation;
}

/**
 * Sends a message in a conversation with automatic Anti-Leakage inspection
 */
export async function sendChatMessage(data: {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageSenderRole;
  content: string;
}): Promise<Message> {
  const db = await getDatabase();
  const now = new Date();

  // Run anti-leakage filter
  const filterResult = sanitizeChatMessage(data.content);

  const messageId = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const message: Message = {
    messageId,
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderName: data.senderName,
    senderRole: data.senderRole,
    originalContent: filterResult.originalText,
    filteredContent: filterResult.filteredText,
    isFlagged: filterResult.isFlagged,
    flagReason: filterResult.detectedViolations.join(', ') || undefined,
    createdAt: now,
  };

  await db.collection<Message>(MESSAGES_COLLECTION).insertOne(message);

  // Update conversation record
  const updateFields: any = {
    lastMessageSnippet: filterResult.filteredText.slice(0, 100),
    lastMessageAt: now,
    updatedAt: now,
  };

  if (filterResult.isFlagged) {
    updateFields.status = 'flagged';
  }

  await db.collection<Conversation>(CONVERSATIONS_COLLECTION).updateOne(
    { conversationId: data.conversationId },
    {
      $set: updateFields,
      ...(filterResult.isFlagged ? { $inc: { flaggedCount: 1 } } : {}),
    }
  );

  return message;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  {
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
    lastMessageAt: new Date(Date.now() - 300000),
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
  },
  {
    conversationId: 'conv_supabase',
    orderId: 'ORD-9204-SUPA',
    kitId: 'kit-supabase-saas',
    kitSlug: 'supabase-saas-starter',
    kitTitle: 'Supabase Multi-Tenant SaaS Starter',
    buyerId: 'buyer_ashutosh',
    buyerEmail: 'ashutosh@agency.dev',
    buyerName: 'Ashutosh Dubey (Buyer)',
    sellerId: 'seller_devkit_core',
    sellerEmail: 'support@devkit.store',
    sellerName: 'DevKit Core Team (Seller)',
    status: 'active',
    flaggedCount: 0,
    lastMessageSnippet: 'Row-level security migration scripts executed smoothly!',
    lastMessageAt: new Date(Date.now() - 7200000),
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
  },
  {
    conversationId: 'conv_prompt',
    orderId: 'ORD-3810-PROMPT',
    kitId: 'prompt-nextjs-architect',
    kitSlug: 'nextjs-15-complete-saas-architect',
    kitTitle: 'Next.js 15 SaaS AI Blueprint',
    buyerId: 'buyer_ashutosh',
    buyerEmail: 'ashutosh@agency.dev',
    buyerName: 'Ashutosh Dubey (Buyer)',
    sellerId: 'seller_ai_architect',
    sellerEmail: 'architect@devkit.store',
    sellerName: 'AI Systems Architect',
    status: 'active',
    flaggedCount: 0,
    lastMessageSnippet: 'Tested the generation with Claude 3.5 Sonnet and worked out of the box!',
    lastMessageAt: new Date(Date.now() - 172800000),
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(),
  },
];

const DEMO_CONVERSATION = DEMO_CONVERSATIONS[0];

const DEMO_MESSAGES_MAP: Record<string, Message[]> = {
  conv_demo: [
    {
      messageId: 'msg_demo_1',
      conversationId: 'conv_demo',
      senderId: 'seller_devkit_core',
      senderName: 'DevKit Core Team (Seller)',
      senderRole: 'seller',
      originalContent: `### 👋 Welcome to Next.js 15 Razorpay Pro Kit!

Thank you for your purchase. Here is your quickstart setup guide:

#### 1. Quickstart Steps
- Download your source package using your order receipt.
- Unpack into your Next.js workspace.
- Install dependencies: \`npm install\`
- Copy environment template: \`cp .env.example .env.local\`

#### 2. Verification Status
- Runtime Tested: Next.js 15.1.0 on React 19
- Pass Rate: 100% (18 automated tests)

---
💬 Ask any questions directly in this thread! Note: All phone numbers and personal contacts are automatically masked to keep both buyer and seller protected.`,
      filteredContent: `### 👋 Welcome to Next.js 15 Razorpay Pro Kit!

Thank you for your purchase. Here is your quickstart setup guide:

#### 1. Quickstart Steps
- Download your source package using your order receipt.
- Unpack into your Next.js workspace.
- Install dependencies: \`npm install\`
- Copy environment template: \`cp .env.example .env.local\`

#### 2. Verification Status
- Runtime Tested: Next.js 15.1.0 on React 19
- Pass Rate: 100% (18 automated tests)

---
💬 Ask any questions directly in this thread! Note: All phone numbers and personal contacts are automatically masked to keep both buyer and seller protected.`,
      isFlagged: false,
      metadata: { isAutomatedReadme: true },
      createdAt: new Date(Date.now() - 3000000),
    },
    {
      messageId: 'msg_demo_2',
      conversationId: 'conv_demo',
      senderId: 'buyer_ashutosh',
      senderName: 'Ashutosh Dubey (Buyer)',
      senderRole: 'buyer',
      originalContent: 'Hey! How do I test the Razorpay webhook on my local machine without deploying to Vercel?',
      filteredContent: 'Hey! How do I test the Razorpay webhook on my local machine without deploying to Vercel?',
      isFlagged: false,
      createdAt: new Date(Date.now() - 2000000),
    },
    {
      messageId: 'msg_demo_3',
      conversationId: 'conv_demo',
      senderId: 'seller_devkit_core',
      senderName: 'DevKit Core Team (Seller)',
      senderRole: 'seller',
      originalContent: 'Great question! You can use ngrok or cloudflared tunnel to expose port 3000: `ngrok http 3000`. Then copy the https forwarding URL and set it in your Razorpay Test Dashboard webhook settings.',
      filteredContent: 'Great question! You can use ngrok or cloudflared tunnel to expose port 3000: `ngrok http 3000`. Then copy the https forwarding URL and set it in your Razorpay Test Dashboard webhook settings.',
      isFlagged: false,
      createdAt: new Date(Date.now() - 1000000),
    },
    {
      messageId: 'msg_demo_4',
      conversationId: 'conv_demo',
      senderId: 'buyer_ashutosh',
      senderName: 'Ashutosh Dubey (Buyer)',
      senderRole: 'buyer',
      originalContent: 'Awesome thanks! By the way, can I get your personal WhatsApp number 9876543210 for quick questions?',
      filteredContent: 'Awesome thanks! By the way, can I get your personal WhatsApp number [🔒 Contact info hidden to keep transactions safe inside DevKit] for quick questions?',
      isFlagged: true,
      flagReason: 'phone_leak, whatsapp_leak',
      createdAt: new Date(Date.now() - 300000),
    },
  ],
  conv_supabase: [
    {
      messageId: 'msg_supa_1',
      conversationId: 'conv_supabase',
      senderId: 'seller_devkit_core',
      senderName: 'DevKit Core Team (Seller)',
      senderRole: 'seller',
      originalContent: 'Welcome to Supabase Multi-Tenant SaaS! Check `supabase/migrations` for schema setup.',
      filteredContent: 'Welcome to Supabase Multi-Tenant SaaS! Check `supabase/migrations` for schema setup.',
      isFlagged: false,
      metadata: { isAutomatedReadme: true },
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      messageId: 'msg_supa_2',
      conversationId: 'conv_supabase',
      senderId: 'buyer_ashutosh',
      senderName: 'Ashutosh Dubey (Buyer)',
      senderRole: 'buyer',
      originalContent: 'Row-level security migration scripts executed smoothly!',
      filteredContent: 'Row-level security migration scripts executed smoothly!',
      isFlagged: false,
      createdAt: new Date(Date.now() - 7200000),
    },
  ],
  conv_prompt: [
    {
      messageId: 'msg_prm_1',
      conversationId: 'conv_prompt',
      senderId: 'seller_ai_architect',
      senderName: 'AI Systems Architect (Seller)',
      senderRole: 'seller',
      originalContent: 'Your AI Prompt Blueprint has been activated in DevKit AI Studio. You can run generation directly with Claude 3.5 Sonnet, GPT-4o, or Gemini 1.5 Pro.',
      filteredContent: 'Your AI Prompt Blueprint has been activated in DevKit AI Studio. You can run generation directly with Claude 3.5 Sonnet, GPT-4o, or Gemini 1.5 Pro.',
      isFlagged: false,
      metadata: { isAutomatedReadme: true },
      createdAt: new Date(Date.now() - 259200000),
    },
    {
      messageId: 'msg_prm_2',
      conversationId: 'conv_prompt',
      senderId: 'buyer_ashutosh',
      senderName: 'Ashutosh Dubey (Buyer)',
      senderRole: 'buyer',
      originalContent: 'Tested the generation with Claude 3.5 Sonnet and worked out of the box!',
      filteredContent: 'Tested the generation with Claude 3.5 Sonnet and worked out of the box!',
      isFlagged: false,
      createdAt: new Date(Date.now() - 172800000),
    },
  ],
};

const DEMO_MESSAGES = DEMO_MESSAGES_MAP.conv_demo;

/**
 * Fetches all messages for a conversation
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const db = await getDatabase();
    const stored = await db
      .collection<Message>(MESSAGES_COLLECTION)
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    return stored;
  } catch (err) {
    console.error('Error fetching conversation messages:', err);
    return [];
  }
}

/**
 * Fetches all conversations involving a specific user (either buyer or seller)
 */
export async function getUserConversations(userEmailOrId: string): Promise<Conversation[]> {
  try {
    const db = await getDatabase();
    const query = userEmailOrId
      ? {
          $or: [
            { buyerEmail: userEmailOrId },
            { sellerEmail: userEmailOrId },
            { sellerId: userEmailOrId },
            { buyerId: userEmailOrId },
          ],
        }
      : {};

    const stored = await db
      .collection<Conversation>(CONVERSATIONS_COLLECTION)
      .find(query)
      .sort({ lastMessageAt: -1 })
      .toArray();

    return stored;
  } catch (err) {
    console.error('Error fetching user conversations:', err);
    return [];
  }
}

/**
 * Fetches a single conversation by ID
 */
export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    const db = await getDatabase();
    const stored = await db
      .collection<Conversation>(CONVERSATIONS_COLLECTION)
      .findOne({ conversationId });

    return stored || null;
  } catch (err) {
    console.error('Error fetching conversation by id:', err);
    return null;
  }
}
