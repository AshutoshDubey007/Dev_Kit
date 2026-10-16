import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderByRazorpayOrderId, markOrderAsPaid } from '../../../../lib/db/orders';
import { autoConnectBuyerSeller } from '@backend/chat/service';
import { createVerificationForOrder } from '../../../../lib/db/verifications';
import { recordAnalyticsEvent } from '@/lib/db/analytics';
import {
  checkRateLimit,
  RATE_LIMIT_POLICIES,
  createRateLimitResponse,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/security/rate-limit';
import { validateString } from '@/lib/security/validation';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (15 req/min per client IP)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(RATE_LIMIT_POLICIES.checkout, clientIp);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    const orderIdVal = validateString(razorpayOrderId, {
      fieldName: 'razorpayOrderId',
      minLength: 5,
      maxLength: 150,
      required: true,
    });
    const paymentIdVal = validateString(razorpayPaymentId, {
      fieldName: 'razorpayPaymentId',
      minLength: 5,
      maxLength: 150,
      required: true,
    });

    if (!orderIdVal.valid || !paymentIdVal.valid) {
      return NextResponse.json(
        { error: 'Missing or invalid required payment verification details' },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const order = await getOrderByRazorpayOrderId(orderIdVal.value);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found in database' },
        { status: 404, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (razorpayOrderId.startsWith('order_sim_')) {
        return NextResponse.json(
          { error: 'Simulated orders are rejected in production mode.' },
          { status: 403 }
        );
      }
      if (!keySecret || keySecret.includes('placeholder')) {
        return NextResponse.json(
          { error: 'Payment gateway configuration error.' },
          { status: 500 }
        );
      }
    }

    const isMock = !isProduction && (razorpayOrderId.startsWith('order_sim_') || !keySecret || keySecret.includes('placeholder'));

    if (!isMock) {
      if (!razorpaySignature) {
        return NextResponse.json({ error: 'Missing payment signature' }, { status: 400 });
      }

      // Verify HMAC-SHA256 signature using constant-time comparison
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      const sigBuf = Buffer.from(razorpaySignature, 'utf8');
      const expBuf = Buffer.from(expectedSignature, 'utf8');

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json(
          { error: 'Invalid payment signature. Verification failed.' },
          { status: 400 }
        );
      }
    }

    // Update MongoDB status to 'paid'
    const updatedOrder = await markOrderAsPaid(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature || 'simulated_signature'
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // Auto-connect buyer directly to seller with setup README
    let conversationId: string | null = null;
    try {
      const conv = await autoConnectBuyerSeller({
        orderId: updatedOrder.orderId,
        kitId: updatedOrder.kitId,
        kitSlug: updatedOrder.kitSlug,
        kitTitle: updatedOrder.kitTitle,
        customerEmail: updatedOrder.customerEmail,
        customerName: updatedOrder.customerName,
        kitData: updatedOrder.kitData,
      });
      conversationId = conv.conversationId;
    } catch (err) {
      console.error('Error auto-connecting buyer and seller:', err);
    }

    // Initialize 7-Day Product Verification Window
    let verificationId: string | null = null;
    try {
      const verif = await createVerificationForOrder(
        updatedOrder,
        conversationId || undefined
      );
      verificationId = verif.verificationId;
    } catch (verifErr) {
      console.error('Error initializing product verification window:', verifErr);
    }

    // Record payment success analytics event
    recordAnalyticsEvent('payment_success', {
      entityId: updatedOrder.kitSlug,
      path: '/api/checkout/verify-payment',
      metadata: {
        orderId: updatedOrder.orderId,
        amountINR: updatedOrder.amountINR,
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        orderId: updatedOrder.orderId,
        downloadToken: updatedOrder.downloadToken,
        conversationId,
        verificationId,
        kitSlug: updatedOrder.kitSlug,
        kitTitle: updatedOrder.kitTitle,
        customerEmail: updatedOrder.customerEmail,
      },
      {
        headers: getRateLimitHeaders(rateLimit),
      }
    );
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error verifying payment' },
      { status: 500 }
    );
  }
}
