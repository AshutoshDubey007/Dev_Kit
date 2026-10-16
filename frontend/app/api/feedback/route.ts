import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import {
  checkRateLimit,
  RATE_LIMIT_POLICIES,
  createRateLimitResponse,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/security/rate-limit';
import { validateEmail, validateString } from '@/lib/security/validation';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (5 submissions / 10 min per client IP)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(RATE_LIMIT_POLICIES.feedback, clientIp);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const body = await req.json();
    const { name, email, role, rating, category, message, sourceKit } = body;

    const messageVal = validateString(message, {
      fieldName: 'Feedback message',
      minLength: 5,
      maxLength: 3000,
      required: true,
    });

    const parsedRating = Number(rating);
    if (!messageVal.valid || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: 'Valid rating (1-5) and feedback message (minimum 5 characters) are required.' },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    let cleanEmail = 'anonymous@devkit.store';
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const emailVal = validateEmail(email);
      if (emailVal.valid) {
        cleanEmail = emailVal.email;
      }
    }

    const nameVal = validateString(name, {
      fieldName: 'Name',
      minLength: 0,
      maxLength: 100,
      required: false,
    });

    const db = await getDatabase();
    const feedbackDoc = {
      feedbackId: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: nameVal.value || 'Anonymous Developer',
      email: cleanEmail,
      role: role || 'buyer',
      rating: Math.round(parsedRating),
      category: category || 'general',
      message: messageVal.value,
      sourceKit: sourceKit || undefined,
      createdAt: new Date(),
    };

    await db.collection('feedback').insertOne(feedbackDoc);

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your feedback! It directly shapes the DevKit Beta.',
        feedbackId: feedbackDoc.feedbackId,
      },
      {
        headers: getRateLimitHeaders(rateLimit),
      }
    );
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}
