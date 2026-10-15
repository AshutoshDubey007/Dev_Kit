import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { createNotification } from './notifications';
import { KITS } from '../../data/kits';

export type VerificationStatus =
  | 'pending'
  | 'verified_success'
  | 'issue_reported'
  | 'expired';

export interface ProductVerification {
  _id?: ObjectId;
  verificationId: string;
  orderId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  sellerId: string;
  sellerEmail?: string;
  sellerName?: string;
  purchaseVerifiedAt: Date;
  verificationDeadline: Date;
  verificationStatus: VerificationStatus;
  supportCaseId?: string;
  chatConversationId?: string;
  downloadToken?: string;
  lastReminderAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationAuditEvent {
  _id?: ObjectId;
  eventId: string;
  verificationId: string;
  orderId: string;
  actorId: string;
  actorRole: string;
  action:
    | 'created'
    | 'confirmed_works'
    | 'issue_reported'
    | 'expired'
    | 'conversation_closed'
    | 'reopened';
  notes?: string;
  timestamp: Date;
}

const VERIFICATIONS_COLLECTION = 'product_verifications';
const AUDIT_COLLECTION = 'verification_audit_events';
const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Ensures indexes for the product verifications and audit collections
 */
export async function ensureVerificationIndexes(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.collection(VERIFICATIONS_COLLECTION).createIndex({ orderId: 1 }, { unique: true });
    await db.collection(VERIFICATIONS_COLLECTION).createIndex({ buyerId: 1 });
    await db.collection(VERIFICATIONS_COLLECTION).createIndex({ buyerEmail: 1 });
    await db.collection(VERIFICATIONS_COLLECTION).createIndex({ sellerId: 1 });
    await db.collection(VERIFICATIONS_COLLECTION).createIndex({ verificationDeadline: 1 });
    await db.collection(VERIFICATIONS_COLLECTION).createIndex({ verificationStatus: 1 });
    await db.collection(AUDIT_COLLECTION).createIndex({ verificationId: 1 });
    await db.collection(AUDIT_COLLECTION).createIndex({ orderId: 1 });
  } catch (err) {
    console.warn('[Verifications DB] Index creation notice:', err);
  }
}

/**
 * Creates a persistent 7-day verification window for an eligible paid order.
 * Strictly idempotent: duplicate webhook triggers return existing verification.
 */
export async function createVerificationForOrder(
  order: {
    orderId: string;
    kitId: string;
    kitSlug: string;
    kitTitle: string;
    customerEmail: string;
    customerName: string;
    amountINR?: number;
    status?: string;
    downloadToken?: string;
    updatedAt?: Date;
    kitData?: any;
  },
  chatConversationId?: string,
  verifiedAtOverride?: Date
): Promise<ProductVerification> {
  const db = await getDatabase();

  // 1. Verify eligibility: unpaid, cancelled, or failed orders must not create verification
  if (order.status && order.status !== 'paid' && order.status !== 'created') {
    throw new Error(`Order ${order.orderId} is not eligible for verification. Status: ${order.status}`);
  }

  // 2. Idempotency Check: if verification already exists, return existing record
  const existing = await db
    .collection<ProductVerification>(VERIFICATIONS_COLLECTION)
    .findOne({ orderId: order.orderId });

  if (existing) {
    if (chatConversationId && !existing.chatConversationId) {
      await db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).updateOne(
        { orderId: order.orderId },
        { $set: { chatConversationId, updatedAt: new Date() } }
      );
      existing.chatConversationId = chatConversationId;
    }
    return existing;
  }

  // 3. Resolve seller info from kit
  let kit: any = null;
  try {
    kit = await db.collection('kits').findOne({ slug: order.kitSlug });
  } catch (err) {
    // Ignore db search error and fallback to catalog
  }
  if (!kit) {
    kit = KITS.find((k) => k.slug === order.kitSlug) || order.kitData;
  }

  const sellerId = kit?.sellerId || 'seller_devkit_core';
  const sellerName = kit?.sellerName || 'DevKit Core Team';
  const sellerEmail = kit?.sellerEmail || 'support@devkit.store';

  // 4. Calculate authoritative 7-day server deadline in UTC
  const purchaseVerifiedAt = verifiedAtOverride || order.updatedAt || new Date();
  const verificationDeadline = new Date(purchaseVerifiedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  const verificationId = `VERIF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date();

  const newVerification: ProductVerification = {
    verificationId,
    orderId: order.orderId,
    productId: order.kitId || order.kitSlug,
    productSlug: order.kitSlug,
    productTitle: order.kitTitle,
    buyerId: order.customerEmail.toLowerCase().trim(),
    buyerEmail: order.customerEmail.toLowerCase().trim(),
    buyerName: order.customerName.trim(),
    sellerId,
    sellerEmail,
    sellerName,
    purchaseVerifiedAt,
    verificationDeadline,
    verificationStatus: 'pending',
    chatConversationId,
    downloadToken: order.downloadToken,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).insertOne(newVerification);

  // 5. Record initial audit event
  await recordAuditEvent({
    verificationId,
    orderId: order.orderId,
    actorId: 'system',
    actorRole: 'system',
    action: 'created',
    notes: `7-day product verification window started. Deadline: ${verificationDeadline.toISOString()}`,
  });

  return newVerification;
}

/**
 * Retrieves verification record by orderId
 */
export async function getVerificationByOrderId(orderId: string): Promise<ProductVerification | null> {
  const db = await getDatabase();
  return db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).findOne({ orderId });
}

/**
 * Retrieves verification record by verificationId
 */
export async function getVerificationById(verificationId: string): Promise<ProductVerification | null> {
  const db = await getDatabase();
  return db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).findOne({ verificationId });
}

/**
 * Retrieves all verifications belonging to a buyer
 */
export async function getUserVerifications(buyerEmailOrId: string): Promise<ProductVerification[]> {
  const db = await getDatabase();
  const normalized = buyerEmailOrId.toLowerCase().trim();
  return db
    .collection<ProductVerification>(VERIFICATIONS_COLLECTION)
    .find({
      $or: [{ buyerEmail: normalized }, { buyerId: normalized }],
    })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Retrieves all verifications belonging to a seller
 */
export async function getSellerVerifications(sellerEmailOrId: string): Promise<ProductVerification[]> {
  const db = await getDatabase();
  const normalized = sellerEmailOrId.toLowerCase().trim();
  return db
    .collection<ProductVerification>(VERIFICATIONS_COLLECTION)
    .find({
      $or: [{ sellerEmail: normalized }, { sellerId: normalized }, { sellerId: sellerEmailOrId }],
    })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Buyer confirms "Product Works".
 * Authenticates buyer, verifies ownership, updates state, and safely closes verification-only chat
 * if no open support tickets exist.
 */
export async function confirmProductWorks(
  verificationId: string,
  buyerIdOrEmail: string,
  actorRole: string = 'buyer'
): Promise<{ success: boolean; verification?: ProductVerification; error?: string }> {
  const db = await getDatabase();
  const verification = await getVerificationById(verificationId);

  if (!verification) {
    return { success: false, error: 'Product verification record not found' };
  }

  // 1. Authorize: Only the buyer (or system operator/admin) can confirm the product works
  const normalizedUser = buyerIdOrEmail.toLowerCase().trim();
  const isOwner =
    verification.buyerEmail.toLowerCase() === normalizedUser ||
    verification.buyerId.toLowerCase() === normalizedUser;
  const isPrivileged = actorRole === 'operator' || actorRole === 'admin';

  if (!isOwner && !isPrivileged) {
    return {
      success: false,
      error: 'Unauthorized: Sellers or unrelated users cannot verify a product on behalf of the buyer',
    };
  }

  // 2. Idempotency check
  if (verification.verificationStatus === 'verified_success') {
    return { success: true, verification };
  }

  // 3. Verification window expiration check
  const now = new Date();
  if (verification.verificationDeadline.getTime() < now.getTime() && verification.verificationStatus === 'expired') {
    return { success: false, error: 'Cannot confirm: 7-day verification window has already expired' };
  }

  // 4. Check for open support tickets on this order
  const openTickets = await db.collection('support_tickets').countDocuments({
    verificationId,
    status: { $in: ['open', 'awaiting_seller', 'awaiting_buyer', 'resolution_proposed', 'reopened'] },
  });

  const shouldCloseChat = openTickets === 0 && Boolean(verification.chatConversationId);

  // 5. Update verification state to verified_success
  const updateResult = await db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).findOneAndUpdate(
    { verificationId },
    {
      $set: {
        verificationStatus: 'verified_success',
        resolvedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  );

  const updatedVerification = updateResult || verification;

  // 6. Close verification-only chat if no open issues exist
  if (shouldCloseChat && verification.chatConversationId) {
    await db.collection(CONVERSATIONS_COLLECTION).updateOne(
      { conversationId: verification.chatConversationId },
      {
        $set: {
          status: 'closed',
          closureReason: 'Product verified as working by buyer',
          closedAt: now,
          updatedAt: now,
        },
      }
    );
  }

  // 7. Record audit event
  await recordAuditEvent({
    verificationId,
    orderId: verification.orderId,
    actorId: buyerIdOrEmail,
    actorRole,
    action: 'confirmed_works',
    notes: `Buyer confirmed product works. Chat conversation ${
      shouldCloseChat ? 'safely closed' : 'kept open due to open tickets'
    }.`,
  });

  // 8. Notify the seller
  if (verification.sellerEmail) {
    await createNotification({
      userId: verification.sellerEmail,
      type: 'purchase',
      title: `Kit Verified: ${verification.productTitle}`,
      message: `${verification.buyerName} confirmed that ${verification.productTitle} installed and verified successfully.`,
      link: `/seller/my-kits`,
      read: false,
    });
  }

  return { success: true, verification: updatedVerification };
}

/**
 * Updates the verification status
 */
export async function updateVerificationStatus(
  verificationId: string,
  status: VerificationStatus,
  options?: { supportCaseId?: string; resolvedAt?: Date }
): Promise<ProductVerification | null> {
  const db = await getDatabase();
  const now = new Date();

  const setFields: any = {
    verificationStatus: status,
    updatedAt: now,
  };

  if (options?.supportCaseId) {
    setFields.supportCaseId = options.supportCaseId;
  }
  if (options?.resolvedAt) {
    setFields.resolvedAt = options.resolvedAt;
  }

  const result = await db.collection<ProductVerification>(VERIFICATIONS_COLLECTION).findOneAndUpdate(
    { verificationId },
    { $set: setFields },
    { returnDocument: 'after' }
  );

  return result || null;
}

/**
 * Records an audit event for traceability
 */
export async function recordAuditEvent(event: {
  verificationId: string;
  orderId: string;
  actorId: string;
  actorRole: string;
  action: VerificationAuditEvent['action'];
  notes?: string;
}): Promise<void> {
  try {
    const db = await getDatabase();
    const doc: VerificationAuditEvent = {
      eventId: `AUDIT-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      verificationId: event.verificationId,
      orderId: event.orderId,
      actorId: event.actorId,
      actorRole: event.actorRole,
      action: event.action,
      notes: event.notes,
      timestamp: new Date(),
    };
    await db.collection<VerificationAuditEvent>(AUDIT_COLLECTION).insertOne(doc);
  } catch (err) {
    console.error('[Verification Audit] Error inserting event:', err);
  }
}

/**
 * Retrieves audit events for a verification
 */
export async function getVerificationAuditEvents(verificationId: string): Promise<VerificationAuditEvent[]> {
  const db = await getDatabase();
  return db
    .collection<VerificationAuditEvent>(AUDIT_COLLECTION)
    .find({ verificationId })
    .sort({ timestamp: 1 })
    .toArray();
}
