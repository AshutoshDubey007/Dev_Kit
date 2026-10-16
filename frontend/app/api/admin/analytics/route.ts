import { NextRequest, NextResponse } from 'next/server';
import { getBetaAnalyticsSummary } from '@/lib/db/analytics';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'admin' && role !== 'operator') {
      return NextResponse.json(
        { error: 'Forbidden: Administrator or Operator role required to view beta analytics.' },
        { status: 403 }
      );
    }

    const summary = await getBetaAnalyticsSummary();
    return NextResponse.json({ success: true, analytics: summary });
  } catch (error: any) {
    console.error('Error fetching admin analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate analytics summary' },
      { status: 500 }
    );
  }
}
