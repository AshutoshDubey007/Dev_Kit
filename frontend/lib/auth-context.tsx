'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserProfileRole = 'buyer' | 'seller' | 'operator' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserProfileRole;
  avatarText: string;
  sellerQuotas?: {
    totalListed: number;
    freeKitsUsed: number;
    isSubscribed: boolean;
  };
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
  loginAsRole: (role: UserProfileRole) => void;
  loginWithEmail: (email: string, name: string, role: UserProfileRole) => void;
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

  const loginAsRole = (role: UserProfileRole) => {
    const profile = DEMO_PROFILES[role];
    setCurrentUser(profile);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } catch {}
    setIsLoginModalOpen(false);
  };

  const loginWithEmail = (email: string, name: string, role: UserProfileRole) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const profile: UserSession = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      avatarText: initials || 'US',
    };

    setCurrentUser(profile);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } catch {}
    setIsLoginModalOpen(false);
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
        loginAsRole,
        loginWithEmail,
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
