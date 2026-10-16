import { NextRequest, NextResponse } from 'next/server';
import { getKitBySlugFromDb, createKitInDb } from '@/lib/db/kits';
import { createOrderRecord } from '../../../../lib/db/orders';
import {
  checkRateLimit,
  RATE_LIMIT_POLICIES,
  createRateLimitResponse,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/security/rate-limit';
import { validateEmail, validateString } from '@/lib/security/validation';
import { resilientFetch } from '@/lib/utils/resilient-fetch';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (15 req/min per client IP)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(RATE_LIMIT_POLICIES.checkout, clientIp);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const body = await req.json();
    const { kitSlug, customerEmail, customerName, kitData, kitId } = body;

    if ((!kitSlug && !kitId) || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: kitSlug/kitId, customerEmail, customerName' },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // 2. Strict Input Validation & Bounds
    const emailVal = validateEmail(customerEmail);
    if (!emailVal.valid) {
      return NextResponse.json(
        { error: emailVal.error },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const nameVal = validateString(customerName, {
      fieldName: 'Customer Name',
      minLength: 2,
      maxLength: 100,
      required: true,
    });
    if (!nameVal.valid) {
      return NextResponse.json(
        { error: nameVal.error },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Look up authoritative product from MongoDB
    const targetIdentifier = kitSlug || kitId;
    let kit = await getKitBySlugFromDb(targetIdentifier);

    // If not found, check if kitData has an ID or slug to query
    if (!kit && kitData) {
      if (kitData.slug) kit = await getKitBySlugFromDb(kitData.slug);
      if (!kit && kitData.id) kit = await getKitBySlugFromDb(kitData.id);
      if (!kit && kitData.title) {
        kit = await createKitInDb({
          id: kitData.id,
          slug: kitData.slug,
          title: kitData.title,
          tagline: kitData.tagline || kitData.title,
          category: kitData.category || 'payments',
          priceINR: Number(kitData.priceINR) || 1499,
          sellerEmail: kitData.sellerEmail || 'creator@devkit.store',
          sellerName: kitData.sellerName,
          sellerId: kitData.sellerId,
          readmeContent: kitData.readmeContent,
          githubUrl: kitData.githubUrl,
          zipFileName: kitData.zipFileName,
          uploadMethod: kitData.uploadMethod,
          techStack: kitData.techStack,
          features: kitData.features,
        });
      }
    }

    if (!kit) {
      return NextResponse.json(
        { error: 'Kit not found in marketplace catalog' },
        { status: 404, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Authoritative server-side price determination (client price ignored)
    const authoritativePriceINR = kit.priceINR;

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const isMock = !keyId || keyId.includes('placeholder');

    let razorpayOrderId = '';

    if (!isMock) {
      // Real Razorpay API Order Creation with Resilient Fetch & Circuit Breaker
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpResponse = await resilientFetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: authoritativePriceINR * 100, // amount in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            kitSlug: kit.slug,
            customerEmail: emailVal.email,
          },
        }),
        timeoutMs: 8000,
        maxRetries: 2,
        serviceName: 'razorpay-orders',
      });

      if (!rzpResponse.ok) {
        const errData = await rzpResponse.json().catch(() => ({}));
        return NextResponse.json(
          { error: (errData as any).error?.description || 'Failed to create Razorpay order' },
          { status: 502, headers: getRateLimitHeaders(rateLimit) }
        );
      }

      const rzpData = await rzpResponse.json();
      razorpayOrderId = rzpData.id;
    } else {
      // Sandbox / Test Simulator Mode
      razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    // Record order in MongoDB
    const order = await createOrderRecord({
      kitId: kit.id,
      kitSlug: kit.slug,
      kitTitle: kit.title,
      amountINR: authoritativePriceINR,
      customerEmail: emailVal.email,
      customerName: nameVal.value,
      razorpayOrderId,
      kitData: kit,
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.orderId,
        razorpayOrderId,
        amountINR: authoritativePriceINR,
        amountPaise: authoritativePriceINR * 100,
        currency: 'INR',
        keyId: isMock ? 'rzp_test_simulated' : keyId,
        isSimulated: isMock,
      },
      {
        headers: getRateLimitHeaders(rateLimit),
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error creating order' },
      { status: 500 }
    );
  }
}
