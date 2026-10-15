import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderByRazorpayOrderId, markOrderAsPaid } from '../../../../lib/db/orders';
import { autoConnectBuyerSeller } from '@backend/chat/service';
import { createVerificationForOrder } from '../../../../lib/db/verifications';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      '';

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
    }

    // Verify cryptographic HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[Razorpay Webhook] Invalid signature detected');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Handle order.paid or payment.captured
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await getOrderByRazorpayOrderId(razorpayOrderId);
        if (order && order.status !== 'paid') {
          const updatedOrder = await markOrderAsPaid(
            razorpayOrderId,
            razorpayPaymentId || `pay_wh_${Date.now()}`,
            signature
          );

          if (updatedOrder) {
            let conversationId: string | undefined = undefined;
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
            } catch (chatErr) {
              console.error('[Razorpay Webhook] Error connecting buyer and seller:', chatErr);
            }

            try {
              await createVerificationForOrder(updatedOrder, conversationId);
            } catch (verifErr) {
              console.error('[Razorpay Webhook] Error creating product verification window:', verifErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Error processing event:', err);
    return NextResponse.json(
      { error: err.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
