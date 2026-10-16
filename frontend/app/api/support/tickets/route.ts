import { NextRequest, NextResponse } from 'next/server';
import {
  getUserTickets,
  createSupportTicket,
  getTicketsForVerification,
} from '../../../../lib/db/tickets';
import { recordAnalyticsEvent } from '@/lib/db/analytics';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verificationId = searchParams.get('verificationId');
    const role = (searchParams.get('role') as any) || undefined;
    let userEmail = searchParams.get('email');

    if (verificationId) {
      const tickets = await getTicketsForVerification(verificationId);
      return NextResponse.json({ success: true, tickets });
    }

    if (!userEmail) {
      const session = await auth();
      if (session?.user?.email) {
        userEmail = session.user.email;
      }
    }

    if (!userEmail) {
      return NextResponse.json({ success: true, tickets: [] });
    }

    const tickets = await getUserTickets(userEmail, role);
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      verificationId,
      buyerEmail,
      title,
      description,
      errorMessage,
      expectedBehavior,
      actualBehavior,
      reproductionSteps,
      environment,
      attachments,
    } = body;

    let actorEmail = buyerEmail;
    let actorRole = 'buyer';

    if (!actorEmail) {
      const session = await auth();
      if (session?.user?.email) {
        actorEmail = session.user.email;
        actorRole = (session.user as any)?.role || 'buyer';
      }
    }

    if (!actorEmail) {
      return NextResponse.json(
        { error: 'Authentication required to submit support ticket' },
        { status: 401 }
      );
    }

    const result = await createSupportTicket({
      verificationId,
      buyerIdOrEmail: actorEmail,
      buyerRole: actorRole,
      title,
      description,
      errorMessage,
      expectedBehavior,
      actualBehavior,
      reproductionSteps,
      environment,
      attachments,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Record issue reported analytics event
    recordAnalyticsEvent('issue_reported', {
      entityId: result.ticket?.verificationId,
      path: '/api/support/tickets',
      metadata: { ticketId: result.ticket?.ticketId },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Support ticket successfully submitted. Seller notified and chat thread linked.',
      ticket: result.ticket,
    });
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit support ticket' },
      { status: 500 }
    );
  }
}
