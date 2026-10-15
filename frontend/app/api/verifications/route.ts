import { NextRequest, NextResponse } from 'next/server';
import {
  getUserVerifications,
  getSellerVerifications,
  getVerificationByOrderId,
  confirmProductWorks,
  getVerificationById,
} from '../../../lib/db/verifications';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const verificationId = searchParams.get('verificationId');
    const buyerEmail = searchParams.get('buyerEmail');
    const sellerEmail = searchParams.get('sellerEmail');

    // 1. Single order lookup
    if (orderId) {
      const verif = await getVerificationByOrderId(orderId);
      return NextResponse.json({ success: true, verification: verif });
    }

    if (verificationId) {
      const verif = await getVerificationById(verificationId);
      return NextResponse.json({ success: true, verification: verif });
    }

    // 2. Identify target user
    let userEmail = buyerEmail || sellerEmail;
    if (!userEmail) {
      const session = await auth();
      if (session?.user?.email) {
        userEmail = session.user.email;
      }
    }

    if (!userEmail) {
      return NextResponse.json({ success: true, verifications: [] });
    }

    if (sellerEmail) {
      const verifications = await getSellerVerifications(sellerEmail);
      return NextResponse.json({ success: true, verifications });
    }

    const verifications = await getUserVerifications(userEmail);
    return NextResponse.json({ success: true, verifications });
  } catch (error: any) {
    console.error('Error fetching product verifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, verificationId, buyerId, actorRole } = body;

    if (!verificationId) {
      return NextResponse.json({ error: 'Missing verificationId' }, { status: 400 });
    }

    if (action === 'confirm_works') {
      let resolvedBuyerId = buyerId;
      if (!resolvedBuyerId) {
        const session = await auth();
        if (session?.user?.email) {
          resolvedBuyerId = session.user.email;
        }
      }

      if (!resolvedBuyerId) {
        return NextResponse.json(
          { error: 'Authentication required to verify product' },
          { status: 401 }
        );
      }

      const result = await confirmProductWorks(
        verificationId,
        resolvedBuyerId,
        actorRole || 'buyer'
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Product confirmed as working. Verification successfully completed.',
        verification: result.verification,
      });
    }

    return NextResponse.json({ error: 'Unsupported verification action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing verification action:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
