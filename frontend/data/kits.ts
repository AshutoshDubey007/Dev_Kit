import { Kit } from '../types/kit';

export const KITS: Kit[] = [
  {
    id: 'kit-razorpay-pro',
    slug: 'nextjs-razorpay-pro',
    title: 'Next.js 15 Razorpay Pro Kit',
    tagline: 'Drop-in payments with webhook idempotency, subscriptions, and Prisma database sync',
    shortDescription:
      'The complete production implementation for Razorpay in Next.js 15 App Router. Includes server-side HMAC-SHA256 signature verification, replay protection, recurring subscriptions, and auto-generated invoices.',
    description: `Stop wrestling with Razorpay webhook edge cases and broken App Router body parsing. 

This production kit gives you a battle-tested foundation designed specifically for Next.js 15, React 19, and TypeScript. It solves the hardest parts of Indian payment integration:
- Webhook idempotency (prevents granting double credits or duplicate orders on retries).
- Raw-body HMAC SHA-256 signature validation compatible with Next.js Route Handlers.
- Recurring Subscriptions with plan creation, customer mandate setup, and webhook handling.
- Seamless Prisma database synchronization that transitions customer state to ACTIVE or EXPIRED automatically.`,
    category: 'payments',
    priceINR: 1499,
    priceUSD: 19,
    framework: 'Next.js 15 (App Router)',
    techStack: ['Next.js 15', 'TypeScript', 'Razorpay', 'Prisma', 'Tailwind CSS', 'shadcn/ui'],
    features: [
      'HMAC-SHA256 server-side signature verification with raw body parsing',
      'Webhook idempotency engine preventing duplicate order/credit grants',
      'Razorpay Subscriptions (recurring mandate & auto-debit support)',
      'Pre-built customer billing portal and payment receipt generator',
      '100% automated test coverage for failure modes & network retry loops',
      'Drop-in shadcn/ui checkout modal with UPI, QR, Netbanking & Cards',
    ],
    verification: {
      verifiedDate: '2026-10-08',
      nextjsVersion: '15.1.0',
      nodeVersion: 'v20.18.0+',
      testSuitePassRate: 100,
      automatedTestsCount: 18,
      cleanInstallVerified: true,
      testedWithReact: 'React 19',
      knownLimitations: [
        'International card payments require activating international business mode in your Razorpay dashboard.',
        'Localhost webhook testing requires a tunneling tool (ngrok or cloudflared).',
      ],
      auditSummary:
        'Audited on clean installation with zero peer-dependency warnings. Tested against 50 simulated webhook retries with 0 duplicate records.',
    },
    codePreviews: [
      {
        filename: 'app/api/webhooks/razorpay/route.ts',
        language: 'typescript',
        description: 'Idempotent webhook handler with cryptographic signature verification',
        code: `import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const event = JSON.parse(rawBody);

  // Idempotency check: Ignore duplicate webhook delivery
  const existingEvent = await db.paymentEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existingEvent) {
    return NextResponse.json({ status: "already_processed" });
  }

  // Record and process payment safely...
  await db.paymentEvent.create({ data: { eventId: event.id, type: event.event } });
  return NextResponse.json({ received: true });
}`,
      },
      {
        filename: 'lib/razorpay.ts',
        language: 'typescript',
        description: 'Typed Razorpay singleton with environment validation',
        code: `import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Missing Razorpay API credentials in environment variables.");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});`,
      },
    ],
    demoUrl: 'https://demo-razorpay.devkit.dev',
    rating: 4.9,
    reviewCount: 38,
    salesCount: 142,
    isFeatured: true,
    badge: 'Flagship Kit',
    lastUpdated: '2026-10-09',
    license: 'Commercial License (Unlimited Client & Personal Projects)',
    supportScope: 'Includes 6 months of GitHub updates and bug fixes for the core kit.',
  },
  {
    id: 'kit-auth-rbac',
    slug: 'nextjs-enterprise-auth-rbac',
    title: 'Enterprise Auth & RBAC Starter',
    tagline: 'Google OAuth, magic links, hierarchical RBAC, and team multi-tenancy',
    shortDescription:
      'Complete authentication and authorization foundation for B2B SaaS. Pre-configured with Google login, team switching, permission guards, and Edge middleware.',
    description: `Authentication is easy; enterprise permission hierarchies and multi-tenant workspaces are hard. 

This kit gives you a pre-built authorization engine that works at the edge with zero layout flash:
- Google OAuth + passwordless email magic link authentication.
- Hierarchical Roles: SuperAdmin, OrgOwner, Admin, Member, Viewer.
- Tenant switching with custom invite tokens and role revocation.
- React Server Component (RSC) and Server Action permission guards.`,
    category: 'auth',
    priceINR: 1299,
    priceUSD: 16,
    framework: 'Next.js 15 (App Router)',
    techStack: ['Next.js 15', 'TypeScript', 'Auth.js', 'Prisma', 'Tailwind CSS', 'shadcn/ui'],
    features: [
      'Edge-ready Next.js middleware with zero layout flash',
      'Hierarchical Role-Based Access Control (RBAC) with typed permissions',
      'Team & Organization multi-tenancy with workspace switcher',
      'Google OAuth + Magic Links via Resend email provider',
      'Audit log recorder for sensitive administrative actions',
    ],
    verification: {
      verifiedDate: '2026-10-05',
      nextjsVersion: '15.1.0',
      nodeVersion: 'v20.18.0+',
      testSuitePassRate: 100,
      automatedTestsCount: 14,
      cleanInstallVerified: true,
      testedWithReact: 'React 19',
      knownLimitations: [
        'Magic links require an active SMTP / Resend API key.',
        'Session cookies must be served over HTTPS in production.',
      ],
      auditSummary: 'Verified route protection on cold starts with 100% middleware guard pass rate.',
    },
    codePreviews: [
      {
        filename: 'lib/permissions.ts',
        language: 'typescript',
        description: 'Typed role and capability permission guard',
        code: `export const ROLES = {
  OWNER: ["read", "write", "delete", "manage_billing", "invite_users"],
  ADMIN: ["read", "write", "invite_users"],
  MEMBER: ["read", "write"],
  VIEWER: ["read"],
} as const;

export function hasPermission(role: keyof typeof ROLES, permission: string): boolean {
  return (ROLES[role] as readonly string[]).includes(permission);
}`,
      },
    ],
    demoUrl: 'https://demo-auth.devkit.dev',
    rating: 4.8,
    reviewCount: 22,
    salesCount: 89,
    isFeatured: true,
    badge: 'Popular',
    lastUpdated: '2026-10-06',
    license: 'Commercial License (Unlimited Projects)',
    supportScope: 'Includes 6 months of GitHub updates and bug fixes for the core kit.',
  },
  {
    id: 'kit-rag-ai-search',
    slug: 'nextjs-rag-ai-document-search',
    title: 'RAG & AI Document Search Engine',
    tagline: 'Upload PDFs, generate embeddings, and build streaming AI search with source citations',
    shortDescription:
      'A production Retrieval-Augmented Generation (RAG) system with Next.js 15 and Supabase pgvector. Handles chunking, vector indexing, streaming UI, and exact citation highlights.',
    description: `Building a real RAG application requires more than just calling OpenAI once. 

This kit provides the complete document ingestion and retrieval pipeline:
- PDF and Markdown parser with smart semantic chunking and metadata retention.
- Vector search with Supabase pgvector and hybrid keyword ranking.
- Token cost tracking and rate-limiting per user.
- Streaming chat interface with markdown rendering and inline source citation tooltips.`,
    category: 'ai',
    priceINR: 2499,
    priceUSD: 32,
    framework: 'Next.js 15 (App Router)',
    techStack: ['Next.js 15', 'TypeScript', 'Vercel AI SDK', 'Supabase pgvector', 'Tailwind CSS'],
    features: [
      'Multi-format file ingestion (PDF, DOCX, Markdown, Text)',
      'Vector similarity search with Supabase pgvector and cosine distance',
      'Streaming responses using Vercel AI SDK (useChat hook)',
      'Inline source citations with clickable document preview modals',
      'User rate-limiting and OpenAI API token usage telemetry',
    ],
    verification: {
      verifiedDate: '2026-10-02',
      nextjsVersion: '15.1.0',
      nodeVersion: 'v20.18.0+',
      testSuitePassRate: 100,
      automatedTestsCount: 12,
      cleanInstallVerified: true,
      testedWithReact: 'React 19',
      knownLimitations: [
        'Requires an OpenAI or Anthropic API key with available balance.',
        'Requires PostgreSQL with pgvector extension enabled.',
      ],
      auditSummary: 'Tested embedding batch processing with 50+ document pages with zero memory leaks.',
    },
    codePreviews: [
      {
        filename: 'app/api/chat/route.ts',
        language: 'typescript',
        description: 'Streaming RAG handler with vector context injection',
        code: `import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { findRelevantChunks } from "@/lib/vector-search";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const latestMessage = messages[messages.length - 1].content;

  const context = await findRelevantChunks(latestMessage, { limit: 5 });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: \`You are an assistant answering questions based strictly on the provided context:
\${context.map((c) => c.text).join("\\n---\\n")}\`,
    messages,
  });

  return result.toDataStreamResponse();
}`,
      },
    ],
    demoUrl: 'https://demo-rag.devkit.dev',
    rating: 4.9,
    reviewCount: 19,
    salesCount: 64,
    isFeatured: true,
    badge: 'Trending',
    lastUpdated: '2026-10-04',
    license: 'Commercial License (Unlimited Projects)',
    supportScope: 'Includes 6 months of GitHub updates and bug fixes for the core kit.',
  },
  {
    id: 'kit-docker-ci-cd',
    slug: 'nextjs-production-docker-ci-cd',
    title: 'Next.js Production Docker & CI/CD Pipeline',
    tagline: 'Multi-stage Dockerfile, GitHub Actions, standalone output, and zero-downtime deployment',
    shortDescription:
      'Shrink Next.js Docker images from 1.2GB down to 85MB. Multi-stage caching, security hardening, automated GitHub Actions testing, and deployment templates for Coolify, AWS, and DigitalOcean.',
    description: `Deploy Next.js outside of Vercel with confidence. 

Includes production-hardened multi-stage Dockerfiles leveraging Next.js standalone output, automated security vulnerability scanning, and GitHub Actions CI pipelines.`,
    category: 'devops',
    priceINR: 999,
    priceUSD: 12,
    framework: 'Next.js 15 (Standalone)',
    techStack: ['Next.js 15', 'Docker', 'GitHub Actions', 'Linux Alpine', 'Coolify / AWS'],
    features: [
      'Multi-stage Docker build reducing final image size to <90MB',
      'Next.js standalone output configuration with non-root security user',
      'GitHub Actions workflow for automated test, build, and container registry push',
      'Docker Compose setup with PostgreSQL and Redis containers',
    ],
    verification: {
      verifiedDate: '2026-09-28',
      nextjsVersion: '15.1.0',
      nodeVersion: 'v20.18.0+',
      testSuitePassRate: 100,
      automatedTestsCount: 8,
      cleanInstallVerified: true,
      testedWithReact: 'React 19',
      knownLimitations: [
        'Requires Docker Engine installed locally or in your CI runner.',
      ],
      auditSummary: 'Docker scan reported 0 critical or high CVE vulnerabilities.',
    },
    codePreviews: [
      {
        filename: 'Dockerfile',
        language: 'dockerfile',
        description: 'Hardened multi-stage Docker build for Next.js standalone',
        code: `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
      },
    ],
    demoUrl: 'https://demo-docker.devkit.dev',
    rating: 4.7,
    reviewCount: 15,
    salesCount: 51,
    isFeatured: false,
    badge: 'Utility',
    lastUpdated: '2026-09-30',
    license: 'Commercial License (Unlimited Projects)',
    supportScope: 'Includes 6 months of GitHub updates and bug fixes for the core kit.',
  },
];
