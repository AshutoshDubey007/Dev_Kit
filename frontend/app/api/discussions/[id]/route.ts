import { NextRequest, NextResponse } from 'next/server';
import {
  getDiscussionByIdFromDb,
  addReplyToDiscussionInDb,
  toggleDiscussionAnsweredInDb,
} from '@/lib/db/discussions';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const discussion = await getDiscussionByIdFromDb(id);
    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, discussion });
  } catch (error: any) {
    console.error('Error fetching discussion by ID:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discussion' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'mark_answered') {
      const isAnswered = Boolean(body.isAnswered);
      await toggleDiscussionAnsweredInDb(id, isAnswered);
      return NextResponse.json({ success: true, isAnswered });
    }

    // Default action: add a reply
    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: 'Reply content cannot be empty' }, { status: 400 });
    }

    const result = await addReplyToDiscussionInDb(id, {
      author: body.author || 'Anonymous Developer',
      authorRole: body.authorRole || 'buyer',
      content: body.content.trim(),
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      discussion: result.discussion,
    });
  } catch (error: any) {
    console.error('Error in discussion action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process discussion action' },
      { status: 500 }
    );
  }
}
