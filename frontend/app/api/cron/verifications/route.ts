import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processVerificationExpirationsAndReminders } from '../../../../lib/db/tickets';

function isAuthorized(req: NextRequest): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, an explicit secure CRON_SECRET must be set
  if (isProduction && (!configuredSecret || configuredSecret === 'devkit_cron_secret')) {
    console.error('[Cron Security] CRON_SECRET must be explicitly configured in production');
    return false;
  }

  const effectiveSecret = configuredSecret || 'devkit_cron_secret';
  const authHeader = req.headers.get('authorization');
  const url = new URL(req.url);
  const querySecret = url.searchParams.get('secret');

  // Allow in non-production local test runner only if no secret is set
  if (!isProduction && !authHeader && !querySecret && !configuredSecret) {
    return true;
  }

  const providedSecret = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : (querySecret || '');

  if (!providedSecret) {
    return false;
  }

  const providedBuf = Buffer.from(providedSecret, 'utf8');
  const expectedBuf = Buffer.from(effectiveSecret, 'utf8');

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const { searchParams } = new URL(req.url);
    const dateParam = !isProduction ? searchParams.get('simulatedDate') : null;
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const result = await processVerificationExpirationsAndReminders(targetDate);
    return NextResponse.json({
      success: true,
      summary: result,
      message: 'Automated 7-day expiration and follow-up reminder cycle completed',
    });
  } catch (error: any) {
    console.error('Error executing verification cron cycle:', error);
    return NextResponse.json(
      { error: 'Cron execution failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    let targetDate = new Date();

    if (!isProduction) {
      try {
        const body = await req.json();
        if (body?.simulatedDate) {
          targetDate = new Date(body.simulatedDate);
        }
      } catch {
        // Body may be empty
      }
    }

    const result = await processVerificationExpirationsAndReminders(targetDate);
    return NextResponse.json({
      success: true,
      summary: result,
      message: 'Automated 7-day expiration and follow-up reminder cycle completed',
    });
  } catch (error: any) {
    console.error('Error executing verification cron cycle:', error);
    return NextResponse.json(
      { error: 'Cron execution failed' },
      { status: 500 }
    );
  }
}
