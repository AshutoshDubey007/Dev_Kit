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
  const { currentUser, openLoginModal, logout, becomeSeller } = useAuth();

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
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#05070a]/85 backdrop-blur-2xl transition-all">
        {/* Full-width fluid bar — padding only, no centered max-width box */}
        <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* ─── LEFT: Logo + Nav ────────────────────────────── */}
          <div className="flex items-center gap-8 min-w-0">
            <Link href="/" className="group flex items-center gap-3 shrink-0">
              {/* Logo tile — emerald→blue gradient to match hero */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/25 border border-white/20 text-white font-mono font-bold text-xs">
                DK
                <span className="absolute -inset-0.5 rounded-lg bg-emerald-400/25 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-zinc-100 text-sm group-hover:text-white transition-colors">
                  DevKit
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    .store
                  </span>
                </span>
                <div className="flex items-center gap-1.5 -mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Next.js 15 Verified
                  </span>
                </div>
              </div>
            </Link>

            {/* Public Navigation */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
              <Link
                href="/kits"
                className="hover:text-zinc-100 transition-colors py-1 border-b-2 border-transparent hover:border-emerald-500/60"
              >
                Browse Kits
              </Link>
              <Link
                href="/categories/payments"
                className="hover:text-zinc-100 transition-colors py-1 border-b-2 border-transparent hover:border-blue-500/60"
              >
                Payments &amp; UPI
              </Link>
              <Link
                href="/categories/auth"
                className="hover:text-zinc-100 transition-colors py-1 border-b-2 border-transparent hover:border-emerald-500/60"
              >
                Auth &amp; RBAC
              </Link>
              <Link
                href="/categories/ai"
                className="hover:text-zinc-100 transition-colors py-1 border-b-2 border-transparent hover:border-blue-500/60"
              >
                AI &amp; RAG
              </Link>
              <Link
                href="/chat"
                className="hover:text-zinc-100 transition-colors flex items-center gap-1"
              >
                <span>💬</span>
                <span>Chat</span>
              </Link>
              <Link
                href="/verify"
                className="flex items-center gap-1.5 text-emerald-400/90 hover:text-emerald-300 transition-colors"
              >
                <span>Audit Standard</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded">
                  100% Pass
                </span>
              </Link>
            </nav>
          </div>

          {/* ─── RIGHT: Actions ──────────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search trigger — matches the terminal aesthetic */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[#0a0e14]/80 px-3 py-1.5 text-xs text-zinc-500 hover:border-emerald-500/40 hover:text-zinc-200 transition-all"
            >
              <span className="text-zinc-500 text-xs">🔍</span>
              <span>Search code…</span>
              <kbd className="rounded border border-white/[0.1] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Profile / Auth */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#0a0e14]/90 px-2.5 py-1.5 text-xs transition-all hover:border-emerald-500/40 hover:bg-[#0d1219]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-blue-600 text-[10px] font-bold text-white font-mono">
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

                {/* Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.1] bg-[#0a0e14] p-2 shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-1 animate-fade-in">
                    {/* User header */}
                    <div className="p-3 border-b border-white/[0.08]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">
                          {currentUser.name}
                        </span>
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

                    {/* Role-specific links */}
                    <div className="py-1 space-y-0.5 border-b border-white/[0.08]">
                      {currentUser.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-purple-300 hover:bg-purple-950/30 font-medium transition-colors"
                        >
                          <span> Admin Console</span>
                        </Link>
                      )}

                      {(currentUser.role === 'operator' ||
                        currentUser.role === 'admin') && (
                        <Link
                          href="/operator"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-amber-300 hover:bg-amber-950/30 font-medium transition-colors"
                        >
                          <span> Operator Desk</span>
                        </Link>
                      )}

                      {currentUser.role === 'buyer' && (
                        <Link
                          href="/seller/new-kit"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            becomeSeller();
                          }}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-emerald-300 hover:bg-emerald-950/30 font-medium transition-colors"
                        >
                          <span>🚀 Become a Seller (3 Free Kits)</span>
                        </Link>
                      )}

                      {currentUser.role === 'seller' && (
                        <Link
                          href="/seller/new-kit"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-emerald-300 hover:bg-emerald-950/30 font-medium transition-colors"
                        >
                          <span>👨‍💻 Seller Studio &amp; List Kit</span>
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

                    {/* Account actions */}
                    <div className="pt-1 space-y-0.5">
                      <Link
                        href="/login"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900 transition-colors"
                      >
                        <span>Switch Account</span>
                      </Link>

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
                className="text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
              >
                Sign In
              </Button>
            )}

            <Link href="/kits">
              <Button
                size="sm"
                variant="primary"
                className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-blue-500 text-black hover:opacity-90 shadow-md shadow-emerald-500/20 border-0"
              >
                Explore Kits →
              </Button>
            </Link>
          </div>
        </div>

        {/* Thin gradient accent line at the bottom of the header */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
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