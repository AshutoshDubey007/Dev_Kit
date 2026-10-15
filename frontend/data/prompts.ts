import { PromptItem } from '../types/prompt';

export const SEED_PROMPTS: PromptItem[] = [
  {
    id: 'prompt-nextjs-saas-architect',
    slug: 'nextjs-15-complete-saas-architect',
    title: 'Next.js 15 Complete SaaS Production Architect',
    description: 'Generates an end-to-end multi-tenant SaaS application with Supabase/Prisma, Stripe/Razorpay billing, and shadcn/ui dark mode.',
    problemSolves: 'Eliminates 3 weeks of boilerplate by generating complete directory structures, Route Handlers, schema definitions, and billing portals.',
    category: 'saas',
    authorUsername: 'devkit-core',
    authorName: 'DevKit AI Lab',
    authorAvatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    supportedModels: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'DeepSeek-V3'],
    supportedFrameworks: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Prisma', 'Razorpay'],
    requiredVariables: [
      { name: 'project_name', label: 'Project Name', placeholder: 'DocuFlow SaaS', required: true },
      { name: 'target_audience', label: 'Target Audience', placeholder: 'B2B Developers', required: true },
      { name: 'core_features', label: 'Core Features', placeholder: 'PDF indexing, AI OCR, Team workspaces', required: true },
      { name: 'pricing_tiers', label: 'Pricing Tiers', placeholder: 'Free, Pro (₹999/mo), Enterprise', required: true },
    ],
    templateContent: `You are an elite Next.js 15 systems architect.
Construct a complete, production-grade application for {{project_name}} targeting {{target_audience}}.
Core Feature Specification:
{{core_features}}
Pricing Model:
{{pricing_tiers}}

Generate complete runnable files with zero placeholders:
1. Directory layout following Next.js 15 App Router.
2. Database schema with Prisma.
3. Webhook signature validation.
4. Clean UI with dark-mode first Tailwind CSS.`,
    sampleInput: {
      project_name: 'LeadPulse CRM',
      target_audience: 'Remote Agency Owners',
      core_features: 'Pipeline Kanban, Email Sequences, Webhook Integrations',
      pricing_tiers: 'Starter (₹1,499), Agency (₹4,999)',
    },
    sampleOutput: 'Generates 12 modular files including schema.prisma, app/api/billing/route.ts, and dashboard components.',
    priceINR: 799,
    priceUSD: 10,
    isPaid: true,
    rating: 4.9,
    reviewCount: 38,
    salesCount: 147,
    version: '2.1.0',
    license: 'Commercial Developer License',
    createdAt: new Date('2026-09-10'),
    updatedAt: new Date('2026-10-12'),
  },
  {
    id: 'prompt-rag-knowledge-base',
    slug: 'ai-rag-vector-chat-generator',
    title: 'Enterprise Document RAG & Vector Chat Generator',
    description: 'Generates a private vector search chatbot pipeline supporting PDF/Markdown ingestion, LangChain chunking, and streaming responses.',
    problemSolves: 'Provides ready-to-deploy ingestion scripts and streaming chat components without hallucination traps.',
    category: 'ai',
    authorUsername: 'ai-lab',
    authorName: 'AI Engineering Lab',
    authorAvatar: 'https://avatars.githubusercontent.com/u/1024025?s=200&v=4',
    supportedModels: ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro'],
    supportedFrameworks: ['Next.js 15', 'LangChain', 'Pinecone', 'OpenAI'],
    requiredVariables: [
      { name: 'document_type', label: 'Document Type', placeholder: 'Technical API Documentation', required: true },
      { name: 'vector_db', label: 'Vector Database', placeholder: 'Pinecone / Qdrant', required: true },
      { name: 'chunk_size', label: 'Chunk Size (tokens)', placeholder: '500', defaultValue: '500', required: false },
    ],
    templateContent: `Construct an end-to-end RAG architecture in Next.js 15 for indexing {{document_type}} into {{vector_db}} using chunk size {{chunk_size}}.
Provide the ingestion route handler, vector cosine similarity queries, and the streaming UI chat component.`,
    sampleInput: {
      document_type: 'Healthcare Clinical Trials',
      vector_db: 'Pinecone',
      chunk_size: '600',
    },
    sampleOutput: 'Complete route handler app/api/rag/query/route.ts and component ChatStream.tsx.',
    priceINR: 0,
    priceUSD: 0,
    isPaid: false,
    rating: 5.0,
    reviewCount: 52,
    salesCount: 310,
    version: '1.4.0',
    license: 'MIT',
    createdAt: new Date('2026-09-18'),
    updatedAt: new Date('2026-10-14'),
  },
  {
    id: 'prompt-razorpay-fastapi-backend',
    slug: 'razorpay-fastapi-webhook-microservice',
    title: 'Razorpay FastAPI Webhook Microservice',
    description: 'Generates a high-throughput Python FastAPI microservice with cryptographic webhook validation and async database connection pool.',
    problemSolves: 'Solves payment gateway retry deadlocks and microsecond idempotency in Python services.',
    category: 'payments',
    authorUsername: 'devkit-core',
    authorName: 'DevKit Verified Team',
    authorAvatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    supportedModels: ['Claude 3.5 Sonnet', 'GPT-4o', 'DeepSeek-Coder'],
    supportedFrameworks: ['FastAPI', 'Python 3.12', 'PostgreSQL', 'SQLAlchemy'],
    requiredVariables: [
      { name: 'service_name', label: 'Microservice Name', placeholder: 'billing_engine', required: true },
      { name: 'database', label: 'Database Engine', placeholder: 'PostgreSQL asyncpg', required: true },
    ],
    templateContent: `Generate a production-ready Python FastAPI microservice named {{service_name}} with {{database}} connection pool.
Implement Razorpay HMAC signature verification with replay defense and idempotent transaction commits.`,
    sampleInput: {
      service_name: 'payment_router',
      database: 'PostgreSQL asyncpg',
    },
    sampleOutput: 'Complete main.py, config.py, and webhook router with pytest suites.',
    priceINR: 499,
    priceUSD: 6,
    isPaid: true,
    rating: 4.8,
    reviewCount: 19,
    salesCount: 88,
    version: '1.0.0',
    license: 'Commercial Developer License',
    createdAt: new Date('2026-09-25'),
    updatedAt: new Date('2026-10-11'),
  },
];
