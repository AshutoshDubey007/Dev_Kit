import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Testable in-memory data store for verifying verification invariants and clock control
describe('Feature Quality: 7-Day Product Verification Window Invariants', () => {
  interface MockOrder {
    orderId: string;
    kitId: string;
    kitSlug: string;
    kitTitle: string;
    customerEmail: string;
    customerName: string;
    status: 'created' | 'paid' | 'failed' | 'cancelled';
    downloadToken: string;
    updatedAt: Date;
  }

  interface MockVerification {
    verificationId: string;
    orderId: string;
    productId: string;
    buyerId: string;
    buyerEmail: string;
    buyerName: string;
    sellerId: string;
    purchaseVerifiedAt: Date;
    verificationDeadline: Date;
    verificationStatus: 'pending' | 'verified_success' | 'issue_reported' | 'expired';
    chatConversationId?: string;
    resolvedAt?: Date;
    auditLogs: Array<{ action: string; actorId: string; timestamp: Date }>;
  }

  interface MockConversation {
    conversationId: string;
    orderId: string;
    status: 'active' | 'closed';
    closureReason?: string | null;
  }

  // Controllable virtual clock
  let virtualClock: Date;
  let verificationsStore: Map<string, MockVerification>;
  let conversationsStore: Map<string, MockConversation>;
  let ticketsStore: Array<{ verificationId: string; status: string }>;

  beforeEach(() => {
    virtualClock = new Date('2026-10-16T12:00:00.000Z');
    verificationsStore = new Map();
    conversationsStore = new Map();
    ticketsStore = [];
  });

  function createVerificationForOrder(order: MockOrder, convId?: string, overrideTime?: Date): MockVerification {
    if (order.status !== 'paid' && order.status !== 'created') {
      throw new Error(`Order ${order.orderId} is ineligible for verification. Status: ${order.status}`);
    }

    if (verificationsStore.has(order.orderId)) {
      return verificationsStore.get(order.orderId)!;
    }

    const purchaseVerifiedAt = overrideTime || order.updatedAt || virtualClock;
    const verificationDeadline = new Date(purchaseVerifiedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const verif: MockVerification = {
      verificationId: `VERIF-${order.orderId}`,
      orderId: order.orderId,
      productId: order.kitId,
      buyerId: order.customerEmail.toLowerCase(),
      buyerEmail: order.customerEmail.toLowerCase(),
      buyerName: order.customerName,
      sellerId: 'seller_devkit_core',
      purchaseVerifiedAt,
      verificationDeadline,
      verificationStatus: 'pending',
      chatConversationId: convId,
      auditLogs: [{ action: 'created', actorId: 'system', timestamp: purchaseVerifiedAt }],
    };

    verificationsStore.set(order.orderId, verif);
    return verif;
  }

  function confirmProductWorks(
    verificationId: string,
    buyerEmail: string,
    role: string = 'buyer',
    currentTime: Date = virtualClock
  ): { success: boolean; error?: string; verification?: MockVerification } {
    const verif = Array.from(verificationsStore.values()).find((v) => v.verificationId === verificationId);
    if (!verif) return { success: false, error: 'Verification not found' };

    // Authorization
    const isOwner = verif.buyerEmail.toLowerCase() === buyerEmail.toLowerCase();
    const isPrivileged = role === 'admin' || role === 'operator';
    if (!isOwner && !isPrivileged) {
      return { success: false, error: 'Unauthorized: Cannot verify order on behalf of another buyer' };
    }

    // Idempotent return
    if (verif.verificationStatus === 'verified_success') {
      return { success: true, verification: verif };
    }

    // Expiration check
    if (currentTime.getTime() > verif.verificationDeadline.getTime() && verif.verificationStatus === 'expired') {
      return { success: false, error: 'Verification window has already expired' };
    }

    // Check open tickets
    const openTickets = ticketsStore.filter(
      (t) => t.verificationId === verificationId && ['open', 'awaiting_seller', 'awaiting_buyer'].includes(t.status)
    );

    const shouldCloseChat = openTickets.length === 0;

    verif.verificationStatus = 'verified_success';
    verif.resolvedAt = currentTime;
    verif.auditLogs.push({ action: 'confirmed_works', actorId: buyerEmail, timestamp: currentTime });

    if (shouldCloseChat && verif.chatConversationId && conversationsStore.has(verif.chatConversationId)) {
      const conv = conversationsStore.get(verif.chatConversationId)!;
      conv.status = 'closed';
      conv.closureReason = 'Product verified as working by buyer';
    }

    return { success: true, verification: verif };
  }

  describe('Core Verification Window Creation & Calculation', () => {
    it('should calculate authoritative 7-day deadline in UTC from purchase timestamp', () => {
      const order: MockOrder = {
        orderId: 'ORD-TEST-001',
        kitId: 'nextjs-razorpay-pro',
        kitSlug: 'nextjs-razorpay-pro',
        kitTitle: 'Next.js 15 Razorpay Pro',
        customerEmail: 'buyer@test.com',
        customerName: 'Test Buyer',
        status: 'paid',
        downloadToken: 'tok_123',
        updatedAt: virtualClock,
      };

      const verif = createVerificationForOrder(order, 'conv_001');

      assert.equal(verif.verificationStatus, 'pending');
      assert.equal(verif.purchaseVerifiedAt.toISOString(), '2026-10-16T12:00:00.000Z');

      // Exactly 7 days (7 * 24 * 60 * 60 * 1000 = 604,800,000 ms)
      const expectedDeadline = new Date('2026-10-23T12:00:00.000Z');
      assert.equal(verif.verificationDeadline.getTime(), expectedDeadline.getTime());
      assert.equal(verif.verificationDeadline.toISOString(), '2026-10-23T12:00:00.000Z');
    });

    it('should enforce idempotency and never duplicate verification window on webhook retries', () => {
      const order: MockOrder = {
        orderId: 'ORD-DUP-002',
        kitId: 'nextjs-razorpay-pro',
        kitSlug: 'nextjs-razorpay-pro',
        kitTitle: 'Next.js 15 Razorpay Pro',
        customerEmail: 'buyer@test.com',
        customerName: 'Test Buyer',
        status: 'paid',
        downloadToken: 'tok_dup',
        updatedAt: virtualClock,
      };

      const firstCall = createVerificationForOrder(order, 'conv_dup');
      const secondCall = createVerificationForOrder(order, 'conv_dup');
      const thirdCall = createVerificationForOrder(order, 'conv_dup');

      assert.equal(firstCall.verificationId, secondCall.verificationId);
      assert.equal(secondCall.verificationId, thirdCall.verificationId);
      assert.equal(verificationsStore.size, 1);
    });

    it('should reject ineligible, failed, or cancelled orders', () => {
      const failedOrder: MockOrder = {
        orderId: 'ORD-FAIL-003',
        kitId: 'nextjs-razorpay-pro',
        kitSlug: 'nextjs-razorpay-pro',
        kitTitle: 'Next.js 15 Razorpay Pro',
        customerEmail: 'buyer@test.com',
        customerName: 'Test Buyer',
        status: 'failed',
        downloadToken: 'tok_fail',
        updatedAt: virtualClock,
      };

      assert.throws(() => {
        createVerificationForOrder(failedOrder);
      }, /ineligible for verification/);

      const cancelledOrder: MockOrder = {
        ...failedOrder,
        orderId: 'ORD-CANCEL-004',
        status: 'cancelled',
      };

      assert.throws(() => {
        createVerificationForOrder(cancelledOrder);
      }, /ineligible for verification/);
    });
  });

  describe('Product Works Confirmation Action', () => {
    it('should confirm product works and record resolvedAt timestamp', () => {
      const order: MockOrder = {
        orderId: 'ORD-WORKS-005',
        kitId: 'nextjs-razorpay-pro',
        kitSlug: 'nextjs-razorpay-pro',
        kitTitle: 'Next.js 15 Razorpay Pro',
        customerEmail: 'buyer@test.com',
        customerName: 'Test Buyer',
        status: 'paid',
        downloadToken: 'tok_005',
        updatedAt: virtualClock,
      };

      conversationsStore.set('conv_005', { conversationId: 'conv_005', orderId: order.orderId, status: 'active' });
      const verif = createVerificationForOrder(order, 'conv_005');

      // 2 days into the window
      const confirmationClock = new Date('2026-10-18T14:30:00.000Z');
      const result = confirmProductWorks(verif.verificationId, 'buyer@test.com', 'buyer', confirmationClock);

      assert.equal(result.success, true);
      assert.equal(result.verification?.verificationStatus, 'verified_success');
      assert.equal(result.verification?.resolvedAt?.toISOString(), '2026-10-18T14:30:00.000Z');

      // Conversation must be safely closed since no tickets were opened
      const conv = conversationsStore.get('conv_005');
      assert.equal(conv?.status, 'closed');
      assert.match(conv?.closureReason || '', /verified as working/i);
    });

    it('should prevent seller or unauthorized user from verifying on behalf of the buyer', () => {
      const order: MockOrder = {
        orderId: 'ORD-AUTH-006',
        kitId: 'nextjs-razorpay-pro',
        kitSlug: 'nextjs-razorpay-pro',
        kitTitle: 'Next.js 15 Razorpay Pro',
        customerEmail: 'legitbuyer@test.com',
        customerName: 'Legit Buyer',
        status: 'paid',
        downloadToken: 'tok_006',
        updatedAt: virtualClock,
      };

      const verif = createVerificationForOrder(order, 'conv_006');

      // Seller attempts to verify
      const sellerAttempt = confirmProductWorks(verif.verificationId, 'seller@devkit.store', 'seller');
      assert.equal(sellerAttempt.success, false);
      assert.match(sellerAttempt.error || '', /Unauthorized/);

      // Random third party attempts to verify
      const thirdPartyAttempt = confirmProductWorks(verif.verificationId, 'stranger@example.com', 'buyer');
      assert.equal(thirdPartyAttempt.success, false);
      assert.match(thirdPartyAttempt.error || '', /Unauthorized/);

      // Status must remain pending
      assert.equal(verif.verificationStatus, 'pending');
    });

    it('should preserve conversation if an open ticket exists even when product works is triggered', () => {
      const order: MockOrder = {
        orderId: 'ORD-TICKET-007',
        kitId: 'nextjs-razorpay-pro',
        kitSlug: 'nextjs-razorpay-pro',
        kitTitle: 'Next.js 15 Razorpay Pro',
        customerEmail: 'buyer@test.com',
        customerName: 'Test Buyer',
        status: 'paid',
        downloadToken: 'tok_007',
        updatedAt: virtualClock,
      };

      conversationsStore.set('conv_007', { conversationId: 'conv_007', orderId: order.orderId, status: 'active' });
      const verif = createVerificationForOrder(order, 'conv_007');

      // Simulate open ticket
      ticketsStore.push({ verificationId: verif.verificationId, status: 'open' });

      const result = confirmProductWorks(verif.verificationId, 'buyer@test.com', 'buyer', virtualClock);
      assert.equal(result.success, true);

      // Conversation must remain active to allow support completion
      const conv = conversationsStore.get('conv_007');
      assert.equal(conv?.status, 'active');
    });

    it('should be idempotent on repeated product works confirmations', () => {
      const order: MockOrder = {
        orderId: 'ORD-IDEMP-008',
        kitId: 'nextjs-razorpay-pro',
        kitSlug: 'nextjs-razorpay-pro',
        kitTitle: 'Next.js 15 Razorpay Pro',
        customerEmail: 'buyer@test.com',
        customerName: 'Test Buyer',
        status: 'paid',
        downloadToken: 'tok_008',
        updatedAt: virtualClock,
      };

      const verif = createVerificationForOrder(order);
      const res1 = confirmProductWorks(verif.verificationId, 'buyer@test.com');
      const res2 = confirmProductWorks(verif.verificationId, 'buyer@test.com');

      assert.equal(res1.success, true);
      assert.equal(res2.success, true);
      assert.equal(res1.verification?.verificationStatus, 'verified_success');
      assert.equal(res2.verification?.verificationStatus, 'verified_success');
    });
  });
});
