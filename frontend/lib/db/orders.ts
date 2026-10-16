import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export interface Order {
  _id?: ObjectId;
  orderId: string;
  kitId: string;
  kitSlug: string;
  kitTitle: string;
  amountINR: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  failureReason?: string;
  reconciledAt?: Date;
  downloadToken: string;
  downloadExpiresAt: Date;
  downloadCount: number;
  maxDownloads: number;
  createdAt: Date;
  updatedAt: Date;
  kitData?: any;
}

const ORDERS_COLLECTION = 'orders';
const WEBHOOK_EVENTS_COLLECTION = 'webhook_events';
let ordersIndexed = false;

/**
 * Ensures indexes exist for the orders and webhook events collection
 */
export async function ensureOrderIndexes(): Promise<void> {
  if (ordersIndexed) return;
  try {
    const db = await getDatabase();
    await db.collection<Order>(ORDERS_COLLECTION).createIndex({ orderId: 1 }, { unique: true });
    await db.collection<Order>(ORDERS_COLLECTION).createIndex({ razorpayOrderId: 1 }, { unique: true });
    await db.collection<Order>(ORDERS_COLLECTION).createIndex({ downloadToken: 1 }, { unique: true });
    await db.collection<Order>(ORDERS_COLLECTION).createIndex({ customerEmail: 1 });
    await db.collection(WEBHOOK_EVENTS_COLLECTION).createIndex({ eventId: 1 }, { unique: true });
    ordersIndexed = true;
  } catch (err) {
    console.warn('[Orders DB] Index creation notice:', err);
  }
}

/**
 * Records a webhook event and checks for duplicate delivery
 */
export async function recordWebhookEvent(
  eventId: string,
  eventType: string,
  orderId?: string
): Promise<{ isDuplicate: boolean }> {
  await ensureOrderIndexes();
  try {
    const db = await getDatabase();
    await db.collection(WEBHOOK_EVENTS_COLLECTION).insertOne({
      eventId,
      eventType,
      orderId,
      processedAt: new Date(),
    });
    return { isDuplicate: false };
  } catch (err: any) {
    if (err.code === 11000) {
      return { isDuplicate: true };
    }
    return { isDuplicate: false };
  }
}

/**
 * Creates a new pending order in MongoDB
 */
export async function createOrderRecord(data: {
  kitId: string;
  kitSlug: string;
  kitTitle: string;
  amountINR: number;
  customerEmail: string;
  customerName: string;
  razorpayOrderId: string;
  kitData?: any;
}): Promise<Order> {
  await ensureOrderIndexes();
  const db = await getDatabase();
  const downloadToken = crypto.randomBytes(24).toString('hex');
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days valid

  const newOrder: Order = {
    orderId,
    kitId: data.kitId,
    kitSlug: data.kitSlug,
    kitTitle: data.kitTitle,
    amountINR: data.amountINR,
    customerEmail: data.customerEmail.toLowerCase().trim(),
    customerName: data.customerName.trim(),
    razorpayOrderId: data.razorpayOrderId,
    kitData: data.kitData,
    status: 'created',
    downloadToken,
    downloadExpiresAt: expiresAt,
    downloadCount: 0,
    maxDownloads: 10,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<Order>(ORDERS_COLLECTION).insertOne(newOrder);
  return { ...newOrder, _id: result.insertedId };
}

/**
 * Finds an order by Razorpay order_id
 */
export async function getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
  const db = await getDatabase();
  return db.collection<Order>(ORDERS_COLLECTION).findOne({ razorpayOrderId });
}

/**
 * Finds an order by secret download token
 */
export async function getOrderByDownloadToken(downloadToken: string): Promise<Order | null> {
  const db = await getDatabase();
  return db.collection<Order>(ORDERS_COLLECTION).findOne({ downloadToken });
}

/**
 * Marks an order as paid upon successful signature verification or webhook confirmation
 */
export async function markOrderAsPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature?: string
): Promise<Order | null> {
  const db = await getDatabase();
  const now = new Date();

  const updateResult = await db.collection<Order>(ORDERS_COLLECTION).findOneAndUpdate(
    { razorpayOrderId },
    {
      $set: {
        status: 'paid',
        razorpayPaymentId,
        razorpaySignature,
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  );

  return updateResult || null;
}

/**
 * Increments download count when buyer downloads the package
 */
export async function incrementDownloadCount(downloadToken: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection<Order>(ORDERS_COLLECTION).updateOne(
    { downloadToken },
    {
      $inc: { downloadCount: 1 },
      $set: { updatedAt: new Date() },
    }
  );
  return result.modifiedCount > 0;
}

/**
 * Marks an order as failed upon payment failure notification or cancellation.
 * Revokes download rights and logs failure reason.
 */
export async function markOrderAsFailed(
  razorpayOrderId: string,
  failureReason = 'Payment failed or cancelled by buyer'
): Promise<Order | null> {
  const db = await getDatabase();
  const now = new Date();

  const updateResult = await db.collection<Order>(ORDERS_COLLECTION).findOneAndUpdate(
    { razorpayOrderId },
    {
      $set: {
        status: 'failed',
        failureReason,
        downloadExpiresAt: now, // immediately invalidate download window
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  );

  return updateResult || null;
}

/**
 * Reconciles an order against payment state, checking for consistency between
 * order status, verification records, and download entitlement.
 */
export async function reconcileOrder(orderId: string): Promise<{
  isConsistent: boolean;
  orderStatus: string;
  hasPaidEntitlement: boolean;
  issues: string[];
}> {
  const db = await getDatabase();
  const order = await db.collection<Order>(ORDERS_COLLECTION).findOne({ orderId });
  if (!order) {
    return { isConsistent: false, orderStatus: 'unknown', hasPaidEntitlement: false, issues: ['Order record not found'] };
  }

  const issues: string[] = [];
  const hasPaidEntitlement = order.status === 'paid' && Boolean(order.razorpayPaymentId);

  // If status is paid, razorpayPaymentId must be present
  if (order.status === 'paid' && !order.razorpayPaymentId) {
    issues.push('Order marked as paid but lacks razorpayPaymentId');
  }

  // If status is failed or created, downloadCount must be 0
  if (order.status !== 'paid' && order.downloadCount > 0) {
    issues.push(`Unpaid order has non-zero downloadCount: ${order.downloadCount}`);
  }

  // Check verification record consistency (in product_verifications collection)
  const verification = await db.collection('product_verifications').findOne({ orderId });
  if (order.status === 'paid' && !verification) {
    issues.push('Paid order has no associated verification record');
  }

  return {
    isConsistent: issues.length === 0,
    orderStatus: order.status,
    hasPaidEntitlement,
    issues,
  };
}
