import { NextRequest, NextResponse } from 'next/server';
import { getKitBySlugFromDb, updateKitInDb, deleteKitInDb } from '@/lib/db/kits';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const kit = await getKitBySlugFromDb(slug);

    if (!kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, kit });
  } catch (error: any) {
    console.error('Error fetching kit by slug:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch kit' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { sellerEmail, ...updates } = body;

    if (!sellerEmail) {
      return NextResponse.json(
        { error: 'Seller identification required to update kit' },
        { status: 401 }
      );
    }

    const updated = await updateKitInDb(slug, sellerEmail, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Kit not found or you do not have permission to edit this kit' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, kit: updated });
  } catch (error: any) {
    console.error('Error updating kit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update kit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const sellerEmail = searchParams.get('sellerEmail');

    if (!sellerEmail) {
      return NextResponse.json(
        { error: 'Seller identification required to delete kit' },
        { status: 401 }
      );
    }

    const deleted = await deleteKitInDb(slug, sellerEmail);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Kit not found or you do not have permission to remove this kit' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, message: 'Kit deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting kit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete kit' },
      { status: 500 }
    );
  }
}
