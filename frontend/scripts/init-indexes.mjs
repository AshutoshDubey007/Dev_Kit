#!/usr/bin/env node

/**
 * DevKit Production Database Index Initializer & Migration CLI
 * 
 * Verifies or provisions all unique constraints and query indexes in MongoDB.
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local if present
const envLocalPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not set. Please define MONGODB_URI in your environment or .env.local.');
  process.exit(1);
}

const AUTHORITATIVE_INDEXES = [
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

async function main() {
  console.log('🚀 Connecting to MongoDB to provision authoritative indexes...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db('devkit');

  let successCount = 0;
  for (const def of AUTHORITATIVE_INDEXES) {
    try {
      await db.collection(def.collection).createIndex(def.spec, def.options || {});
      successCount++;
      const uniqueFlag = def.options?.unique ? ' (UNIQUE)' : '';
      const ttlFlag = def.options?.expireAfterSeconds !== undefined ? ' (TTL)' : '';
      console.log(`  ✓ [${def.collection}] ${JSON.stringify(def.spec)}${uniqueFlag}${ttlFlag}`);
    } catch (err) {
      console.warn(`  ⚠️ [${def.collection}] Warning: ${err.message}`);
    }
  }

  await client.close();
  console.log(`\n🎉 Successfully verified/created ${successCount} authoritative database indexes.`);
}

main().catch((err) => {
  console.error('Fatal index initialization error:', err);
  process.exit(1);
});
