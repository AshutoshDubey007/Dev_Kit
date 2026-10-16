import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent, AnalyticsEventType } from '@/lib/db/analytics';

const ALLOWED_EVENT_TYPES: Set<AnalyticsEventType> = new Set([
  'page_view',
  'checkout_initiated',
  'payment_success',
  'download_completed',
  'verification_confirmed',
  'issue_reported',
  'ticket_resolved',
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, entityId, path, sessionId, metadata } = body;

    if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
      return NextResponse.json(
        { error: 'Invalid or unsupported analytics event type' },
        { status: 400 }
      );
    }

    // Persist event in MongoDB
    await recordAnalyticsEvent(eventType, {
      entityId,
      path,
      sessionId,
      metadata,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    // Non-blocking for client telemetry
    console.error('Error ingesting analytics event:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
