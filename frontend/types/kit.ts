/**
 * Data contracts and type definitions for DevKit Marketplace
 */

export type CategorySlug = 'payments' | 'auth' | 'ai' | 'devops' | 'database';

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  icon: string;
  count: number;
}

export interface VerificationReport {
  verifiedDate: string;
  nextjsVersion: string;
  nodeVersion: string;
  testSuitePassRate: number; // e.g. 100 for 100%
  automatedTestsCount: number;
  cleanInstallVerified: boolean;
  testedWithReact: string;
  knownLimitations: string[];
  auditSummary: string;
}

export interface CodeSnippet {
  filename: string;
  language: string;
  code: string;
  description: string;
}

export interface Kit {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  description: string;
  category: CategorySlug;
  priceINR: number;
  priceUSD: number;
  framework: string; // e.g. "Next.js 15 App Router"
  techStack: string[]; // e.g. ["TypeScript", "Tailwind CSS", "Prisma", "Razorpay"]
  features: string[];
  verification: VerificationReport;
  codePreviews: CodeSnippet[];
  demoUrl?: string;
  githubPreviewUrl?: string;
  rating: number; // e.g. 4.9
  reviewCount: number;
  salesCount: number;
  isFeatured: boolean;
  badge?: string; // e.g. "Staff Pick", "Best Seller"
  lastUpdated: string;
  license: string;
  supportScope: string;
}

export type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';

export interface FilterState {
  query: string;
  category: CategorySlug | 'all';
  techStack: string[];
  maxPriceINR: number | null;
  verifiedOnly: boolean;
  sortBy: SortOption;
}

export interface SearchFacet {
  name: string;
  count: number;
  slug?: string;
}

export interface SearchAggregations {
  categories: SearchFacet[];
  techStacks: SearchFacet[];
  totalResults: number;
}
