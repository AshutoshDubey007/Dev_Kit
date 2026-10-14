import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderByRazorpayOrderId, markOrderAsPaid } from '../../../../lib/db/orders';
import { autoConnectBuyerSeller } from '@backend/chat/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Missing required payment verification details' },
        { status: 400 }
      );
    }

    const order = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found in database' }, { status: 404 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const isMock = razorpayOrderId.startsWith('order_sim_') || !keySecret || keySecret.includes('placeholder');

    if (!isMock) {
      if (!razorpaySignature) {
        return NextResponse.json({ error: 'Missing payment signature' }, { status: 400 });
      }

      // Verify HMAC-SHA256 signature
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (razorpaySignature !== expectedSignature) {
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

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.orderId,
      downloadToken: updatedOrder.downloadToken,
      conversationId,
      kitSlug: updatedOrder.kitSlug,
      kitTitle: updatedOrder.kitTitle,
      customerEmail: updatedOrder.customerEmail,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error verifying payment' },
      { status: 500 }
    );
  }
}
