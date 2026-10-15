import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations } from '@backend/chat/service';
import { getAllConversationsForOperator } from '@backend/chat/operator';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userEmail = searchParams.get('email');

    if (!userEmail) {
      const session = await auth();
      if (session?.user?.email) {
        userEmail = session.user.email;
      }
    }

    // If query specifies all or operator
    if (searchParams.get('all') === 'true') {
      const allConvs = await getAllConversationsForOperator();
      return NextResponse.json({ success: true, conversations: allConvs });
    }

    const conversations = await getUserConversations(userEmail || '');
    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error('Error fetching user conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching conversations' },
      { status: 500 }
    );
  }
}
