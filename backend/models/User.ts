export type UserRole = 'admin' | 'operator' | 'user';

export interface SellerProfile {
  sellerId: string;
  githubUsername?: string;
  totalKitsListed: number;
  freeKitsUsed: number; // Max 3 free
  isSubscribed: boolean; // Subscription required after 3 projects
  subscriptionPlan?: 'none' | 'starter_pass_50' | 'pro_pass_100';
  subscriptionExpiresAt?: Date;
  rating: number;
}

export interface User {
  _id?: any;
  userId: string;
  email: string;
  name: string;
  role: UserRole; // 'admin' | 'operator' | 'user'
  sellerProfile?: SellerProfile;
  createdAt: Date;
  updatedAt: Date;
}
