/**
 * Master DevKit Production Test Suite Entry Point
 * Executes all security, compliance, payment, authorization, data, and configuration tests.
 */
import './env-setup';
import './security/scanner.test';
import './security/dlp-chat-filter.test';
import './payments/razorpay-verification.test';
import './auth/rbac-permissions.test';
import './data/marketplace-integrity.test';
import './data/kits-authoritative.test';
import './admin/admin-metrics.test';
import './projects/tasks-discussions.test';
import './studio/studio-provider.test';
import './config/environment.test';
import './verifications/product-verifications.test';
import './support/support-tickets-lifecycle.test';
import './security/production-hardening.test';
import './beta/beta-readiness.test';
import './reliability/production-engineering.test';

import { after } from 'node:test';
import clientPromise from '../lib/mongodb';

after(async () => {
  try {
    if (global._mongoClientPromise) {
      const client = await global._mongoClientPromise;
      await client.close();
    }
  } catch {}
});

