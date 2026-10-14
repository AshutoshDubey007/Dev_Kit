'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface AuthContextType {
  currentUser: UserSession | null;
  loginWithCredentials: (email: string, password?: string) => Promise<UserSession>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<UserSession>;
  signup: (name: string, email: string, password?: string) => Promise<UserSession>;
  loginAsRole: (role: UserProfileRole) => void;
  loginWithEmail: (email: string, name: string, role?: UserProfileRole) => void;
  signupWithEmail: (
    email: string,
    name: string,
    password?: string,
    role?: UserProfileRole
  ) => Promise<UserSession>;
  becomeSeller: () => void;
  switchRole: (role: UserProfileRole) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'devkit_user_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Initialize from localStorage or default to Buyer profile
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      } else {
        // Default session: Buyer
        setCurrentUser(DEMO_PROFILES.buyer);
      }
    } catch {
      setCurrentUser(DEMO_PROFILES.buyer);
    }
  }, []);

  const saveUserSession = (profile: UserSession) => {
    setCurrentUser(profile);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } catch {}
    setIsLoginModalOpen(false);
  };

  // Standard Basic Login with Email & Password (auto-detects role from specified profiles)
  const loginWithCredentials = async (
    email: string,
    _password?: string
  ): Promise<UserSession> => {
    const { role, name } = resolveProfileForEmail(email);
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const profile: UserSession = {
      id: `usr_${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      role,
      avatarText: initials || 'US',
      provider: 'credentials',
      sellerQuotas:
        role === 'seller'
          ? {
              totalListed: 2,
              freeKitsUsed: 2,
              isSubscribed: false,
            }
          : undefined,
    };

    saveUserSession(profile);
    return profile;
  };

  // Standard OAuth with Google or GitHub
  const loginWithOAuth = async (
    provider: 'google' | 'github'
  ): Promise<UserSession> => {
    const isGoogle = provider === 'google';
    const mockEmail = isGoogle ? 'ashutosh.dubey@gmail.com' : 'ashutoshdubey@github.com';
    const mockName = isGoogle ? 'Ashutosh Dubey' : 'ashutoshdubey';
    const { role, name } = resolveProfileForEmail(mockEmail, mockName);
    const avatarText = isGoogle ? 'G' : 'GH';

    const profile: UserSession = {
      id: `usr_${provider}_${Date.now()}`,
      name,
      email: mockEmail,
      role,
      avatarText,
      provider,
      sellerQuotas:
        role === 'seller'
          ? {
              totalListed: 2,
              freeKitsUsed: 2,
              isSubscribed: false,
            }
          : undefined,
    };

    saveUserSession(profile);
    return profile;
  };

  // Standard Basic Sign Up
  const signup = async (
    name: string,
    email: string,
    _password?: string
  ): Promise<UserSession> => {
    const { role } = resolveProfileForEmail(email, name);
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const profile: UserSession = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      avatarText: initials || 'US',
      provider: 'credentials',
      sellerQuotas:
        role === 'seller'
          ? {
              totalListed: 0,
              freeKitsUsed: 0,
              isSubscribed: false,
            }
          : undefined,
    };

    saveUserSession(profile);
    return profile;
  };

  const loginAsRole = (role: UserProfileRole) => {
    const profile = DEMO_PROFILES[role];
    saveUserSession(profile);
  };

  const loginWithEmail = (email: string, name: string, role?: UserProfileRole) => {
    const resolved = role || resolveProfileForEmail(email, name).role;
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const profile: UserSession = {
      id: `usr_${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      role: resolved,
      avatarText: initials || 'US',
      provider: 'credentials',
    };

    saveUserSession(profile);
  };

  const signupWithEmail = async (
    email: string,
    name: string,
    password?: string,
    _role?: UserProfileRole
  ): Promise<UserSession> => {
    return signup(name, email, password);
  };

  const becomeSeller = () => {
    if (!currentUser) return;
    const updated: UserSession = {
      ...currentUser,
      role: 'seller',
      sellerQuotas: currentUser.sellerQuotas || {
        totalListed: 0,
        freeKitsUsed: 0,
        isSubscribed: false,
      },
    };
    saveUserSession(updated);
  };

  const switchRole = (role: UserProfileRole) => {
    if (!currentUser) return;
    const updated: UserSession = {
      ...currentUser,
      role,
      sellerQuotas:
        role === 'seller'
          ? currentUser.sellerQuotas || {
              totalListed: 0,
              freeKitsUsed: 0,
              isSubscribed: false,
            }
          : currentUser.sellerQuotas,
    };
    saveUserSession(updated);
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginWithCredentials,
        loginWithOAuth,
        signup,
        becomeSeller,
        switchRole,
        loginAsRole,
        loginWithEmail,
        signupWithEmail,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
