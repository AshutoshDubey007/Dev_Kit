import { NextRequest, NextResponse } from 'next/server';
import {
  getTicketById,
  proposeTicketResolution,
  confirmTicketResolution,
  reopenTicket,
  updateTicketStatus,
} from '../../../../../lib/db/tickets';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const body = await req.json();
    const { action, actorId, actorRole, notes, reason, newStatus } = body;

    let resolvedActorId = actorId;
    let resolvedRole = actorRole || 'buyer';

    if (!resolvedActorId) {
      const session = await auth();
      if (session?.user?.email) {
        resolvedActorId = session.user.email;
        resolvedRole = (session.user as any)?.role || 'buyer';
      }
    }

    if (!resolvedActorId) {
      return NextResponse.json(
        { error: 'Authentication required to update ticket' },
        { status: 401 }
      );
    }

    if (action === 'propose_resolution') {
      if (!notes || notes.trim().length < 5) {
        return NextResponse.json(
          { error: 'Resolution details must be at least 5 characters long' },
          { status: 400 }
        );
      }
      const result = await proposeTicketResolution(
        ticketId,
        resolvedActorId,
        notes,
        resolvedRole
      );
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, ticket: result.ticket });
    }

    if (action === 'confirm_resolution') {
      const result = await confirmTicketResolution(
        ticketId,
        resolvedActorId,
        resolvedRole
      );
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, ticket: result.ticket });
    }

    if (action === 'reopen') {
      const result = await reopenTicket(
        ticketId,
        resolvedActorId,
        reason || 'Buyer requested ticket reopen',
        resolvedRole
      );
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, ticket: result.ticket });
    }

    if (action === 'update_status') {
      if (!newStatus) {
        return NextResponse.json({ error: 'Missing newStatus parameter' }, { status: 400 });
      }
      const updated = await updateTicketStatus(
        ticketId,
        newStatus,
        resolvedActorId,
        resolvedRole,
        notes
      );
      return NextResponse.json({ success: true, ticket: updated });
    }

    return NextResponse.json({ error: 'Unsupported ticket action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
