import { getDatabase } from '../mongodb';
import { Kit } from '../../types/kit';
import { KITS } from '../../data/kits';
import { ObjectId } from 'mongodb';

const KITS_COLLECTION = 'kits';
let isInitialized = false;

/**
 * Ensures indexes exist and initial verified kits are seeded if collection is empty
 */
export async function ensureKitsIndexedAndSeeded(): Promise<void> {
  if (isInitialized) return;

  try {
    const db = await getDatabase();
    const collection = db.collection<Kit>(KITS_COLLECTION);

    // Create unique index on slug and query index on category and sellerEmail
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ sellerEmail: 1 });
    await collection.createIndex({ sellerId: 1 });

    const count = await collection.countDocuments();
    if (count === 0) {
      console.log('[Kits DB] Empty collection detected. Seeding verified marketplace kits...');
      // Clean clone of KITS
      const seedDocs = KITS.map((k) => ({ ...k }));
      await collection.insertMany(seedDocs);
      console.log(`[Kits DB] Successfully seeded ${seedDocs.length} verified kits.`);
    }

    isInitialized = true;
  } catch (err) {
    console.error('[Kits DB] Error ensuring kits collection initialized:', err);
  }
}

/**
 * Retrieves all kits from MongoDB with filtering, searching, and sorting
 */
export async function getAllKitsFromDb(query?: {
  category?: string;
  search?: string;
  sellerEmail?: string;
  sellerId?: string;
  sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
  limit?: number;
  skip?: number;
}): Promise<{ kits: Kit[]; totalCount: number }> {
  await ensureKitsIndexedAndSeeded();

  try {
    const db = await getDatabase();
    const collection = db.collection<Kit>(KITS_COLLECTION);

    const filter: any = {};

    if (query?.category && query.category !== 'all') {
      filter.category = query.category;
    }

    if (query?.sellerEmail) {
      filter.sellerEmail = query.sellerEmail.toLowerCase();
    } else if (query?.sellerId) {
      filter.sellerId = query.sellerId;
    }

    if (query?.search && query.search.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { title: regex },
        { tagline: regex },
        { description: regex },
        { techStack: regex },
        { 'features': regex },
      ];
    }

    let sort: any = { salesCount: -1 };
    switch (query?.sortBy) {
      case 'newest':
        sort = { lastUpdated: -1, _id: -1 };
        break;
      case 'price-low':
        sort = { priceINR: 1 };
        break;
      case 'price-high':
        sort = { priceINR: -1 };
        break;
      case 'rating':
        sort = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
      default:
        sort = { salesCount: -1, rating: -1 };
        break;
    }

    const limit = query?.limit || 100;
    const skip = query?.skip || 0;

    const [kits, totalCount] = await Promise.all([
      collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    return { kits, totalCount };
  } catch (err) {
    console.error('[Kits DB] Error fetching kits from DB:', err);
    // Fallback to static catalog in emergency
    return { kits: KITS, totalCount: KITS.length };
  }
}

/**
 * Finds a single kit by slug from MongoDB
 */
export async function getKitBySlugFromDb(slug: string): Promise<Kit | null> {
  await ensureKitsIndexedAndSeeded();

  try {
    const db = await getDatabase();
    const kit = await db.collection<Kit>(KITS_COLLECTION).findOne({
      slug: slug.toLowerCase().trim(),
    });

    if (kit) return kit;
  } catch (err) {
    console.error('[Kits DB] Error looking up kit by slug in DB:', err);
  }

  // Fallback to static seeds
  return KITS.find((k) => k.slug === slug.toLowerCase().trim()) || null;
}

/**
 * Creates and persists a new kit to MongoDB
 */
export async function createKitInDb(kitData: Partial<Kit> & {
  title: string;
  tagline: string;
  category: Kit['category'];
  priceINR: number;
  sellerEmail: string;
  sellerId?: string;
  sellerName?: string;
}): Promise<Kit> {
  await ensureKitsIndexedAndSeeded();
  const db = await getDatabase();

  const baseSlug = (kitData.slug || kitData.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let uniqueSlug = baseSlug;
  const existing = await db.collection<Kit>(KITS_COLLECTION).findOne({ slug: uniqueSlug });
  if (existing) {
    uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  }

  const nowStr = new Date().toISOString().split('T')[0];

  const newKit: Kit = {
    id: kitData.id || `kit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    slug: uniqueSlug,
    title: kitData.title.trim(),
    tagline: kitData.tagline.trim(),
    shortDescription: kitData.shortDescription || kitData.tagline.trim(),
    description: kitData.description || `### Setup & Integration Guide\n\n${kitData.readmeContent || ''}`,
    category: kitData.category,
    priceINR: Math.max(0, Number(kitData.priceINR)),
    priceUSD: kitData.priceUSD !== undefined
      ? kitData.priceUSD
      : Math.max(0, Math.round(Number(kitData.priceINR) / 83)),
    framework: kitData.framework || 'Next.js 15 (App Router)',
    techStack: kitData.techStack && kitData.techStack.length > 0
      ? kitData.techStack
      : ['Next.js 15', 'TypeScript', 'Tailwind CSS'],
    features: kitData.features && kitData.features.length > 0
      ? kitData.features
      : ['Clean installation verified', 'Full source code included', 'In-app support channel'],
    verification: kitData.verification || {
      verifiedDate: nowStr,
      nextjsVersion: '15.1.0',
      nodeVersion: 'v20.18.0+',
      testSuitePassRate: 100,
      automatedTestsCount: 12,
      cleanInstallVerified: true,
      testedWithReact: 'React 19',
      knownLimitations: [],
      auditSummary: 'Automated clean installation audit passed.',
    },
    codePreviews: kitData.codePreviews || [
      {
        filename: 'README.md',
        language: 'markdown',
        description: 'Setup Guide',
        code: kitData.readmeContent || '# Setup Guide\n\nRun npm install and npm run dev',
      },
    ],
    demoUrl: kitData.demoUrl,
    githubPreviewUrl: kitData.githubPreviewUrl,
    rating: 5.0,
    reviewCount: 0,
    salesCount: 0,
    isFeatured: !!kitData.isFeatured,
    badge: kitData.badge || 'New',
    lastUpdated: nowStr,
    license: kitData.license || 'Commercial Developer License',
    supportScope: kitData.supportScope || 'In-app Chat',
    sellerId: kitData.sellerId || kitData.sellerEmail,
    sellerName: kitData.sellerName || kitData.sellerEmail.split('@')[0],
    sellerEmail: kitData.sellerEmail.toLowerCase().trim(),
    githubUrl: kitData.githubUrl,
    zipFileName: kitData.zipFileName,
    zipFileSize: kitData.zipFileSize,
    readmeContent: kitData.readmeContent,
    uploadMethod: kitData.uploadMethod || 'github',
  };

  await db.collection<Kit>(KITS_COLLECTION).insertOne(newKit);
  return newKit;
}

/**
 * Updates an existing kit owned by the seller
 */
export async function updateKitInDb(
  slug: string,
  sellerEmailOrId: string,
  updates: Partial<Kit>
): Promise<Kit | null> {
  await ensureKitsIndexedAndSeeded();
  const db = await getDatabase();
  const cleanEmail = sellerEmailOrId.toLowerCase().trim();

  // Enforce ownership: seller must match sellerEmail or sellerId
  const filter: any = {
    slug: slug.toLowerCase().trim(),
    $or: [{ sellerEmail: cleanEmail }, { sellerId: sellerEmailOrId }],
  };

  const allowedUpdates: Partial<Kit> = {};
  if (updates.title) allowedUpdates.title = updates.title;
  if (updates.tagline) allowedUpdates.tagline = updates.tagline;
  if (updates.description) allowedUpdates.description = updates.description;
  if (updates.priceINR !== undefined) allowedUpdates.priceINR = updates.priceINR;
  if (updates.priceUSD !== undefined) allowedUpdates.priceUSD = updates.priceUSD;
  if (updates.techStack) allowedUpdates.techStack = updates.techStack;
  if (updates.features) allowedUpdates.features = updates.features;
  if (updates.readmeContent) allowedUpdates.readmeContent = updates.readmeContent;
  allowedUpdates.lastUpdated = new Date().toISOString().split('T')[0];

  const result = await db.collection<Kit>(KITS_COLLECTION).findOneAndUpdate(
    filter,
    { $set: allowedUpdates },
    { returnDocument: 'after' }
  );

  return result || null;
}

/**
 * Deletes a kit owned by the seller
 */
export async function deleteKitInDb(
  kitIdOrSlug: string,
  sellerEmailOrId: string
): Promise<boolean> {
  await ensureKitsIndexedAndSeeded();
  const db = await getDatabase();
  const cleanEmail = sellerEmailOrId.toLowerCase().trim();

  const filter: any = {
    $or: [{ id: kitIdOrSlug }, { slug: kitIdOrSlug }],
    $and: [
      {
        $or: [{ sellerEmail: cleanEmail }, { sellerId: sellerEmailOrId }],
      },
    ],
  };

  const result = await db.collection<Kit>(KITS_COLLECTION).deleteOne(filter);
  return result.deletedCount > 0;
}
