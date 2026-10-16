import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations } from '@backend/chat/service';
import { getAllConversationsForOperator } from '@backend/chat/operator';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase().trim();
    const sessionRole = (session?.user as any)?.role;

    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email')?.toLowerCase().trim();
    const isAll = searchParams.get('all') === 'true';

    // 1. Operator / Admin query for all conversations
    if (isAll) {
      if (sessionRole !== 'operator' && sessionRole !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Operator privileges required to access platform conversations' },
          { status: 403 }
        );
      }
      const allConvs = await getAllConversationsForOperator();
      return NextResponse.json({ success: true, conversations: allConvs });
    }

    // 2. Identify target user email with object-level authorization
    let targetEmail = sessionEmail;

    if (queryEmail) {
      // If querying another email, user must be operator or admin in production
      if (queryEmail !== sessionEmail && sessionRole !== 'operator' && sessionRole !== 'admin') {
        if (process.env.NODE_ENV === 'production' && sessionEmail) {
          return NextResponse.json(
            { error: 'Forbidden: Cannot access conversations of another user' },
            { status: 403 }
          );
        }
      }
      targetEmail = queryEmail;
    }

    if (!targetEmail) {
      return NextResponse.json({ success: true, conversations: [] });
    }

    const conversations = await getUserConversations(targetEmail);
    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error('Error fetching user conversations:', error);
    return NextResponse.json(
      { error: 'Error fetching conversations' },
      { status: 500 }
    );
  }
}
