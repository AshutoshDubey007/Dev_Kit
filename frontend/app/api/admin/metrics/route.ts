import { NextRequest, NextResponse } from 'next/server';
import { getAdminPlatformMetrics } from '@/lib/db/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getAdminPlatformMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    console.error('Error fetching admin platform metrics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch platform metrics' },
      { status: 500 }
    );
  }
}
