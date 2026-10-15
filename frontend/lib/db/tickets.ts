import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { createNotification } from './notifications';
import { getVerificationById, updateVerificationStatus, ProductVerification } from './verifications';
import { sendChatMessage } from '@backend/chat/service';

export type TicketStatus =
  | 'open'
  | 'awaiting_seller'
  | 'awaiting_buyer'
  | 'resolution_proposed'
  | 'resolved'
  | 'closed'
  | 'reopened';

export interface TicketTimelineEvent {
  eventId: string;
  status: TicketStatus;
  actorId: string;
  actorRole: 'buyer' | 'seller' | 'operator' | 'admin' | 'system';
  notes?: string;
  timestamp: Date;
}

export interface SupportTicket {
  _id?: ObjectId;
  ticketId: string;
  verificationId: string;
  orderId: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  sellerId: string;
  sellerEmail?: string;
  sellerName?: string;
  chatConversationId: string;
  title: string;
  description: string;
  errorMessage?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  reproductionSteps?: string;
  environment: {
    os?: string;
    runtime?: string;
    frameworkVersion?: string;
    nodeVersion?: string;
    dependencies?: string;
  };
  attachments?: string[];
  status: TicketStatus;
  proposedResolution?: {
    notes: string;
    proposedAt: Date;
    proposedBy: string;
  };
  resolvedAt?: Date;
  timeline: TicketTimelineEvent[];
  lastReminderAt?: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TICKETS_COLLECTION = 'support_tickets';
const VERIFICATIONS_COLLECTION = 'product_verifications';
const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Ensures indexes for support tickets
 */
export async function ensureTicketIndexes(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.collection(TICKETS_COLLECTION).createIndex({ ticketId: 1 }, { unique: true });
    await db.collection(TICKETS_COLLECTION).createIndex({ verificationId: 1 });
    await db.collection(TICKETS_COLLECTION).createIndex({ orderId: 1 });
    await db.collection(TICKETS_COLLECTION).createIndex({ buyerEmail: 1 });
    await db.collection(TICKETS_COLLECTION).createIndex({ sellerEmail: 1 });
    await db.collection(TICKETS_COLLECTION).createIndex({ sellerId: 1 });
    await db.collection(TICKETS_COLLECTION).createIndex({ status: 1 });
    await db.collection(TICKETS_COLLECTION).createIndex({ lastActivityAt: 1 });
  } catch (err) {
    console.warn('[Tickets DB] Index creation notice:', err);
  }
}

/**
 * Creates a persistent support ticket during the product verification period.
 * Validates inputs, links to existing chat thread, updates verification status to 'issue_reported'.
 */
export async function createSupportTicket(input: {
  verificationId: string;
  buyerIdOrEmail: string;
  buyerRole?: string;
  title: string;
  description: string;
  errorMessage?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  reproductionSteps?: string;
  environment?: {
    os?: string;
    runtime?: string;
    frameworkVersion?: string;
    nodeVersion?: string;
    dependencies?: string;
  };
  attachments?: string[];
  referenceDate?: Date;
}): Promise<{ success: boolean; ticket?: SupportTicket; error?: string }> {
  const db = await getDatabase();

  // 1. Validation & sanitization
  const title = (input.title || '').trim().slice(0, 150);
  const description = (input.description || '').trim();

  if (!title || title.length < 5) {
    return { success: false, error: 'Issue title must be at least 5 characters long' };
  }
  if (!description || description.length < 10) {
    return { success: false, error: 'Issue description must provide at least 10 characters of detail' };
  }

  // 2. Fetch verification record
  const verification = await getVerificationById(input.verificationId);
  if (!verification) {
    return { success: false, error: 'Linked verification window not found' };
  }

  // 3. Authorization check
  const normalizedUser = input.buyerIdOrEmail.toLowerCase().trim();
  const isOwner =
    verification.buyerEmail.toLowerCase() === normalizedUser ||
    verification.buyerId.toLowerCase() === normalizedUser;
  const isPrivileged = input.buyerRole === 'operator' || input.buyerRole === 'admin';

  if (!isOwner && !isPrivileged) {
    return {
      success: false,
      error: 'Unauthorized: You cannot file a support ticket against another user’s order',
    };
  }

  // 4. Server-enforced Deadline Check
  const now = input.referenceDate || new Date();
  if (
    now.getTime() > verification.verificationDeadline.getTime() &&
    verification.verificationStatus === 'expired'
  ) {
    return {
      success: false,
      error: 'The 7-day product verification deadline has expired for this order. Tickets cannot be initiated after the window closes.',
    };
  }

  // 5. Chat thread resolution
  let chatConversationId = verification.chatConversationId;
  if (!chatConversationId) {
    // Attempt to locate conversation by orderId
    const existingConv = await db.collection('conversations').findOne({ orderId: verification.orderId });
    if (existingConv) {
      chatConversationId = existingConv.conversationId;
      await db.collection(VERIFICATIONS_COLLECTION).updateOne(
        { verificationId: verification.verificationId },
        { $set: { chatConversationId, updatedAt: now } }
      );
    }
  }

  // If conversation was closed, reopen it for the active ticket
  if (chatConversationId) {
    await db.collection(CONVERSATIONS_COLLECTION).updateOne(
      { conversationId: chatConversationId },
      { $set: { status: 'active', closureReason: null, updatedAt: now } }
    );
  }

  const ticketId = `TCK-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const initialTimeline: TicketTimelineEvent = {
    eventId: `EV-${Date.now()}-1`,
    status: 'open',
    actorId: input.buyerIdOrEmail,
    actorRole: 'buyer',
    notes: `Ticket opened: "${title}"`,
    timestamp: now,
  };

  const newTicket: SupportTicket = {
    ticketId,
    verificationId: verification.verificationId,
    orderId: verification.orderId,
    productId: verification.productId,
    productTitle: verification.productTitle,
    buyerId: verification.buyerId,
    buyerEmail: verification.buyerEmail,
    buyerName: verification.buyerName,
    sellerId: verification.sellerId,
    sellerEmail: verification.sellerEmail,
    sellerName: verification.sellerName,
    chatConversationId: chatConversationId || '',
    title,
    description,
    errorMessage: input.errorMessage?.trim() || undefined,
    expectedBehavior: input.expectedBehavior?.trim() || undefined,
    actualBehavior: input.actualBehavior?.trim() || undefined,
    reproductionSteps: input.reproductionSteps?.trim() || undefined,
    environment: {
      os: input.environment?.os?.trim() || 'Unspecified',
      runtime: input.environment?.runtime?.trim() || 'Node.js',
      frameworkVersion: input.environment?.frameworkVersion?.trim() || 'Next.js 15.1.0',
      nodeVersion: input.environment?.nodeVersion?.trim() || 'v20.x LTS',
      dependencies: input.environment?.dependencies?.trim() || undefined,
    },
    attachments: input.attachments || [],
    status: 'open',
    timeline: [initialTimeline],
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<SupportTicket>(TICKETS_COLLECTION).insertOne(newTicket);

  // 6. Update verification status to 'issue_reported'
  await updateVerificationStatus(verification.verificationId, 'issue_reported', {
    supportCaseId: ticketId,
  });

  // 7. Auto-inject structured ticket summary into the private chat
  if (chatConversationId) {
    try {
      const ticketMessageContent = `### 🚨 Support Ticket Created: ${title}
**Ticket ID**: \`${ticketId}\`
**Status**: Open (Verification Window Preserved)

**Description**:
${description}

${input.errorMessage ? `**Error Message**:\n\`\`\`\n${input.errorMessage}\n\`\`\`\n` : ''}
${input.reproductionSteps ? `**Reproduction Steps**:\n${input.reproductionSteps}\n` : ''}

**Environment**:
- **OS**: ${newTicket.environment.os}
- **Runtime**: ${newTicket.environment.runtime} (${newTicket.environment.nodeVersion})
- **Framework**: ${newTicket.environment.frameworkVersion}

---
*The seller has been notified. You can collaborate directly in this chat to resolve this issue.*`;

      await sendChatMessage({
        conversationId: chatConversationId,
        senderId: input.buyerIdOrEmail,
        senderName: verification.buyerName,
        senderRole: 'buyer',
        content: ticketMessageContent,
      });
    } catch (msgErr) {
      console.warn('[Tickets DB] Could not dispatch initial ticket message to chat:', msgErr);
    }
  }

  // 8. In-app notification to seller
  if (verification.sellerEmail) {
    await createNotification({
      userId: verification.sellerEmail,
      type: 'chat',
      title: `Issue Reported: ${verification.productTitle}`,
      message: `${verification.buyerName} opened ticket ${ticketId}: "${title}". Please reply in chat.`,
      link: `/seller/support`,
      read: false,
    });
  }

  return { success: true, ticket: newTicket };
}

/**
 * Seller proposes a resolution to the open ticket
 */
export async function proposeTicketResolution(
  ticketId: string,
  sellerEmailOrId: string,
  resolutionNotes: string,
  actorRole: string = 'seller'
): Promise<{ success: boolean; ticket?: SupportTicket; error?: string }> {
  const db = await getDatabase();
  const ticket = await db.collection<SupportTicket>(TICKETS_COLLECTION).findOne({ ticketId });

  if (!ticket) {
    return { success: false, error: 'Support ticket not found' };
  }

  const normalizedUser = sellerEmailOrId.toLowerCase().trim();
  const isSeller =
    (ticket.sellerEmail && ticket.sellerEmail.toLowerCase() === normalizedUser) ||
    ticket.sellerId.toLowerCase() === normalizedUser;
  const isPrivileged = actorRole === 'operator' || actorRole === 'admin';

  if (!isSeller && !isPrivileged) {
    return { success: false, error: 'Unauthorized: Only the assigned seller can propose a resolution' };
  }

  const now = new Date();
  const timelineEvent: TicketTimelineEvent = {
    eventId: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'resolution_proposed',
    actorId: sellerEmailOrId,
    actorRole: 'seller',
    notes: resolutionNotes,
    timestamp: now,
  };

  const updateResult = await db.collection<SupportTicket>(TICKETS_COLLECTION).findOneAndUpdate(
    { ticketId },
    {
      $set: {
        status: 'resolution_proposed',
        proposedResolution: {
          notes: resolutionNotes,
          proposedAt: now,
          proposedBy: sellerEmailOrId,
        },
        lastActivityAt: now,
        updatedAt: now,
      },
      $push: {
        timeline: timelineEvent,
      },
    },
    { returnDocument: 'after' }
  );

  const updatedTicket = updateResult || ticket;

  // Post resolution notification in chat
  if (ticket.chatConversationId) {
    try {
      await sendChatMessage({
        conversationId: ticket.chatConversationId,
        senderId: sellerEmailOrId,
        senderName: ticket.sellerName || 'Seller',
        senderRole: 'seller',
        content: `### 💡 Resolution Proposed for ${ticket.ticketId}\n\n${resolutionNotes}\n\n*Buyer: Please test the resolution and confirm below if this solved your problem.*`,
      });
    } catch (e) {
      console.warn('Could not post resolution message to chat:', e);
    }
  }

  // Notify buyer
  await createNotification({
    userId: ticket.buyerEmail,
    type: 'chat',
    title: `Resolution Proposed: ${ticket.title}`,
    message: `${ticket.sellerName || 'Seller'} proposed a solution for ticket ${ticket.ticketId}. Please review in your dashboard.`,
    link: `/buyer/verifications`,
    read: false,
  });

  return { success: true, ticket: updatedTicket };
}

/**
 * Buyer confirms resolution of the support ticket
 */
export async function confirmTicketResolution(
  ticketId: string,
  buyerEmailOrId: string,
  actorRole: string = 'buyer'
): Promise<{ success: boolean; ticket?: SupportTicket; error?: string }> {
  const db = await getDatabase();
  const ticket = await db.collection<SupportTicket>(TICKETS_COLLECTION).findOne({ ticketId });

  if (!ticket) {
    return { success: false, error: 'Support ticket not found' };
  }

  const normalizedUser = buyerEmailOrId.toLowerCase().trim();
  const isBuyer =
    ticket.buyerEmail.toLowerCase() === normalizedUser ||
    ticket.buyerId.toLowerCase() === normalizedUser;
  const isPrivileged = actorRole === 'operator' || actorRole === 'admin';

  if (!isBuyer && !isPrivileged) {
    return { success: false, error: 'Unauthorized: Only the buyer can confirm resolution' };
  }

  const now = new Date();
  const timelineEvent: TicketTimelineEvent = {
    eventId: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'resolved',
    actorId: buyerEmailOrId,
    actorRole: 'buyer',
    notes: 'Buyer confirmed resolution',
    timestamp: now,
  };

  const updateResult = await db.collection<SupportTicket>(TICKETS_COLLECTION).findOneAndUpdate(
    { ticketId },
    {
      $set: {
        status: 'resolved',
        resolvedAt: now,
        lastActivityAt: now,
        updatedAt: now,
      },
      $push: {
        timeline: timelineEvent,
      },
    },
    { returnDocument: 'after' }
  );

  const updatedTicket = updateResult || ticket;

  // Check if all tickets on this verification are now resolved
  const remainingOpenTickets = await db.collection(TICKETS_COLLECTION).countDocuments({
    verificationId: ticket.verificationId,
    status: { $in: ['open', 'awaiting_seller', 'awaiting_buyer', 'resolution_proposed', 'reopened'] },
  });

  if (remainingOpenTickets === 0) {
    await updateVerificationStatus(ticket.verificationId, 'verified_success', {
      resolvedAt: now,
    });
  }

  // Notify seller
  if (ticket.sellerEmail) {
    await createNotification({
      userId: ticket.sellerEmail,
      type: 'purchase',
      title: `Ticket Resolved: ${ticket.title}`,
      message: `${ticket.buyerName} confirmed that ticket ${ticket.ticketId} is successfully resolved.`,
      link: `/seller/support`,
      read: false,
    });
  }

  return { success: true, ticket: updatedTicket };
}

/**
 * Buyer reopens a support ticket if problem persists
 */
export async function reopenTicket(
  ticketId: string,
  buyerEmailOrId: string,
  reason: string,
  actorRole: string = 'buyer'
): Promise<{ success: boolean; ticket?: SupportTicket; error?: string }> {
  const db = await getDatabase();
  const ticket = await db.collection<SupportTicket>(TICKETS_COLLECTION).findOne({ ticketId });

  if (!ticket) {
    return { success: false, error: 'Support ticket not found' };
  }

  const normalizedUser = buyerEmailOrId.toLowerCase().trim();
  const isBuyer =
    ticket.buyerEmail.toLowerCase() === normalizedUser ||
    ticket.buyerId.toLowerCase() === normalizedUser;
  const isPrivileged = actorRole === 'operator' || actorRole === 'admin';

  if (!isBuyer && !isPrivileged) {
    return { success: false, error: 'Unauthorized: Only the buyer can reopen this ticket' };
  }

  const now = new Date();
  const timelineEvent: TicketTimelineEvent = {
    eventId: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'reopened',
    actorId: buyerEmailOrId,
    actorRole: 'buyer',
    notes: reason || 'Buyer requested reopen',
    timestamp: now,
  };

  const updateResult = await db.collection<SupportTicket>(TICKETS_COLLECTION).findOneAndUpdate(
    { ticketId },
    {
      $set: {
        status: 'reopened',
        lastActivityAt: now,
        updatedAt: now,
      },
      $push: {
        timeline: timelineEvent,
      },
    },
    { returnDocument: 'after' }
  );

  // Keep verification in issue_reported
  await updateVerificationStatus(ticket.verificationId, 'issue_reported', {
    supportCaseId: ticketId,
  });

  // Reopen chat thread
  if (ticket.chatConversationId) {
    await db.collection(CONVERSATIONS_COLLECTION).updateOne(
      { conversationId: ticket.chatConversationId },
      { $set: { status: 'active', closureReason: null, updatedAt: now } }
    );
  }

  // Notify seller
  if (ticket.sellerEmail) {
    await createNotification({
      userId: ticket.sellerEmail,
      type: 'chat',
      title: `Ticket Reopened: ${ticket.title}`,
      message: `${ticket.buyerName} reopened ticket ${ticket.ticketId}: "${reason}".`,
      link: `/seller/support`,
      read: false,
    });
  }

  return { success: true, ticket: updateResult || ticket };
}

/**
 * Updates ticket status directly (used by seller/buyer messages and transitions)
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  actorId: string,
  actorRole: TicketTimelineEvent['actorRole'],
  notes?: string
): Promise<SupportTicket | null> {
  const db = await getDatabase();
  const now = new Date();

  const timelineEvent: TicketTimelineEvent = {
    eventId: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: newStatus,
    actorId,
    actorRole,
    notes,
    timestamp: now,
  };

  const result = await db.collection<SupportTicket>(TICKETS_COLLECTION).findOneAndUpdate(
    { ticketId },
    {
      $set: {
        status: newStatus,
        lastActivityAt: now,
        updatedAt: now,
      },
      $push: {
        timeline: timelineEvent,
      },
    },
    { returnDocument: 'after' }
  );

  return result || null;
}

/**
 * Retrieves ticket by ticketId
 */
export async function getTicketById(ticketId: string): Promise<SupportTicket | null> {
  const db = await getDatabase();
  return db.collection<SupportTicket>(TICKETS_COLLECTION).findOne({ ticketId });
}

/**
 * Retrieves all tickets for a user (as buyer or seller)
 */
export async function getUserTickets(
  userEmailOrId: string,
  role?: 'buyer' | 'seller' | 'operator' | 'admin'
): Promise<SupportTicket[]> {
  const db = await getDatabase();
  const normalized = userEmailOrId.toLowerCase().trim();

  let query: any = {};
  if (role === 'buyer') {
    query = { $or: [{ buyerEmail: normalized }, { buyerId: normalized }] };
  } else if (role === 'seller') {
    query = { $or: [{ sellerEmail: normalized }, { sellerId: normalized }, { sellerId: userEmailOrId }] };
  } else if (role === 'operator' || role === 'admin') {
    query = {};
  } else {
    query = {
      $or: [
        { buyerEmail: normalized },
        { buyerId: normalized },
        { sellerEmail: normalized },
        { sellerId: normalized },
      ],
    };
  }

  return db
    .collection<SupportTicket>(TICKETS_COLLECTION)
    .find(query)
    .sort({ updatedAt: -1 })
    .toArray();
}

/**
 * Retrieves all tickets associated with a specific verification window
 */
export async function getTicketsForVerification(verificationId: string): Promise<SupportTicket[]> {
  const db = await getDatabase();
  return db
    .collection<SupportTicket>(TICKETS_COLLECTION)
    .find({ verificationId })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Automated Cron & Lifecycle Process:
 * 1. Closes expired 7-day verifications if NO issues/tickets were reported.
 *    - Preserves conversations and tickets if a ticket was filed before deadline!
 * 2. Sends periodic follow-up reminders (24h first reminder, 48h subsequent)
 *    for tickets awaiting seller or buyer response.
 *
 * Supports deterministic testing by passing a simulated `currentDate`.
 */
export async function processVerificationExpirationsAndReminders(currentDate: Date = new Date()): Promise<{
  expiredVerificationsCount: number;
  closedConversationsCount: number;
  remindersSentCount: number;
  processedAt: Date;
}> {
  const db = await getDatabase();
  let expiredVerificationsCount = 0;
  let closedConversationsCount = 0;
  let remindersSentCount = 0;

  // -------------------------------------------------------------
  // 1. Process 7-Day Expired Verifications
  // -------------------------------------------------------------
  const expiredCandidates = await db
    .collection<ProductVerification>(VERIFICATIONS_COLLECTION)
    .find({
      verificationDeadline: { $lte: currentDate },
      verificationStatus: 'pending',
    })
    .toArray();

  for (const verification of expiredCandidates) {
    // Check if an open support ticket exists
    const openTicketsCount = await db.collection<SupportTicket>(TICKETS_COLLECTION).countDocuments({
      verificationId: verification.verificationId,
      status: { $in: ['open', 'awaiting_seller', 'awaiting_buyer', 'resolution_proposed', 'reopened'] },
    });

    if (openTicketsCount === 0) {
      // No issues reported within 7 days: Mark verification as expired and safely close conversation
      await db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).updateOne(
        { verificationId: verification.verificationId },
        {
          $set: {
            verificationStatus: 'expired',
            resolvedAt: currentDate,
            updatedAt: currentDate,
          },
        }
      );
      expiredVerificationsCount++;

      if (verification.chatConversationId) {
        await db.collection(CONVERSATIONS_COLLECTION).updateOne(
          { conversationId: verification.chatConversationId },
          {
            $set: {
              status: 'closed',
              closureReason: '7-day product verification period concluded without issue reports',
              closedAt: currentDate,
              updatedAt: currentDate,
            },
          }
        );
        closedConversationsCount++;
      }
    } else {
      // Open ticket exists! The ticket keeps the conversation open even past day 7
      // Keep verification in 'issue_reported'
      await db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).updateOne(
        { verificationId: verification.verificationId },
        {
          $set: {
            verificationStatus: 'issue_reported',
            updatedAt: currentDate,
          },
        }
      );
    }
  }

  // -------------------------------------------------------------
  // 2. Periodic Response Reminders (24h first, 48h subsequent)
  // -------------------------------------------------------------
  const pendingTickets = await db
    .collection<SupportTicket>(TICKETS_COLLECTION)
    .find({
      status: { $in: ['open', 'awaiting_seller', 'awaiting_buyer', 'resolution_proposed'] },
    })
    .toArray();

  for (const ticket of pendingTickets) {
    const baselineTime = ticket.lastReminderAt || ticket.lastActivityAt || ticket.createdAt;
    const diffMs = currentDate.getTime() - new Date(baselineTime).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    const isFirstReminderNeeded = !ticket.lastReminderAt && diffHours >= 24;
    const isFollowupReminderNeeded = ticket.lastReminderAt && diffHours >= 48;

    if (isFirstReminderNeeded || isFollowupReminderNeeded) {
      const intervalLabel = isFirstReminderNeeded ? '24 hours' : '48 hours';

      // Decide target recipient
      let recipientEmail = ticket.sellerEmail;
      let recipientRole = 'seller';
      let title = `Reminder: Response needed on ticket ${ticket.ticketId}`;
      let message = `No activity for over ${intervalLabel} on "${ticket.title}". Please update the ticket to keep resolution moving.`;

      if (ticket.status === 'awaiting_buyer' || ticket.status === 'resolution_proposed') {
        recipientEmail = ticket.buyerEmail;
        recipientRole = 'buyer';
        title = `Reminder: Please review ticket ${ticket.ticketId}`;
        message = `The seller has responded or proposed a solution on "${ticket.title}". Please confirm whether it resolved your issue.`;
      }

      if (recipientEmail) {
        await createNotification({
          userId: recipientEmail,
          type: 'chat',
          title,
          message,
          link: recipientRole === 'seller' ? '/seller/support' : '/buyer/verifications',
          read: false,
        });

        await db.collection<SupportTicket>(TICKETS_COLLECTION).updateOne(
          { ticketId: ticket.ticketId },
          {
            $set: {
              lastReminderAt: currentDate,
              updatedAt: currentDate,
            },
          }
        );
        remindersSentCount++;
      }
    }
  }

  return {
    expiredVerificationsCount,
    closedConversationsCount,
    remindersSentCount,
    processedAt: currentDate,
  };
}
