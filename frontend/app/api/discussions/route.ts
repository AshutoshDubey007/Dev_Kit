import { NextRequest, NextResponse } from 'next/server';
import { getDiscussionsFromDb, createDiscussionInDb } from '@/lib/db/discussions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const discussions = await getDiscussionsFromDb(category, search);
    return NextResponse.json({ success: true, count: discussions.length, discussions });
  } catch (error: any) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Discussion title is required' }, { status: 400 });
    }

    const newDiscussion = await createDiscussionInDb({
      title: body.title,
      author: body.author || 'Anonymous Developer',
      category: body.category || 'q_and_a',
    });

    return NextResponse.json({ success: true, discussion: newDiscussion });
  } catch (error: any) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
