/**
 * DevKit Centralized Database Index Management & Migration Engine
 * 
 * Defines and ensures all authoritative indexes, unique constraints,
 * and TTL lifecycles across MongoDB collections to guarantee high performance,
 * query efficiency, and transaction idempotency.
 */

import { getDatabase } from '../mongodb';

export interface IndexDefinition {
  collection: string;
  spec: Record<string, 1 | -1 | 'text'>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
    expireAfterSeconds?: number;
    name?: string;
  };
}

export const AUTHORITATIVE_INDEXES: IndexDefinition[] = [
  // 1. Marketplace Kits Catalog
  { collection: 'kits', spec: { slug: 1 }, options: { unique: true } },
  { collection: 'kits', spec: { id: 1 }, options: { unique: true } },
  { collection: 'kits', spec: { category: 1 } },
  { collection: 'kits', spec: { sellerEmail: 1 } },
  { collection: 'kits', spec: { sellerId: 1 } },
  { collection: 'kits', spec: { createdAt: -1 } },

  // 2. Orders & Financial Transactions
  { collection: 'orders', spec: { orderId: 1 }, options: { unique: true } },
  { collection: 'orders', spec: { razorpayOrderId: 1 }, options: { unique: true } },
  { collection: 'orders', spec: { downloadToken: 1 }, options: { unique: true } },
  { collection: 'orders', spec: { customerEmail: 1 } },
  { collection: 'orders', spec: { status: 1 } },
  { collection: 'orders', spec: { createdAt: -1 } },

  // 3. Webhook Events (Delivery Idempotency)
  { collection: 'webhook_events', spec: { eventId: 1 }, options: { unique: true } },
  { collection: 'webhook_events', spec: { createdAt: 1 } },

  // 4. Seven-Day Product Verification Window
  { collection: 'verifications', spec: { orderId: 1 }, options: { unique: true } },
  { collection: 'verifications', spec: { buyerId: 1 } },
  { collection: 'verifications', spec: { buyerEmail: 1 } },
  { collection: 'verifications', spec: { sellerId: 1 } },
  { collection: 'verifications', spec: { verificationDeadline: 1 } },
  { collection: 'verifications', spec: { verificationStatus: 1 } },
  { collection: 'audit_verifications', spec: { verificationId: 1 } },
  { collection: 'audit_verifications', spec: { orderId: 1 } },

  // 5. Support Tickets & Transitions
  { collection: 'tickets', spec: { ticketId: 1 }, options: { unique: true } },
  { collection: 'tickets', spec: { verificationId: 1 } },
  { collection: 'tickets', spec: { orderId: 1 } },
  { collection: 'tickets', spec: { buyerEmail: 1 } },
  { collection: 'tickets', spec: { sellerEmail: 1 } },
  { collection: 'tickets', spec: { sellerId: 1 } },
  { collection: 'tickets', spec: { status: 1 } },
  { collection: 'tickets', spec: { lastActivityAt: 1 } },

  // 6. Direct Support Conversations & Messages
  { collection: 'conversations', spec: { conversationId: 1 }, options: { unique: true } },
  { collection: 'conversations', spec: { orderId: 1 } },
  { collection: 'conversations', spec: { buyerId: 1 } },
  { collection: 'conversations', spec: { sellerEmail: 1 } },
  { collection: 'conversations', spec: { status: 1 } },
  { collection: 'conversations', spec: { lastMessageAt: -1 } },
  { collection: 'messages', spec: { messageId: 1 }, options: { unique: true } },
  { collection: 'messages', spec: { conversationId: 1, createdAt: 1 } },

  // 7. Community Discussions
  { collection: 'discussions', spec: { id: 1 }, options: { unique: true } },
  { collection: 'discussions', spec: { category: 1 } },
  { collection: 'discussions', spec: { createdAt: -1 } },

  // 8. Code Repositories
  { collection: 'repositories', spec: { id: 1 }, options: { unique: true } },
  { collection: 'repositories', spec: { ownerUsername: 1, name: 1 }, options: { unique: true } },
  { collection: 'repositories', spec: { slug: 1 } },
  { collection: 'repositories', spec: { visibility: 1 } },

  // 9. AI Prompts & Studio
  { collection: 'prompts', spec: { id: 1 }, options: { unique: true } },
  { collection: 'prompts', spec: { slug: 1 }, options: { unique: true } },
  { collection: 'prompts', spec: { category: 1 } },
  { collection: 'generated_projects', spec: { projectId: 1 }, options: { unique: true } },
  { collection: 'generated_projects', spec: { userId: 1, createdAt: -1 } },

  // 10. User Notifications
  { collection: 'notifications', spec: { id: 1 }, options: { unique: true } },
  { collection: 'notifications', spec: { userId: 1, createdAt: -1 } },

  // 11. Privacy-Preserving Analytics
  { collection: 'analytics_events', spec: { eventType: 1, timestamp: -1 } },
  { collection: 'analytics_events', spec: { entityId: 1 } },

  // 12. Distributed Rate Limits (TTL Automatic Cleanup)
  { collection: 'rate_limits', spec: { key: 1 }, options: { unique: true } },
  { collection: 'rate_limits', spec: { expireAt: 1 }, options: { expireAfterSeconds: 0 } },
];

let indexesInitialized = false;

/**
 * Deploys or verifies all authoritative database indexes. Safe to run repeatedly (idempotent).
 */
export async function ensureAllDatabaseIndexes(): Promise<{
  success: boolean;
  totalIndexes: number;
  createdOrVerified: number;
  errors: string[];
}> {
  if (indexesInitialized) {
    return { success: true, totalIndexes: AUTHORITATIVE_INDEXES.length, createdOrVerified: AUTHORITATIVE_INDEXES.length, errors: [] };
  }

  const errors: string[] = [];
  let successCount = 0;

  try {
    const db = await getDatabase();

    for (const def of AUTHORITATIVE_INDEXES) {
      try {
        await db.collection(def.collection).createIndex(def.spec as any, def.options || {});
        successCount++;
      } catch (err: any) {
        // If an existing index exists with differing options, note it without crashing
        errors.push(`[${def.collection}] ${JSON.stringify(def.spec)}: ${err.message}`);
      }
    }

    if (errors.length === 0) {
      indexesInitialized = true;
    }

    return {
      success: errors.length === 0,
      totalIndexes: AUTHORITATIVE_INDEXES.length,
      createdOrVerified: successCount,
      errors,
    };
  } catch (err: any) {
    console.error('[Database Indexes] Critical failure establishing database indexes:', err);
    return {
      success: false,
      totalIndexes: AUTHORITATIVE_INDEXES.length,
      createdOrVerified: successCount,
      errors: [err.message],
    };
  }
}
