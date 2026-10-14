import { NextRequest, NextResponse } from 'next/server';
import { KITS } from '../../../../data/kits';
import { createOrderRecord } from '../../../../lib/db/orders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kitSlug, customerEmail, customerName, kitData } = body;

    if (!kitSlug || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: kitSlug, customerEmail, customerName' },
        { status: 400 }
      );
    }

    let kit = KITS.find((k) => k.slug === kitSlug);
    if (!kit && kitData) {
      kit = {
        id: kitData.id || `kit-${Date.now()}`,
        slug: kitData.slug || kitSlug,
        title: kitData.title || kitSlug,
        tagline: kitData.tagline || kitData.title || 'Verified Kit',
        shortDescription: kitData.shortDescription || kitData.title || 'Verified Kit',
        description: kitData.description || kitData.readmeContent || '',
        category: kitData.category || 'payments',
        priceINR: Number(kitData.priceINR) || 1499,
        priceUSD:
          Number(kitData.priceUSD) ||
          Math.max(9, Math.round((Number(kitData.priceINR) || 1499) / 83)),
        framework: kitData.framework || 'Next.js 15 (App Router)',
        techStack: kitData.techStack || ['Next.js 15', 'TypeScript'],
        features: kitData.features || ['Full source code', 'Verified install'],
        verification: kitData.verification || {
          verifiedDate: new Date().toISOString().split('T')[0],
          nextjsVersion: '15.1.0',
          nodeVersion: 'v20.18.0+',
          testSuitePassRate: 100,
          automatedTestsCount: 10,
          cleanInstallVerified: true,
          testedWithReact: 'React 19',
          knownLimitations: [],
          auditSummary: 'Clean install verified.',
        },
        codePreviews: kitData.codePreviews || [
          {
            filename: 'README.md',
            language: 'markdown',
            description: 'Setup instructions',
            code: kitData.readmeContent || kitData.description || '# Setup Guide',
          },
        ],
        rating: 5.0,
        reviewCount: 1,
        salesCount: 1,
        isFeatured: true,
        lastUpdated: new Date().toISOString().split('T')[0],
        license: 'Commercial',
        supportScope: 'In-app Chat',
        sellerId: kitData.sellerId,
        sellerName: kitData.sellerName,
        sellerEmail: kitData.sellerEmail,
        uploadMethod: kitData.uploadMethod,
        githubUrl: kitData.githubUrl || kitData.githubPreviewUrl,
        zipFileName: kitData.zipFileName,
        zipFileSize: kitData.zipFileSize,
        readmeContent: kitData.readmeContent,
      };
    }

    if (!kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const isMock = !keyId || keyId.includes('placeholder');

    let razorpayOrderId = '';

    if (!isMock) {
      // Real Razorpay API Order Creation
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: kit.priceINR * 100, // amount in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            kitSlug: kit.slug,
            customerEmail,
          },
        }),
      });

      if (!rzpResponse.ok) {
        const errData = await rzpResponse.json();
        return NextResponse.json(
          { error: errData.error?.description || 'Failed to create Razorpay order' },
          { status: 500 }
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
      amountINR: kit.priceINR,
      customerEmail,
      customerName,
      razorpayOrderId,
      kitData: kit,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      razorpayOrderId,
      amountINR: kit.priceINR,
      amountPaise: kit.priceINR * 100,
      currency: 'INR',
      keyId: isMock ? 'rzp_test_simulated' : keyId,
      isSimulated: isMock,
    });
  } catch (error: any) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error creating order' },
      { status: 500 }
    );
  }
}
