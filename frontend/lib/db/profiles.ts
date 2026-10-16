import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';

export interface DeveloperProfile {
  _id?: ObjectId;
  username: string;
  name: string;
  email?: string;
  avatar: string;
  bio: string;
  website?: string;
  location?: string;
  githubUsername?: string;
  skills: string[];
  profileReadme: string;
  company?: string;
  payoutUpiId?: string;
  payoutAccountName?: string;
  payoutAccountNumber?: string;
  payoutIfsc?: string;
  apiKey?: string;
  notifications?: {
    emailUpdates: boolean;
    saleAlerts: boolean;
    securityAlerts: boolean;
    chatMessages: boolean;
  };
  role: 'developer' | 'seller' | 'admin' | 'operator';
  followersCount: number;
  followingCount: number;
  starsCount: number;
  contributionsCount: number;
  joinedAt: Date;
}

export interface ActivityEvent {
  id: string;
  username: string;
  type: 'star' | 'repo_created' | 'kit_published' | 'prompt_published' | 'review';
  title: string;
  description: string;
  link: string;
  date: string;
}

const PROFILES_COLLECTION = 'profiles';

// Default mock profiles for immediate rendering
export const SEED_PROFILES: Record<string, DeveloperProfile> = {
  ashutoshkdubey007: {
    username: 'ashutoshkdubey007',
    name: 'Ashutosh Dubey',
    avatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
    bio: 'Full-stack software architect & creator building production Next.js 15 platforms, payments, and AI systems.',
    website: 'https://devkit.store',
    location: 'India',
    githubUsername: 'ashutoshkdubey007',
    skills: ['Next.js 15', 'React 19', 'TypeScript', 'Node.js', 'MongoDB', 'Razorpay', 'Tailwind CSS'],
    profileReadme: `### Hi there, I'm Ashutosh 👋

Software engineer specializing in high-performance developer tools, payment gateways, and scalable cloud applications.

- 🔭 Working on: **DevKit Marketplace & AI Studio**
- 🌱 Exploring: **Agentic AI & Next.js 15 Server Actions**
- ⚡ Tech Stack: **TypeScript, React 19, MongoDB, Razorpay**`,
    role: 'developer',
    followersCount: 48,
    followingCount: 19,
    starsCount: 215,
    contributionsCount: 384,
    joinedAt: new Date('2026-01-15'),
  },
  'devkit-core': {
    username: 'devkit-core',
    name: 'DevKit Verified Core Team',
    avatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    bio: 'Official DevKit engineering collective maintaining production integration kits, audits, and security systems.',
    website: 'https://devkit.store',
    location: 'Global',
    githubUsername: 'devkit-core',
    skills: ['Architecture', 'Security Audits', 'Next.js 15', 'Webhooks', 'Payment Systems'],
    profileReadme: `### DevKit Verified Core 🛡️

Official source of certified starter kits, security tooling, and verified integrations for Next.js 15 and React 19.`,
    role: 'admin',
    followersCount: 320,
    followingCount: 5,
    starsCount: 1420,
    contributionsCount: 940,
    joinedAt: new Date('2025-06-01'),
  },
};

/**
 * Fetch developer profile by username
 */
export async function getDeveloperProfile(username: string): Promise<DeveloperProfile | null> {
  const cleanUsername = username.toLowerCase().trim();

  try {
    const db = await getDatabase();
    const profile = await db.collection<DeveloperProfile>(PROFILES_COLLECTION).findOne({
      username: cleanUsername,
    });
    if (profile) return profile;
  } catch (err) {
    console.error('Error fetching profile from DB:', err);
  }

  // Check seed profiles
  if (SEED_PROFILES[cleanUsername]) {
    return SEED_PROFILES[cleanUsername];
  }

  // Generate a fallback clean profile if user exists in auth
  return {
    username: cleanUsername,
    name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
    bio: 'Software engineer and DevKit community developer.',
    skills: ['Next.js 15', 'TypeScript', 'Tailwind CSS'],
    profileReadme: `### About ${cleanUsername}\n\nDeveloper building software on the DevKit ecosystem.`,
    role: 'developer',
    followersCount: 0,
    followingCount: 0,
    starsCount: 0,
    contributionsCount: 12,
    joinedAt: new Date('2026-08-01'),
  };
}

/**
 * Update developer profile
 */
export async function updateDeveloperProfile(
  username: string,
  updates: Partial<DeveloperProfile>
): Promise<DeveloperProfile | null> {
  const cleanUsername = username.toLowerCase().trim();
  const db = await getDatabase();

  await db.collection<DeveloperProfile>(PROFILES_COLLECTION).updateOne(
    { username: cleanUsername },
    { $set: { ...updates, updatedAt: new Date() } },
    { upsert: true }
  );

  return getDeveloperProfile(cleanUsername);
}

/**
 * Get public activity feed for a user
 */
export function getDeveloperActivity(username: string): ActivityEvent[] {
  return [
    {
      id: 'act-1',
      username,
      type: 'repo_created',
      title: 'Created repository nextjs-razorpay-pro',
      description: 'Production integration with webhook idempotency and test suites.',
      link: '/repos/devkit-core/nextjs-razorpay-pro',
      date: '2 hours ago',
    },
    {
      id: 'act-2',
      username,
      type: 'kit_published',
      title: 'Published HealthEase Medical Kit',
      description: 'HIPAA-compliant patient appointment booking starter kit.',
      link: '/kits/healthease',
      date: 'Yesterday',
    },
    {
      id: 'act-3',
      username,
      type: 'prompt_published',
      title: 'Released prompt Next.js 15 Complete SaaS Architect',
      description: 'AI blueprint generating multi-tenant SaaS architectures.',
      link: '/prompts/nextjs-15-complete-saas-architect',
      date: '3 days ago',
    },
    {
      id: 'act-4',
      username,
      type: 'star',
      title: 'Starred ai-rag-vector-pipeline',
      description: 'Vector embeddings and Pinecone pipeline.',
      link: '/repos/ai-lab/ai-rag-vector-pipeline',
      date: '1 week ago',
    },
  ];
}
