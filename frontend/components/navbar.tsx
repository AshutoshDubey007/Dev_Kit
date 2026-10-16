'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Compass,
  BookMarked,
  ShoppingBag,
  Sparkles,
  Bot,
  FolderKanban,
  MessageSquare,
  Search,
  User,
  Plus,
  Settings,
  LogOut,
  Shield,
  LifeBuoy,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import { CommandPalette } from './command-palette';
import { NotificationCenter } from './notification-center';
import { LoginModal } from './auth/login-modal';
import { useAuth } from '../lib/auth-context';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function Navbar() {
  const pathname = usePathname();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, openLoginModal, logout, becomeSeller } = useAuth();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const username = currentUser?.email ? currentUser.email.split('@')[0] : 'ashutoshkdubey007';

  const navLinks = [
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Repositories', href: '/repos', icon: BookMarked },
    { label: 'Marketplace', href: '/kits', icon: ShoppingBag },
    { label: 'Prompts', href: '/prompts', icon: Sparkles },
    { label: 'AI Studio', href: '/studio', icon: Bot },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Discussions', href: '/discussions', icon: MessageSquare },
  ];

  const isLanding = pathname === '/' || pathname === '/kage';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isLanding
            ? 'border-b border-white/[0.06] bg-transparent backdrop-blur-sm'
            : 'border-b border-white/[0.08] bg-[#07090e]/85 backdrop-blur-2xl'
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* ─── LEFT: Logo + Primary Developer Navigation ─── */}
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 border border-white/20 bg-black">
                <Image
                  src="/logo.png"
                  alt="DevKit Marketplace Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-white text-sm group-hover:text-indigo-300 transition-colors">
                  DevKit
                </span>
                <span className="text-[9px] text-zinc-400 font-mono -mt-0.5 tracking-wider uppercase">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-zinc-400">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-semibold'
                        : 'hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ─── RIGHT: Search, Notifications, User Menu ─── */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Global Search / Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-500/40 hover:text-white transition-all shadow-sm backdrop-blur-sm"
            >
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Search or jump to...</span>
              <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Quick Actions (+) */}
            <Link
              href="/repos/new"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors backdrop-blur-sm"
              title="Create New Repository"
            >
              <Plus className="h-4 w-4" />
            </Link>

            {/* Profile Menu or Sign In */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] p-1.5 text-xs transition-all hover:border-emerald-500/40 backdrop-blur-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-[10px] font-bold text-white font-mono">
                    {currentUser.avatarText}
                  </span>
                  <div className="hidden sm:flex flex-col text-left pr-1">
                    <span className="font-semibold text-white truncate max-w-[100px] text-xs">
                      {currentUser.name}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.1] bg-[#0c0e14] p-2 shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-white/[0.08]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-white truncate">{currentUser.name}</span>
                        <Badge variant={roleBadgeMap[currentUser.role]?.variant} size="sm" className="font-mono text-[9px]">
                          {currentUser.role}
                        </Badge>
                      </div>
                      <span className="text-zinc-500 text-[11px] block truncate font-mono">
                        @{username}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5 border-b border-white/[0.08]">
                      <Link
                        href={`/${username}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        <span>My Profile</span>
                      </Link>

                      {/* Always available for buyers: 7-day guarantee portal for purchased items */}
                      <Link
                        href="/buyer/verifications"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-emerald-400 hover:bg-emerald-950/20 transition-colors"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Purchased Kits &amp; Verification</span>
                      </Link>

                      <Link
                        href="/chat"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Support Chats &amp; Messages</span>
                      </Link>

                      {/* Seller & Developer Specific Options */}
                      {currentUser.role !== 'buyer' && (
                        <>
                          <Link
                            href="/seller/my-kits"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
                            <span>My Published Products</span>
                          </Link>
                          <Link
                            href="/repos"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                          >
                            <BookMarked className="h-3.5 w-3.5 text-blue-400" />
                            <span>My Repositories</span>
                          </Link>
                          <Link
                            href="/seller/support"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-indigo-400 hover:bg-indigo-950/20 transition-colors"
                          >
                            <LifeBuoy className="h-3.5 w-3.5" />
                            <span>Customer Support Desk</span>
                          </Link>
                        </>
                      )}

                      {/* Buyer specific shortcut to marketplace */}
                      {currentUser.role === 'buyer' && (
                        <Link
                          href="/kits"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
                          <span>Browse Marketplace</span>
                        </Link>
                      )}
                    </div>

                    {(currentUser.role === 'admin' || currentUser.role === 'operator') && (
                      <div className="py-1 space-y-0.5 border-b border-white/[0.08]">
                        {currentUser.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-purple-300 hover:bg-purple-950/30"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                        <Link
                          href="/operator"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-amber-300 hover:bg-amber-950/30"
                        >
                          <Layers className="h-3.5 w-3.5" />
                          <span>Operator Desk</span>
                        </Link>
                      </div>
                    )}

                    <div className="pt-1 space-y-0.5">
                      {currentUser.role === 'seller' ? (
                        <Link
                          href="/seller/new-kit"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-emerald-400 hover:bg-emerald-950/20"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ List New Code Kit</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            becomeSeller();
                          }}
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-1.5 text-emerald-400 hover:bg-emerald-950/20"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Switch to Seller Mode</span>
                        </button>
                      )}
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span>Account Settings</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left rounded-lg px-3 py-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
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

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-white/[0.08] bg-[#07090e] px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Primary Nav Links */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 px-3 block mb-1">
                Navigation
              </span>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/[0.06] hover:text-white text-sm"
                  >
                    <Icon className="h-4 w-4 text-emerald-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Account / Role Shortcuts in Drawer */}
            <div className="pt-3 border-t border-white/[0.08] space-y-1">
              {currentUser ? (
                <>
                  <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">
                          {currentUser.name || currentUser.email}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono truncate">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                    <Badge variant={roleBadgeMap[currentUser.role]?.variant || 'secondary'} className="text-[10px] font-mono shrink-0 ml-2">
                      {roleBadgeMap[currentUser.role]?.icon} {roleBadgeMap[currentUser.role]?.label}
                    </Badge>
                  </div>

                  <Link
                    href={`/${username}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/[0.06] hover:text-white text-sm"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/buyer/verifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-950/20 text-sm"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Purchased Kits &amp; Verification</span>
                  </Link>

                  <Link
                    href="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/[0.06] hover:text-white text-sm"
                  >
                    <MessageSquare className="h-4 w-4 text-zinc-400" />
                    <span>Support Chats &amp; Messages</span>
                  </Link>

                  {currentUser.role !== 'buyer' && (
                    <>
                      <Link
                        href="/seller/my-kits"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-amber-400 hover:bg-white/[0.06] text-sm"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>My Published Products</span>
                      </Link>
                      <Link
                        href="/seller/support"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-400 hover:bg-indigo-950/20 text-sm"
                      >
                        <LifeBuoy className="h-4 w-4" />
                        <span>Customer Support Desk</span>
                      </Link>
                    </>
                  )}

                  {(currentUser.role === 'admin' || currentUser.role === 'operator') && (
                    <Link
                      href="/operator"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/20 text-sm"
                    >
                      <Layers className="h-4 w-4" />
                      <span>Operator Desk</span>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/20 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm"
                  >
                    Sign In or Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <LoginModal />
    </>
  );
}