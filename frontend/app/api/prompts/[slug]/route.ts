import { NextRequest, NextResponse } from 'next/server';
import { getPromptBySlug } from '@/lib/db/prompts';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('email') || undefined;

    const prompt = await getPromptBySlug(slug, userEmail);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt blueprint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, prompt });
  } catch (error) {
    console.error('Error fetching prompt blueprint:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}
