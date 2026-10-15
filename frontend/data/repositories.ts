import { Repository } from '../types/repository';

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
