'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SessionProvider,
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';

export type { UserProfileRole, UserSession } from './auth-shared';
export {
  AUTHORIZED_PROFILES,
  resolveProfileForEmail,
  DEMO_PROFILES,
} from './auth-shared';
import {
  UserProfileRole,
  UserSession,
  DEMO_PROFILES,
  resolveProfileForEmail,
} from './auth-shared';

interface AuthContextType {
  currentUser: UserSession | null;
  loginWithCredentials: (email: string, password?: string) => Promise<UserSession>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<UserSession>;
  becomeSeller: () => void;
  switchRole: (role: UserProfileRole) => void;
  loginAsRole: (role: UserProfileRole) => void;
  loginWithEmail: (email: string, name: string, role?: UserProfileRole) => void;
  signupWithEmail: (
    email: string,
    name: string,
    password?: string,
    role?: UserProfileRole
  ) => Promise<UserSession>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'devkit_user_session';

function NextAuthSync({
  onSync,
}: {
  onSync: (user: any) => void;
}) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user && session.user.email) {
      onSync(session.user);
    }
  }, [session, onSync]);

  return null;
}

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
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

  const handleNextAuthSync = React.useCallback((nextAuthUser: any) => {
    const email = nextAuthUser.email || '';
    const name = nextAuthUser.name || email.split('@')[0];
    const { role } = resolveProfileForEmail(email, name);
    const initials = name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const profile: UserSession = {
      id: nextAuthUser.id || `usr_oauth_${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      role: nextAuthUser.role || role,
      avatarText: initials || 'US',
      avatarUrl: nextAuthUser.image || undefined,
      provider: nextAuthUser.provider || 'github',
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
  }, []);

  // Standard Basic Login with Email & Password
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

  // Real OAuth Login with NextAuth
  const loginWithOAuth = async (
    provider: 'google' | 'github'
  ): Promise<void> => {
    try {
      await nextAuthSignIn(provider, { callbackUrl: '/onboarding' });
    } catch (err) {
      console.error(`Error redirecting to ${provider}:`, err);
    }
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

  const logout = async () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      await nextAuthSignOut({ redirect: false });
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
      <NextAuthSync onSync={handleNextAuthSync} />
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
