import { NextRequest, NextResponse } from 'next/server';
import { getAdminPlatformMetrics } from '@/lib/db/admin';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator privileges required' },
        { status: 403 }
      );
    }

    const metrics = await getAdminPlatformMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    console.error('Error fetching admin platform metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform metrics' },
      { status: 500 }
    );
  }
}
