import { NextRequest, NextResponse } from 'next/server';
import { getAllKitsFromDb, createKitInDb } from '@/lib/db/kits';
import { scanProjectFileTree } from '@backend/security/scanner';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const seller = searchParams.get('seller') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!, 10) : undefined;

    const { kits, totalCount } = await getAllKitsFromDb({
      category: category !== 'all' ? category : undefined,
      search,
      sellerEmail: seller && seller.includes('@') ? seller : undefined,
      sellerId: seller && !seller.includes('@') ? seller : undefined,
      sortBy,
      limit,
      skip,
    });

    return NextResponse.json({ success: true, count: kits.length, totalCount, kits });
  } catch (error: any) {
    console.error('Error fetching kits from API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch marketplace kits' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      tagline,
      category,
      priceINR,
      sellerEmail,
      sellerId,
      sellerName,
      readmeContent,
      githubUrl,
      zipFileName,
      uploadMethod,
      filesToScan,
    } = body;

    // 1. Mandatory field validation
    if (!title || !tagline || !category || priceINR === undefined) {
      return NextResponse.json(
        { error: 'Missing required kit details: title, tagline, category, and priceINR are mandatory.' },
        { status: 400 }
      );
    }

    if (!sellerEmail) {
      return NextResponse.json(
        { error: 'Seller email is required for publication authorization.' },
        { status: 401 }
      );
    }

    // 2. Automated Security Scanner Integration
    // If files or simulated tree are uploaded, run scanner before approving
    if (Array.isArray(filesToScan) && filesToScan.length > 0) {
      const scanResult = scanProjectFileTree(filesToScan);
      if (!scanResult.isSafe) {
        return NextResponse.json(
          {
            error: 'Security scan failed: Your upload contains critical vulnerabilities or prohibited files.',
            securityScore: scanResult.score,
            violations: scanResult.violations,
          },
          { status: 422 }
        );
      }
    }

    // 3. Enforce Seller 3-Free-Listing Quota / Subscription rule
    const existingSellerKits = await getAllKitsFromDb({
      sellerEmail: sellerEmail.toLowerCase().trim(),
    });

    const FREE_TIER_LIMIT = 3;
    if (existingSellerKits.totalCount >= FREE_TIER_LIMIT && !body.isSubscribed) {
      return NextResponse.json(
        {
          error: `Free listing limit reached (${FREE_TIER_LIMIT} projects). A ₹99/mo Seller Pass is required to publish additional kits.`,
          requiresSubscription: true,
          currentListedCount: existingSellerKits.totalCount,
        },
        { status: 403 }
      );
    }

    // 4. Persist directly to MongoDB
    const persistedKit = await createKitInDb({
      id: body.id,
      slug: body.slug,
      title,
      tagline,
      category,
      priceINR: Number(priceINR),
      sellerEmail,
      sellerId,
      sellerName,
      readmeContent,
      githubUrl,
      zipFileName,
      uploadMethod,
      techStack: body.techStack,
      features: body.features,
      demoUrl: body.demoUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Kit published successfully to live marketplace catalog.',
      kit: persistedKit,
    });
  } catch (error: any) {
    console.error('Error creating marketplace kit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish kit to database' },
      { status: 500 }
    );
  }
}
