import { NextRequest, NextResponse } from 'next/server';
import { toggleRepositoryStar } from '@/lib/db/repositories';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoId, userId } = body;

    if (!repoId) {
      return NextResponse.json({ error: 'Repository ID is required.' }, { status: 400 });
    }

    const targetUser = userId || 'ashutoshkdubey007';
    const result = await toggleRepositoryStar(repoId, targetUser);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error toggling repo star:', error);
    return NextResponse.json({ error: 'Failed to star repository' }, { status: 500 });
  }
}
