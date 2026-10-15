import { NextRequest, NextResponse } from 'next/server';
import { scanProjectFileTree } from '@backend/security/scanner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files = body.files as { path: string; content?: string; sizeBytes?: number }[];

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Files array is required for security scan.' },
        { status: 400 }
      );
    }

    const scanResult = scanProjectFileTree(files);

    return NextResponse.json({
      success: true,
      scan: scanResult,
    });
  } catch (error) {
    console.error('Error during security scan:', error);
    return NextResponse.json({ error: 'Security scan failed' }, { status: 500 });
  }
}
