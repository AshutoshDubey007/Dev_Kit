export interface DeveloperProfile {
  username: string;
  name: string;
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
  joinedAt: string | Date;
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
