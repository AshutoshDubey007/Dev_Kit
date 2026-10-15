import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryBySlug } from '@/lib/db/repositories';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const repo = await getRepositoryBySlug(name, owner);

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, repository: repo });
  } catch (error) {
    console.error('Error fetching repository details:', error);
    return NextResponse.json({ error: 'Failed to fetch repository' }, { status: 500 });
  }
}
