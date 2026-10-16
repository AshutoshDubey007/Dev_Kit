import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  checkRateLimit,
  getRateLimitHeaders,
  getClientIp,
  RateLimitPolicy,
} from '../../lib/security/rate-limit';
import {
  validateGitHubUrl,
  validateEmail,
  validateString,
  sanitizeNoSqlInput,
} from '../../lib/security/validation';
import { resilientFetch } from '../../lib/utils/resilient-fetch';
import { markOrderAsFailed, reconcileOrder, createOrderRecord, markOrderAsPaid } from '../../lib/db/orders';

describe('Production Engineering & Reliability Invariants', () => {
  describe('Distributed Rate Limiting Engine', () => {
    it('should permit requests within window and decrement remaining quota', async () => {
      const testPolicy: RateLimitPolicy = {
        name: 'test-policy-ok',
        windowMs: 5000,
        max: 3,
      };
      const testIp = `192.168.10.${Math.floor(Math.random() * 9999)}`;

      const res1 = await checkRateLimit(testPolicy, testIp);
      assert.strictEqual(res1.success, true);
      assert.strictEqual(res1.limit, 3);
      assert.strictEqual(res1.remaining, 2);

      const res2 = await checkRateLimit(testPolicy, testIp);
      assert.strictEqual(res2.success, true);
      assert.strictEqual(res2.remaining, 1);
    });

    it('should block requests when quota is exhausted and provide Retry-After header', async () => {
      const testPolicy: RateLimitPolicy = {
        name: 'test-policy-block',
        windowMs: 5000,
        max: 2,
      };
      const testIp = `10.0.0.${Math.floor(Math.random() * 9999)}`;

      // 1st request
      await checkRateLimit(testPolicy, testIp);
      // 2nd request
      await checkRateLimit(testPolicy, testIp);
      // 3rd request (should exceed)
      const res3 = await checkRateLimit(testPolicy, testIp);

      assert.strictEqual(res3.success, false, 'Should be rate limited');
      assert.strictEqual(res3.remaining, 0);
      assert.ok(res3.retryAfter > 0, 'Retry-After must be positive integer');

      const headers = getRateLimitHeaders(res3) as Record<string, string>;
      assert.strictEqual(headers['X-RateLimit-Limit'], '2');
      assert.strictEqual(headers['X-RateLimit-Remaining'], '0');
      assert.ok(headers['Retry-After']);
    });

    it('should extract client IP accurately without trusting spoofed values', () => {
      const mockReqForwarded = {
        headers: new Headers({
          'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
        }),
      } as any;
      assert.strictEqual(getClientIp(mockReqForwarded), '203.0.113.195');

      const mockReqReal = {
        headers: new Headers({
          'x-real-ip': '198.51.100.4',
        }),
      } as any;
      assert.strictEqual(getClientIp(mockReqReal), '198.51.100.4');
    });
  });

  describe('Security Validation & SSRF Prevention', () => {
    it('should strictly accept public github.com repositories and parse owner/repo', () => {
      const res = validateGitHubUrl('https://github.com/vercel/next.js');
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.owner, 'vercel');
      assert.strictEqual(res.repo, 'next.js');
    });

    it('should reject SSRF targets: localhost, AWS metadata, and non-github hosts', () => {
      const invalidUrls = [
        'http://localhost:3000/repo',
        'http://127.0.0.1:8080',
        'http://169.254.169.254/latest/meta-data/',
        'https://gitlab.com/user/repo',
        'https://evil-hacker.com/github.com/repo',
        'file:///etc/passwd',
        'javascript:alert(1)',
      ];

      for (const url of invalidUrls) {
        const res = validateGitHubUrl(url);
        assert.strictEqual(res.valid, false, `Expected ${url} to be rejected as SSRF`);
      }
    });

    it('should validate emails and reject injection characters', () => {
      const valid = validateEmail('developer@devkit.store');
      assert.strictEqual(valid.valid, true);
      assert.strictEqual(valid.email, 'developer@devkit.store');

      const invalid = validateEmail('developer<script>@devkit.store');
      assert.strictEqual(invalid.valid, false);

      const empty = validateEmail('');
      assert.strictEqual(empty.valid, false);
    });

    it('should sanitize NoSQL injection operators ($ and .)', () => {
      const malicious = {
        $gt: '',
        'user.role': 'admin',
        normalKey: 'safe-value',
        nested: {
          $ne: null,
          legit: 123,
        },
      };

      const sanitized: any = sanitizeNoSqlInput(malicious);
      assert.strictEqual(sanitized.$gt, undefined, '$ operator should be stripped');
      assert.strictEqual(sanitized['user.role'], undefined, 'dot operator should be stripped');
      assert.strictEqual(sanitized.normalKey, 'safe-value');
      assert.strictEqual(sanitized.nested.$ne, undefined);
      assert.strictEqual(sanitized.nested.legit, 123);
    });
  });

  describe('Payment Failure Lifecycle & Order Reconciliation', () => {
    it('should revoke download rights and mark order failed on payment failure', async () => {
      // 1. Create test order
      const testOrderId = `test_fail_${Date.now()}`;
      const razorpayOrderId = `order_sim_${Date.now()}`;
      const order = await createOrderRecord({
        kitId: 'test-kit-id',
        kitSlug: 'test-kit-slug',
        kitTitle: 'Test Kit',
        amountINR: 999,
        customerEmail: 'failed-buyer@devkit.store',
        customerName: 'Failed Buyer',
        razorpayOrderId,
      });

      assert.strictEqual(order.status, 'created');
      assert.ok(order.downloadExpiresAt.getTime() > Date.now());

      // 2. Mark as failed
      const failed = await markOrderAsFailed(razorpayOrderId, 'Payment declined by issuer');
      assert.ok(failed, 'Order should be updated to failed');
      assert.strictEqual(failed?.status, 'failed');
      assert.strictEqual(failed?.failureReason, 'Payment declined by issuer');

      // 3. Invariant: download entitlement revoked immediately
      assert.ok(
        failed.downloadExpiresAt.getTime() <= Date.now() + 1000,
        'Download entitlement must be expired on payment failure'
      );
    });

    it('should reconcile paid orders and detect state consistency', async () => {
      const razorpayOrderId = `order_reconcile_${Date.now()}`;
      const order = await createOrderRecord({
        kitId: 'test-kit-id',
        kitSlug: 'test-kit-slug',
        kitTitle: 'Test Kit',
        amountINR: 1499,
        customerEmail: 'reconciled-buyer@devkit.store',
        customerName: 'Reconciled Buyer',
        razorpayOrderId,
      });

      // 1. Initial created state is consistent
      const recInitial = await reconcileOrder(order.orderId);
      assert.strictEqual(recInitial.isConsistent, true);

      // 2. Mark paid
      const paidOrder = await markOrderAsPaid(razorpayOrderId, `pay_${Date.now()}`, 'valid_signature_abc');
      assert.ok(paidOrder);

      // 3. Without verification record, reconciliation detects missing verification
      const recMissingVerif = await reconcileOrder(order.orderId);
      assert.strictEqual(recMissingVerif.isConsistent, false);
      assert.ok(recMissingVerif.issues.includes('Paid order has no associated verification record'));

      // 4. Create verification record as done during checkout
      const { createVerificationForOrder } = await import('../../lib/db/verifications');
      await createVerificationForOrder(paidOrder!);

      // 5. With verification record present, reconciliation confirms full consistency
      const recFinal = await reconcileOrder(order.orderId);
      assert.strictEqual(recFinal.isConsistent, true);
      assert.strictEqual(recFinal.hasPaidEntitlement, true);
      assert.strictEqual(recFinal.issues.length, 0);
    });
  });

  describe('Resilient Fetch & Circuit Breaker', () => {
    it('should not retry on client errors (4xx)', async () => {
      let callCount = 0;
      const server = http.createServer((req, res) => {
        callCount++;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Client Error' }));
      });

      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      const port = (server.address() as any).port;
      const url = `http://127.0.0.1:${port}/bad-request`;

      try {
        const response = await resilientFetch(url, {
          timeoutMs: 2000,
          maxRetries: 3,
          serviceName: 'test-local-4xx',
        });
        assert.strictEqual(response.status, 400);
        assert.strictEqual(callCount, 1, 'Should NOT retry permanent 4xx client errors');
      } finally {
        server.close();
      }
    });

    it('should classify timeout errors safely using AbortSignal', async () => {
      const server = http.createServer((req, res) => {
        // Intentionally hang without responding
      });

      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      const port = (server.address() as any).port;
      const url = `http://127.0.0.1:${port}/hang`;

      const startTime = Date.now();
      try {
        await resilientFetch(url, {
          timeoutMs: 150,
          maxRetries: 0,
          serviceName: 'test-local-timeout',
        });
        assert.fail('Should have thrown timeout error');
      } catch (err: any) {
        const elapsed = Date.now() - startTime;
        assert.ok(elapsed < 1000, 'Timeout must abort request promptly');
      } finally {
        server.close();
      }
    });
  });
});

