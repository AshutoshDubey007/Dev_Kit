import { NextRequest, NextResponse } from 'next/server';
import { getAllRepositories, createRepositoryRecord } from '@/lib/db/repositories';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || undefined;
    const search = searchParams.get('search') || undefined;
    const owner = searchParams.get('owner') || undefined;

    const repos = await getAllRepositories({
      language: language && language !== 'all' ? language : undefined,
      search,
      ownerUsername: owner,
    });

    return NextResponse.json({ success: true, repositories: repos });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Repository name is required.' }, { status: 400 });
    }

    const newRepo = await createRepositoryRecord({
      name: body.name,
      ownerUsername: body.ownerUsername || 'ashutoshkdubey007',
      ownerName: body.ownerName || 'Ashutosh Dubey',
      ownerAvatar: body.ownerAvatar,
      description: body.description || '',
      visibility: body.visibility || 'public',
      primaryLanguage: body.primaryLanguage || 'TypeScript',
      topics: body.topics || [],
      readme: body.readme || `# ${body.name}\n\nProject created on DevKit.`,
      isImported: !!body.isImported,
      githubUrl: body.githubUrl,
      associatedKitSlug: body.associatedKitSlug,
    });

    return NextResponse.json({ success: true, repository: newRepo });
  } catch (error) {
    console.error('Error creating repository:', error);
    return NextResponse.json({ error: 'Failed to create repository' }, { status: 500 });
  }
}
