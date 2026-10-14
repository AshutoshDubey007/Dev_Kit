export type UserProfileRole = 'buyer' | 'seller' | 'operator' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserProfileRole;
  avatarText: string;
  avatarUrl?: string;
  provider?: 'google' | 'github' | 'credentials' | 'demo';
  sellerQuotas?: {
    totalListed: number;
    freeKitsUsed: number;
    isSubscribed: boolean;
  };
}

// Specified profiles registry: roles and permissions are bound to specific emails
export const AUTHORIZED_PROFILES: Record<string, { role: UserProfileRole; name: string }> = {
  'admin@devkit.store': { role: 'admin', name: 'Platform Administrator' },
  'moderator@devkit.store': { role: 'operator', name: 'Safety Desk Operator' },
  'operator@devkit.store': { role: 'operator', name: 'Safety Desk Operator' },
  'creator@devkit.store': { role: 'seller', name: 'DevKit Core Creator' },
  'seller@devkit.store': { role: 'seller', name: 'DevKit Creator' },
  'ashutosh@agency.dev': { role: 'buyer', name: 'Ashutosh Dubey' },
};

export function resolveProfileForEmail(
  email: string,
  fallbackName?: string
): { role: UserProfileRole; name: string } {
  const normalized = email.toLowerCase().trim();
  if (AUTHORIZED_PROFILES[normalized]) {
    return AUTHORIZED_PROFILES[normalized];
  }
  const inferred = fallbackName || email.split('@')[0].replace(/[._]/g, ' ');
  const capitalized = inferred.charAt(0).toUpperCase() + inferred.slice(1);
  return { role: 'buyer', name: capitalized };
}

export const DEMO_PROFILES: Record<UserProfileRole, UserSession> = {
  buyer: {
    id: 'user_buyer_1',
    name: 'Ashutosh Dubey',
    email: 'ashutosh@agency.dev',
    role: 'buyer',
    avatarText: 'AD',
  },
  seller: {
    id: 'user_seller_1',
    name: 'DevKit Core Creator',
    email: 'creator@devkit.store',
    role: 'seller',
    avatarText: 'DK',
    sellerQuotas: {
      totalListed: 2,
      freeKitsUsed: 2,
      isSubscribed: false,
    },
  },
  operator: {
    id: 'user_operator_1',
    name: 'Sarah (Safety Desk)',
    email: 'moderator@devkit.store',
    role: 'operator',
    avatarText: 'OP',
  },
  admin: {
    id: 'user_admin_1',
    name: 'Platform Administrator',
    email: 'admin@devkit.store',
    role: 'admin',
    avatarText: 'AD',
  },
};
