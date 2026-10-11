'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SearchModal } from './search/search-modal';
import { LoginModal } from './auth/login-modal';
import { useAuth } from '../lib/auth-context';
import { KITS } from '../data/kits';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, openLoginModal, logout } = useAuth();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadgeMap = {
    admin: { label: 'Admin', icon: '👑', variant: 'purple' as const },
    operator: { label: 'Operator', icon: '🛡️', variant: 'warning' as const },
    seller: { label: 'Seller', icon: '👨‍💻', variant: 'success' as const },
    buyer: { label: 'Buyer', icon: '👤', variant: 'secondary' as const },
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#070709]/80 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand with subtle glow */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/25 border border-white/20 text-white font-mono font-bold text-xs">
                DK
                <span className="absolute -inset-0.5 rounded-lg bg-indigo-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-zinc-100 text-sm group-hover:text-white transition-colors">
                  DevKit<span className="text-indigo-400">.store</span>
                </span>
                <div className="flex items-center gap-1.5 -mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Next.js 15 Verified
                  </span>
                </div>
              </div>
            </Link>

            {/* Public Navigation links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
              <Link
                href="/kits"
                className="hover:text-zinc-100 transition-colors py-1 hover:border-b-2 hover:border-indigo-500"
              >
                Browse Kits
              </Link>
              <Link
                href="/categories/payments"
                className="hover:text-zinc-100 transition-colors"
              >
                Payments & UPI
              </Link>
              <Link
                href="/categories/auth"
                className="hover:text-zinc-100 transition-colors"
              >
                Auth & RBAC
              </Link>
              <Link
                href="/categories/ai"
                className="hover:text-zinc-100 transition-colors"
              >
                AI & RAG
              </Link>
              <Link
                href="/chat"
                className="hover:text-zinc-100 transition-colors flex items-center gap-1"
              >
                <span>💬 Chat</span>
              </Link>
              <Link
                href="/verify"
                className="flex items-center gap-1 text-emerald-400/90 hover:text-emerald-300 transition-colors"
              >
                <span>Audit Standard</span>
                <span className="text-[10px] bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 px-1 rounded">
                  100% Pass
                </span>
              </Link>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Search command trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-3 rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all hover:bg-zinc-900 shadow-inner"
            >
              <span className="text-zinc-400 text-xs">🔍</span>
              <span>Search code...</span>
              <kbd className="keycap rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                ⌘K
              </kbd>
            </button>

            {/* Profile / Auth Dropdown */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-zinc-900/90 px-2.5 py-1.5 text-xs transition-all hover:border-zinc-700 hover:bg-zinc-800"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-[10px] font-bold text-white font-mono">
                    {currentUser.avatarText}
                  </span>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-semibold text-white truncate max-w-[100px] text-xs">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-mono capitalize text-zinc-400 -mt-0.5">
                      {roleBadgeMap[currentUser.role]?.icon} {currentUser.role}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">▼</span>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.1] bg-[#0c0d12] p-2 shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-1 animate-fade-in">
                    {/* User Info Header */}
                    <div className="p-3 border-b border-white/[0.08]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{currentUser.name}</span>
                        <Badge
                          variant={roleBadgeMap[currentUser.role]?.variant}
                          size="sm"
                          className="font-mono text-[10px] uppercase"
                        >
                          {currentUser.role}
                        </Badge>
                      </div>
                      <span className="text-zinc-400 text-[11px] block truncate font-mono">
                        {currentUser.email}
                      </span>
                    </div>

                    {/* Role-Specific Portal Links */}
                    <div className="py-1 space-y-0.5 border-b border-white/[0.08]">
                      {currentUser.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-purple-300 hover:bg-purple-950/30 font-medium transition-colors"
                        >
                          <span>👑 Admin Console</span>
                        </Link>
                      )}

                      {(currentUser.role === 'operator' || currentUser.role === 'admin') && (
                        <Link
                          href="/operator"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-amber-300 hover:bg-amber-950/30 font-medium transition-colors"
                        >
                          <span>🛡️ Operator Desk</span>
                        </Link>
                      )}

                      {currentUser.role === 'seller' && (
                        <Link
                          href="/seller/new-kit"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-emerald-300 hover:bg-emerald-950/30 font-medium transition-colors"
                        >
                          <span>👨‍💻 Seller Portal & List Kit</span>
                        </Link>
                      )}

                      <Link
                        href="/chat"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900 transition-colors"
                      >
                        <span>💬 In-App Support Chats</span>
                      </Link>
                    </div>

                    {/* Switch Profile Action */}
                    <div className="pt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          openLoginModal();
                        }}
                        className="w-full text-left rounded-lg px-3 py-2 text-indigo-300 hover:bg-indigo-950/30 font-medium transition-colors flex items-center justify-between"
                      >
                        <span>⚡ Switch Profile / Role</span>
                        <span className="text-[10px] text-zinc-500">Demo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left rounded-lg px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={openLoginModal}
                className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
              >
                Sign In
              </Button>
            )}

            <Link href="/kits">
              <Button size="sm" variant="primary" className="text-xs shadow-md shadow-indigo-600/20 font-medium">
                Explore Kits →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        kits={KITS}
      />
      <LoginModal />
    </>
  );
}
