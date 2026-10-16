import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';

export type AnalyticsEventType =
  | 'page_view'
  | 'checkout_initiated'
  | 'payment_success'
  | 'download_completed'
  | 'verification_confirmed'
  | 'issue_reported'
  | 'ticket_resolved';

export interface AnalyticsEvent {
  _id?: ObjectId;
  eventType: AnalyticsEventType;
  entityId?: string; // e.g. kitSlug or kitId
  path?: string;     // e.g. /kits/nextjs-razorpay-pro
  sessionId?: string;// Ephemeral anonymous client hash (no personal data)
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface BetaAnalyticsSummary {
  totalPageViews: number;
  viewsByProduct: Record<string, number>;
  totalCheckoutInitiations: number;
  totalPaidOrders: number;
  conversionViewsToCheckout: number; // percentage
  conversionCheckoutToPaid: number;   // percentage
  totalDownloads: number;
  uniqueBuyersCount: number;
  repeatBuyersCount: number;
  repeatPurchaseRate: number;        // percentage
  verifications: {
    total: number;
    verifiedSuccess: number;
    pending: number;
    issueReported: number;
    expired: number;
    successRate: number;             // percentage
  };
  supportTickets: {
    total: number;
    open: number;
    resolved: number;
    resolutionRate: number;          // percentage
  };
}

const ANALYTICS_COLLECTION = 'analytics_events';

// In-memory fallback buffer for resilient offline logging and unit test verification
const inMemoryEvents: AnalyticsEvent[] = [];

/**
 * Ensures indexes exist on analytics_events collection
 */
export async function ensureAnalyticsIndexes(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.collection(ANALYTICS_COLLECTION).createIndex({ eventType: 1, timestamp: -1 });
    await db.collection(ANALYTICS_COLLECTION).createIndex({ entityId: 1 });
  } catch (err) {
    console.error('Error creating analytics indexes:', err);
  }
}

/**
 * Records a privacy-safe analytics event
 */
export async function recordAnalyticsEvent(
  eventType: AnalyticsEventType,
  data?: {
    entityId?: string;
    path?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }
): Promise<boolean> {
  // Sanitize metadata to never persist sensitive keys
  const cleanMeta = { ...data?.metadata };
  delete cleanMeta.password;
  delete cleanMeta.secret;
  delete cleanMeta.token;
  delete cleanMeta.card;
  delete cleanMeta.apiKey;

  const event: AnalyticsEvent = {
    eventType,
    entityId: data?.entityId ? String(data.entityId).trim().slice(0, 100) : undefined,
    path: data?.path ? String(data.path).trim().slice(0, 200) : undefined,
    sessionId: data?.sessionId ? String(data.sessionId).trim().slice(0, 64) : undefined,
    metadata: cleanMeta,
    timestamp: new Date(),
  };

  try {
    const db = await getDatabase();
    await db.collection<AnalyticsEvent>(ANALYTICS_COLLECTION).insertOne(event);
  } catch (err) {
    // Graceful offline fallback
    inMemoryEvents.push(event);
  }
  return true;
}

/**
 * Aggregates beta metrics across analytics_events, orders, verifications, and tickets
 */
export async function getBetaAnalyticsSummary(): Promise<BetaAnalyticsSummary> {
  let pageViews: AnalyticsEvent[] = [];
  let checkoutEvents: AnalyticsEvent[] = [];
  let paidOrders: any[] = [];
  let verifications: any[] = [];
  let tickets: any[] = [];

  try {
    const db = await getDatabase();
    [pageViews, checkoutEvents, paidOrders, verifications, tickets] = await Promise.all([
      db.collection<AnalyticsEvent>(ANALYTICS_COLLECTION).find({ eventType: 'page_view' }).toArray(),
      db.collection<AnalyticsEvent>(ANALYTICS_COLLECTION).find({ eventType: 'checkout_initiated' }).toArray(),
      db.collection('orders').find({ status: 'paid' }).toArray(),
      db.collection('product_verifications').find({}).toArray(),
      db.collection('support_tickets').find({}).toArray(),
    ]);
  } catch {
    // Use in-memory buffer if database is offline or in unit test mode
    pageViews = inMemoryEvents.filter((e) => e.eventType === 'page_view');
    checkoutEvents = inMemoryEvents.filter((e) => e.eventType === 'checkout_initiated');
  }

  const viewsByProduct: Record<string, number> = {};
  for (const v of pageViews) {
    if (v.entityId) {
      viewsByProduct[v.entityId] = (viewsByProduct[v.entityId] || 0) + 1;
    }
  }

  // Orders aggregation (paid count, downloads, unique & repeat buyers)
  const totalPaidOrders = paidOrders.length;
  const buyerOrderCounts: Record<string, number> = {};
  let totalDownloads = 0;

  for (const o of paidOrders as any[]) {
    const email = (o.customerEmail || '').toLowerCase().trim();
    if (email) {
      buyerOrderCounts[email] = (buyerOrderCounts[email] || 0) + 1;
    }
    if (typeof o.downloadCount === 'number') {
      totalDownloads += o.downloadCount;
    }
  }

  const uniqueBuyers = Object.keys(buyerOrderCounts);
  const uniqueBuyersCount = uniqueBuyers.length;
  const repeatBuyersCount = uniqueBuyers.filter((e) => buyerOrderCounts[e] > 1).length;
  const repeatPurchaseRate = uniqueBuyersCount > 0
    ? Math.round((repeatBuyersCount / uniqueBuyersCount) * 100)
    : 0;

  // Verifications aggregation
  const verifTotal = verifications.length;
  let verifSuccess = 0;
  let verifPending = 0;
  let verifIssue = 0;
  let verifExpired = 0;

  for (const v of verifications as any[]) {
    const status = v.verificationStatus;
    if (status === 'verified_success' || status === 'verified') verifSuccess++;
    else if (status === 'pending' || status === 'pending_buyer_verification') verifPending++;
    else if (status === 'issue_reported') verifIssue++;
    else if (status === 'expired' || status === 'closed') verifExpired++;
  }

  const verifSuccessRate = verifTotal > 0
    ? Math.round((verifSuccess / verifTotal) * 100)
    : 0;

  // Support Tickets aggregation
  const ticketsTotal = tickets.length;
  let ticketsResolved = 0;

  for (const t of tickets as any[]) {
    if (t.status === 'resolved' || t.status === 'closed') {
      ticketsResolved++;
    }
  }

  const ticketResolutionRate = ticketsTotal > 0
    ? Math.round((ticketsResolved / ticketsTotal) * 100)
    : 0;

  // Funnel conversion calculations (bounded 0 - 100%)
  const totalViews = pageViews.length;
  const totalCheckouts = checkoutEvents.length;
  const conversionViewsToCheckout = totalViews > 0
    ? Math.min(100, Math.max(0, Math.round((totalCheckouts / totalViews) * 100)))
    : 0;
  const conversionCheckoutToPaid = totalCheckouts > 0
    ? Math.min(100, Math.max(0, Math.round((totalPaidOrders / totalCheckouts) * 100)))
    : 0;

  return {
    totalPageViews: totalViews,
    viewsByProduct,
    totalCheckoutInitiations: totalCheckouts,
    totalPaidOrders,
    conversionViewsToCheckout,
    conversionCheckoutToPaid,
    totalDownloads,
    uniqueBuyersCount,
    repeatBuyersCount,
    repeatPurchaseRate,
    verifications: {
      total: verifTotal,
      verifiedSuccess: verifSuccess,
      pending: verifPending,
      issueReported: verifIssue,
      expired: verifExpired,
      successRate: verifSuccessRate,
    },
    supportTickets: {
      total: ticketsTotal,
      open: ticketsTotal - ticketsResolved,
      resolved: ticketsResolved,
      resolutionRate: ticketResolutionRate,
    },
  };
}
