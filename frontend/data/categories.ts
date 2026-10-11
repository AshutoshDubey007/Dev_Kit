import { Category } from '../types/kit';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-payments',
    name: 'Payments & Billing',
    slug: 'payments',
    description: 'Razorpay, Stripe, subscription billing, webhook reconciliation, and invoice generation.',
    icon: 'CreditCard',
    count: 3,
  },
  {
    id: 'cat-auth',
    name: 'Auth & Permissions',
    slug: 'auth',
    description: 'OAuth providers, role-based access control (RBAC), multi-tenancy, and session management.',
    icon: 'ShieldCheck',
    count: 2,
  },
  {
    id: 'cat-ai',
    name: 'AI & Vector Search',
    slug: 'ai',
    description: 'RAG pipelines, document chat, streaming completions, and OpenAI / Anthropic integrations.',
    icon: 'Sparkles',
    count: 2,
  },
  {
    id: 'cat-devops',
    name: 'DevOps & Deployment',
    slug: 'devops',
    description: 'Docker multi-stage builds, CI/CD GitHub Actions, Cloudflare Pages, and AWS ECS templates.',
    icon: 'Server',
    count: 1,
  },
  {
    id: 'cat-database',
    name: 'Database & ORM',
    slug: 'database',
    description: 'Prisma, Drizzle, Supabase migrations, seeders, and multi-tenant database schemas.',
    icon: 'Database',
    count: 1,
  },
];
