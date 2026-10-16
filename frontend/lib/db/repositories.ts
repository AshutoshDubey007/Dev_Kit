import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';
import { escapeRegex } from '../utils/regex';

export interface Repository {
  _id?: ObjectId;
  id: string;
  name: string;
  slug: string;
  ownerUsername: string;
  ownerName: string;
  ownerAvatar?: string;
  description: string;
  visibility: 'public' | 'private';
  isFork?: boolean;
  forkSource?: string;
  defaultBranch: string;
  topics: string[];
  primaryLanguage: string;
  languages: Record<string, number>;
  starsCount: number;
  forksCount: number;
  watchersCount: number;
  issuesCount: number;
  pullRequestsCount: number;
  isImported: boolean;
  githubUrl?: string;
  associatedKitSlug?: string;
  readme: string;
  license: string;
  createdAt: Date;
  updatedAt: Date;
}

const REPOS_COLLECTION = 'repositories';

// Built-in verified repositories available immediately
export const SEED_REPOSITORIES: Repository[] = [
  {
    id: 'repo-devkit-core-payments',
    name: 'nextjs-razorpay-pro',
    slug: 'nextjs-razorpay-pro',
    ownerUsername: 'devkit-core',
    ownerName: 'DevKit Verified Team',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    description: 'Production-ready Next.js 15 App Router Razorpay integration with idempotent webhooks and Prisma sync.',
    visibility: 'public',
    defaultBranch: 'main',
    topics: ['nextjs15', 'razorpay', 'payments', 'webhooks', 'prisma', 'typescript'],
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 84.5, CSS: 12.2, Other: 3.3 },
    starsCount: 142,
    forksCount: 28,
    watchersCount: 19,
    issuesCount: 2,
    pullRequestsCount: 1,
    isImported: false,
    associatedKitSlug: 'nextjs-razorpay-pro',
    license: 'MIT',
    readme: `# Next.js 15 Razorpay Pro Kit

Drop-in payment architecture with server-side HMAC-SHA256 signature verification, webhook idempotency, and Prisma synchronization.

## Features
- **App Router Native**: Compatible with React 19 Server Components.
- **Webhook Idempotency**: Prevents duplicate credit grants across network retries.
- **Ready for Production**: Passes clean audit on Node 20+.`,
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-10-14'),
  },
  {
    id: 'repo-devkit-rbac-engine',
    name: 'nextjs-rbac-auth-engine',
    slug: 'nextjs-rbac-auth-engine',
    ownerUsername: 'devkit-core',
    ownerName: 'DevKit Verified Team',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    description: 'Hierarchical role-based access control with session management, OAuth 2.0, and route middleware protection.',
    visibility: 'public',
    defaultBranch: 'main',
    topics: ['auth', 'rbac', 'nextjs', 'oauth', 'security'],
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 91.0, Shell: 6.0, Other: 3.0 },
    starsCount: 98,
    forksCount: 14,
    watchersCount: 12,
    issuesCount: 0,
    pullRequestsCount: 0,
    isImported: false,
    associatedKitSlug: 'nextjs-rbac-auth',
    license: 'MIT',
    readme: `# Next.js 15 Role-Based Access Control Engine

Enterprise-ready permissions with server-side claims evaluation and zero client tampering risk.`,
    createdAt: new Date('2026-09-20'),
    updatedAt: new Date('2026-10-12'),
  },
  {
    id: 'repo-devkit-rag-pipeline',
    name: 'ai-rag-vector-pipeline',
    slug: 'ai-rag-vector-pipeline',
    ownerUsername: 'ai-lab',
    ownerName: 'AI Engineering Lab',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/1024025?s=200&v=4',
    description: 'Retrieval-Augmented Generation pipeline using LangChain, OpenAI embeddings, and Pinecone vector indexing in Next.js 15.',
    visibility: 'public',
    defaultBranch: 'main',
    topics: ['ai', 'rag', 'langchain', 'vector-database', 'pinecone'],
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 88.0, Python: 10.0, Other: 2.0 },
    starsCount: 230,
    forksCount: 45,
    watchersCount: 31,
    issuesCount: 4,
    pullRequestsCount: 2,
    isImported: false,
    associatedKitSlug: 'ai-rag-vector-pipeline',
    license: 'Apache-2.0',
    readme: `# AI RAG Vector Pipeline

Connect enterprise knowledge repositories to LLMs with streaming responses and hybrid search.`,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-10-10'),
  },
];

/**
 * Get all repositories (combines database records with seed repositories)
 */
export async function getAllRepositories(query?: {
  ownerUsername?: string;
  topic?: string;
  search?: string;
  language?: string;
}): Promise<Repository[]> {
  try {
    const db = await getDatabase();
    const filter: any = {};

    if (query?.ownerUsername) {
      filter.ownerUsername = query.ownerUsername.toLowerCase();
    }
    if (query?.topic) {
      filter.topics = query.topic.toLowerCase();
    }
    if (query?.language && query.language !== 'all') {
      filter.primaryLanguage = new RegExp(`^${escapeRegex(query.language.trim())}$`, 'i');
    }
    if (query?.search) {
      const searchRegex = new RegExp(escapeRegex(query.search.trim()), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }, { topics: searchRegex }];
    }

    const dbRepos = await db.collection<Repository>(REPOS_COLLECTION).find(filter).sort({ starsCount: -1 }).toArray();

    // Merge with seed repos for any not yet saved in database
    const dbIds = new Set(dbRepos.map((r) => r.id));
    const matchingSeeds = SEED_REPOSITORIES.filter((seed) => {
      if (dbIds.has(seed.id)) return false;
      if (query?.ownerUsername && seed.ownerUsername.toLowerCase() !== query.ownerUsername.toLowerCase()) return false;
      if (query?.topic && !seed.topics.includes(query.topic.toLowerCase())) return false;
      if (query?.language && query.language !== 'all' && seed.primaryLanguage.toLowerCase() !== query.language.toLowerCase()) return false;
      if (query?.search) {
        const term = query.search.toLowerCase();
        const matches =
          seed.name.toLowerCase().includes(term) ||
          seed.description.toLowerCase().includes(term) ||
          seed.topics.some((t) => t.toLowerCase().includes(term));
        if (!matches) return false;
      }
      return true;
    });

    return [...dbRepos, ...matchingSeeds];
  } catch (err) {
    console.error('Error fetching repositories from DB, falling back to seed:', err);
    return SEED_REPOSITORIES;
  }
}

/**
 * Get a repository by owner and repo slug
 */
export async function getRepositoryBySlug(
  ownerUsername: string,
  slug: string
): Promise<Repository | null> {
  try {
    const db = await getDatabase();
    const repo = await db.collection<Repository>(REPOS_COLLECTION).findOne({
      ownerUsername: ownerUsername.toLowerCase(),
      slug: slug.toLowerCase(),
    });
    if (repo) return repo;
  } catch (err) {
    console.error('Error looking up repository in DB:', err);
  }

  // Fallback to seeds
  return (
    SEED_REPOSITORIES.find(
      (r) =>
        r.ownerUsername.toLowerCase() === ownerUsername.toLowerCase() &&
        r.slug.toLowerCase() === slug.toLowerCase()
    ) || null
  );
}

/**
 * Create a new repository in MongoDB
 */
export async function createRepositoryRecord(data: {
  name: string;
  ownerUsername: string;
  ownerName: string;
  ownerAvatar?: string;
  description: string;
  visibility: 'public' | 'private';
  topics: string[];
  primaryLanguage?: string;
  defaultBranch?: string;
  isImported?: boolean;
  githubUrl?: string;
  associatedKitSlug?: string;
  readme?: string;
  license?: string;
}): Promise<Repository> {
  const db = await getDatabase();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const now = new Date();

  const newRepo: Repository = {
    id: `repo_${data.ownerUsername}_${slug}_${Date.now()}`,
    name: data.name,
    slug,
    ownerUsername: data.ownerUsername.toLowerCase(),
    ownerName: data.ownerName,
    ownerAvatar: data.ownerAvatar,
    description: data.description,
    visibility: data.visibility,
    defaultBranch: data.defaultBranch || 'main',
    topics: data.topics.map((t) => t.toLowerCase().trim()),
    primaryLanguage: data.primaryLanguage || 'TypeScript',
    languages: { [data.primaryLanguage || 'TypeScript']: 100 },
    starsCount: 0,
    forksCount: 0,
    watchersCount: 1,
    issuesCount: 0,
    pullRequestsCount: 0,
    isImported: !!data.isImported,
    githubUrl: data.githubUrl,
    associatedKitSlug: data.associatedKitSlug,
    readme: data.readme || `# ${data.name}\n\n${data.description}`,
    license: data.license || 'MIT',
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<Repository>(REPOS_COLLECTION).insertOne(newRepo);
  return newRepo;
}

/**
 * Star or unstar a repository
 */
export async function toggleRepositoryStar(
  repoId: string,
  userId: string
): Promise<{ starred: boolean; starsCount: number }> {
  const db = await getDatabase();
  const starsCollection = 'repository_stars';

  const existing = await db.collection(starsCollection).findOne({ repoId, userId });
  if (existing) {
    await db.collection(starsCollection).deleteOne({ repoId, userId });
    await db.collection(REPOS_COLLECTION).updateOne({ id: repoId }, { $inc: { starsCount: -1 } });
    const repo = await db.collection<Repository>(REPOS_COLLECTION).findOne({ id: repoId });
    return { starred: false, starsCount: repo?.starsCount || 0 };
  } else {
    await db.collection(starsCollection).insertOne({ repoId, userId, createdAt: new Date() });
    await db.collection(REPOS_COLLECTION).updateOne({ id: repoId }, { $inc: { starsCount: 1 } });
    const repo = await db.collection<Repository>(REPOS_COLLECTION).findOne({ id: repoId });
    return { starred: true, starsCount: repo?.starsCount || 1 };
  }
}
