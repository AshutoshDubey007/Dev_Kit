import { NextRequest, NextResponse } from 'next/server';
import { processVerificationExpirationsAndReminders } from '../../../../lib/db/tickets';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || 'devkit_cron_secret';
  const authHeader = req.headers.get('authorization');
  const url = new URL(req.url);
  const querySecret = url.searchParams.get('secret');

  // Allow in development or test if no secret configured
  if (process.env.NODE_ENV !== 'production' && !authHeader && !querySecret) {
    return true;
  }

  if (authHeader && authHeader.replace(/^Bearer\s+/i, '') === secret) {
    return true;
  }

  if (querySecret === secret) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('simulatedDate');
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
      { error: error.message || 'Cron execution failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    let targetDate = new Date();
    try {
      const body = await req.json();
      if (body?.simulatedDate) {
        targetDate = new Date(body.simulatedDate);
      }
    } catch {
      // Body may be empty
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
      { error: error.message || 'Cron execution failed' },
      { status: 500 }
    );
  }
}
