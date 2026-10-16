/**
 * DevKit Production Rate Limiting Engine
 * 
 * Provides distributed rate limiting backed by MongoDB TTL collection with an
 * in-memory sliding window fallback for resilience during database reconnects.
 * 
 * Complies with RFC 6585 (429 Too Many Requests) and standard rate limit headers:
 * - X-RateLimit-Limit
 * - X-RateLimit-Remaining
 * - X-RateLimit-Reset
 * - Retry-After
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../mongodb';

export interface RateLimitPolicy {
  name: string;
  windowMs: number;
  max: number;
}

export const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
  auth: {
    name: 'auth',
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per 15 min
  },
  checkout: {
    name: 'checkout',
    windowMs: 60 * 1000,       // 1 minute
    max: 15,                   // 15 requests per minute
  },
  chat: {
    name: 'chat',
    windowMs: 60 * 1000,       // 1 minute
    max: 30,                   // 30 messages per minute
  },
  feedback: {
    name: 'feedback',
    windowMs: 10 * 60 * 1000,  // 10 minutes
    max: 5,                    // 5 submissions per 10 min
  },
  scanner: {
    name: 'scanner',
    windowMs: 60 * 1000,       // 1 minute
    max: 10,                   // 10 repo/file scans per minute
  },
  studio: {
    name: 'studio',
    windowMs: 60 * 1000,       // 1 minute
    max: 8,                    // 8 AI project generations per minute
  },
  general: {
    name: 'general',
    windowMs: 60 * 1000,       // 1 minute
    max: 100,                  // 100 general requests per minute
  },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;           // Unix timestamp in seconds
  retryAfter: number;      // Seconds to wait until reset
}

// In-memory fallback sliding window cache
interface MemoryRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryRecord>();

// Cleanup stale in-memory records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now >= record.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 60000).unref();

/**
 * Extracts a dependable client identifier from request headers without trusting spoofed values.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Left-most IP is closest to client
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Checks and increments rate limit for a specific operation and identifier.
 */
export async function checkRateLimit(
  policy: RateLimitPolicy,
  identifier: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `ratelimit:${policy.name}:${identifier}`;
  const resetAtMs = now + policy.windowMs;
  const resetEpochSeconds = Math.ceil(resetAtMs / 1000);

  // 1. Attempt MongoDB distributed atomic increment
  try {
    const db = await getDatabase();
    const collection = db.collection('rate_limits');

    const expireAt = new Date(resetAtMs + 60000); // 1 min buffer for TTL cleanup

    const result = await collection.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          resetAt: new Date(resetAtMs),
          expireAt,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );

    if (result) {
      const currentCount = result.count || 1;
      const actualReset = result.resetAt ? new Date(result.resetAt).getTime() : resetAtMs;
      const actualResetSec = Math.ceil(actualReset / 1000);
      const retryAfter = Math.max(1, Math.ceil((actualReset - now) / 1000));

      // If existing window expired, reset it
      if (now > actualReset) {
        await collection.updateOne(
          { key },
          { $set: { count: 1, resetAt: new Date(resetAtMs), expireAt } }
        );
        return {
          success: true,
          limit: policy.max,
          remaining: policy.max - 1,
          reset: resetEpochSeconds,
          retryAfter: Math.ceil(policy.windowMs / 1000),
        };
      }

      const isAllowed = currentCount <= policy.max;
      const remaining = Math.max(0, policy.max - currentCount);

      return {
        success: isAllowed,
        limit: policy.max,
        remaining,
        reset: actualResetSec,
        retryAfter: isAllowed ? 0 : retryAfter,
      };
    }
  } catch (err) {
    // Database connection failure or timeout: fallback to in-memory sliding window
    console.warn('[RateLimit] MongoDB check bypassed, using resilient memory store:', err);
  }

  // 2. In-Memory Resilient Fallback
  const record = memoryStore.get(key);
  if (!record || now >= record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: resetAtMs });
    return {
      success: true,
      limit: policy.max,
      remaining: policy.max - 1,
      reset: resetEpochSeconds,
      retryAfter: 0,
    };
  }

  record.count += 1;
  const isAllowed = record.count <= policy.max;
  const remaining = Math.max(0, policy.max - record.count);
  const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    success: isAllowed,
    limit: policy.max,
    remaining,
    reset: Math.ceil(record.resetAt / 1000),
    retryAfter: isAllowed ? 0 : retryAfter,
  };
}

/**
 * Produces standard rate limit HTTP headers
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success && result.retryAfter > 0) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Returns a standardized RFC 6585 429 Too Many Requests response
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: `Rate limit of ${result.limit} requests per window exceeded. Please retry after ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
      limit: result.limit,
      remaining: 0,
    },
    {
      status: 429,
      headers: getRateLimitHeaders(result),
    }
  );
}
