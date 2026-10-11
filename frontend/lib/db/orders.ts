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
  status: 'created' | 'paid' | 'failed';
  downloadToken: string;
  downloadExpiresAt: Date;
  downloadCount: number;
  maxDownloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const ORDERS_COLLECTION = 'orders';

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
}): Promise<Order> {
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
