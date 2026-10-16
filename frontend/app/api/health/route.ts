import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const isShallow = url.searchParams.get('shallow') === 'true';
  const uptimeSeconds = Math.floor(process.uptime());
  const timestamp = new Date().toISOString();

  // Fast shallow liveness probe for load balancers / orchestrators
  if (isShallow) {
    return NextResponse.json(
      {
        status: 'ok',
        type: 'liveness',
        uptimeSeconds,
        timestamp,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  }

  // Deep readiness probe
  const mem = process.memoryUsage();
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;
  let overallHealthy = true;

  try {
    const dbStart = Date.now();
    const db = await getDatabase();
    await db.command({ ping: 1 });
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch (err: any) {
    console.error('[Health] MongoDB ping failed:', err.message);
    dbStatus = 'error';
    overallHealthy = false;
  }

  const envConfig = {
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    hasRazorpayKey: Boolean(process.env.RAZORPAY_KEY_ID),
    hasRazorpaySecret: Boolean(process.env.RAZORPAY_KEY_SECRET),
    hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET),
    isProduction: process.env.NODE_ENV === 'production',
  };

  const payload = {
    status: overallHealthy ? 'healthy' : 'degraded',
    service: 'devkit-marketplace',
    environment: process.env.NODE_ENV || 'production',
    timestamp,
    uptimeSeconds,
    version: '1.0.0',
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      },
      configuration: envConfig,
    },
  };

  return NextResponse.json(payload, {
    status: overallHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
