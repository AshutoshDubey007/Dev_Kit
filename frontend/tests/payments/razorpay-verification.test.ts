import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

describe('Production Pipeline Security: Razorpay Cryptographic Verification', () => {
  const TEST_SECRET = 'ceA2x55uIWa59MM1WnfQPVru';
  const TEST_ORDER_ID = 'order_test_987654321';
  const TEST_PAYMENT_ID = 'pay_test_123456789';

  function generateValidSignature(orderId: string, paymentId: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
  ): boolean {
    if (!orderId || !paymentId || !signature || !secret) return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    // Constant time comparison to prevent timing attack vulnerabilities
    return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'));
  }

  function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!rawBody || !signature || !secret) return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    if (signature.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'));
  }

  describe('Checkout Payment Signature Verification', () => {
    it('should successfully verify valid HMAC-SHA256 payment signature', () => {
      const validSig = generateValidSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
      const isValid = verifyPaymentSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, validSig, TEST_SECRET);
      assert.equal(isValid, true);
    });

    it('should reject tampered signature', () => {
      const validSig = generateValidSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
      const tamperedSig = validSig.slice(0, -4) + '0000';
      const isValid = verifyPaymentSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, tamperedSig, TEST_SECRET);
      assert.equal(isValid, false);
    });

    it('should reject signature created with invalid secret', () => {
      const invalidSecretSig = generateValidSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, 'wrong_secret_key');
      const isValid = verifyPaymentSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, invalidSecretSig, TEST_SECRET);
      assert.equal(isValid, false);
    });

    it('should reject signature if order ID is tampered', () => {
      const validSig = generateValidSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
      const isValid = verifyPaymentSignature('order_test_TAMPERED', TEST_PAYMENT_ID, validSig, TEST_SECRET);
      assert.equal(isValid, false);
    });

    it('should reject signature if payment ID is tampered', () => {
      const validSig = generateValidSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
      const isValid = verifyPaymentSignature(TEST_ORDER_ID, 'pay_test_TAMPERED', validSig, TEST_SECRET);
      assert.equal(isValid, false);
    });
  });

  describe('Webhook Payload Cryptographic Verification', () => {
    const webhookSecret = 'devkit_rzp_webhook_secret_2026';
    const payloadObject = {
      entity: 'event',
      event: 'order.paid',
      contains: ['payment', 'order'],
      payload: {
        payment: {
          entity: {
            id: 'pay_1001',
            order_id: 'order_1001',
            amount: 499900,
            status: 'captured',
          },
        },
      },
    };
    const rawBody = JSON.stringify(payloadObject);

    it('should verify legitimate webhook event payload', () => {
      const validSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const isValid = verifyWebhookSignature(rawBody, validSignature, webhookSecret);
      assert.equal(isValid, true);
    });

    it('should reject webhook if body payload was modified after signing', () => {
      const validSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const tamperedBody = rawBody.replace('499900', '100'); // attacker tries to pay 1 INR instead
      const isValid = verifyWebhookSignature(tamperedBody, validSignature, webhookSecret);
      assert.equal(isValid, false);
    });

    it('should reject webhook if signed with unauthorized secret', () => {
      const rogueSignature = crypto
        .createHmac('sha256', 'rogue_secret_key')
        .update(rawBody)
        .digest('hex');

      const isValid = verifyWebhookSignature(rawBody, rogueSignature, webhookSecret);
      assert.equal(isValid, false);
    });
  });
});
