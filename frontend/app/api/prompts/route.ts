import { NextRequest, NextResponse } from 'next/server';
import { getAllPrompts, createPromptRecord } from '@/lib/db/prompts';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as any;
    const search = searchParams.get('search') || undefined;
    const author = searchParams.get('author') || undefined;

    const prompts = await getAllPrompts({
      category: category && category !== 'all' ? category : undefined,
      search,
      author,
    });

    return NextResponse.json({ success: true, prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.description || !body.templateContent) {
      return NextResponse.json(
        { error: 'Title, description, and template content are required.' },
        { status: 400 }
      );
    }

    const newPrompt = await createPromptRecord({
      title: body.title,
      description: body.description,
      problemSolves: body.problemSolves || body.description,
      category: body.category || 'saas',
      authorUsername: body.authorUsername || 'ashutoshkdubey007',
      authorName: body.authorName || 'Ashutosh Dubey',
      authorAvatar: body.authorAvatar || 'https://avatars.githubusercontent.com/u/583231?v=4',
      supportedModels: body.supportedModels || ['Claude 3.5 Sonnet', 'GPT-4o'],
      supportedFrameworks: body.supportedFrameworks || ['Next.js 15', 'TypeScript'],
      requiredVariables: body.requiredVariables || [],
      templateContent: body.templateContent,
      sampleInput: body.sampleInput || {},
      sampleOutput: body.sampleOutput || 'Synthesized production boilerplate codebase files.',
      priceINR: Number(body.priceINR) || 0,
      license: body.license || 'Commercial Developer License',
    });

    return NextResponse.json({ success: true, prompt: newPrompt });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt blueprint' }, { status: 500 });
  }
}
