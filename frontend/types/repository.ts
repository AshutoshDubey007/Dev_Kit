export interface Repository {
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
  createdAt: string | Date;
  updatedAt: string | Date;
}
