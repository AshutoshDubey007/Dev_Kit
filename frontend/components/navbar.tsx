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
            ? 'border-b-2 border-[#cc6b35] bg-white/90 backdrop-blur-md shadow-[0_3px_0_#e8c3a8]'
            : 'border-b-2 border-[#cc6b35] bg-white/95 backdrop-blur-md shadow-[0_3px_0_#e8c3a8]'
        }`}
      >
        <div className="flex min-h-[4rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2">
          {/* ─── LEFT: Logo + Primary Developer Navigation ─── */}
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden shadow-[2px_2px_0px_#cc6b35] border-2 border-[#cc6b35] bg-white">
                <Image
                  src="/logo.png?v=2"
                  alt="DevKit Marketplace Logo"
                  width={36}
                  height={36}
                  unoptimized
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-arcade tracking-tight text-zinc-950 text-xs group-hover:text-[#b8531e] transition-colors">
                  DevKit
                </span>
                <span className="text-[10px] text-[#b8531e] font-pixel mt-0.5 tracking-wider uppercase font-bold">
                  Arcade Store
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 text-xs font-pixel text-zinc-700">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'bg-[#b8531e] border-[#78330f] text-white font-bold shadow-[2px_2px_0px_#e5a982]'
                        : 'border-transparent hover:text-[#b8531e] hover:bg-orange-50 hover:border-orange-200'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#cc6b35]'}`} />
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
              className="flex items-center gap-2.5 rounded-lg border-2 border-orange-300 bg-[#faf5ef] hover:bg-orange-100 px-3 py-1.5 text-xs font-pixel text-zinc-800 hover:border-[#cc6b35] hover:text-zinc-950 transition-all shadow-[2px_2px_0px_#e8c3a8]"
            >
              <Search className="h-3.5 w-3.5 text-[#b8531e]" />
              <span className="hidden sm:inline">Search or jump...</span>
              <kbd className="keycap rounded px-1.5 py-0.5 text-[10px] font-pixel">
                ⌘K
              </kbd>
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Quick Actions (+) */}
            <Link
              href="/repos/new"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border-2 border-orange-300 bg-white hover:bg-orange-50 text-[#b8531e] hover:border-[#cc6b35] transition-colors shadow-[2px_2px_0px_#e8c3a8]"
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
                  className="flex items-center gap-2 rounded-lg border-2 border-[#cc6b35] bg-white hover:bg-orange-50 p-1.5 text-xs transition-all shadow-[2px_2px_0px_#cc6b35]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#b8531e] text-[10px] font-bold text-white font-pixel">
                    {currentUser.avatarText}
                  </span>
                  <div className="hidden sm:flex flex-col text-left pr-1">
                    <span className="font-pixel font-bold text-zinc-950 truncate max-w-[110px] text-xs">
                      {currentUser.name}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border-2 border-[#cc6b35] bg-white p-2 shadow-[6px_6px_0px_#cc6b35] z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b-2 border-orange-100 bg-[#faf5ef] rounded-lg">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <span className="font-pixel font-bold text-zinc-950 truncate">{currentUser.name}</span>
                        <Badge variant={roleBadgeMap[currentUser.role]?.variant} size="sm" className="text-[10px]">
                          {currentUser.role}
                        </Badge>
                      </div>
                      <span className="text-zinc-600 text-[11px] block truncate font-mono">
                        @{username}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5 border-b-2 border-orange-100">
                      <Link
                        href={`/${username}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] transition-colors font-medium"
                      >
                        <User className="h-3.5 w-3.5 text-[#cc6b35]" />
                        <span>My Profile</span>
                      </Link>

                      {/* Always available for buyers: 7-day guarantee portal for purchased items */}
                      <Link
                        href="/buyer/verifications"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#b8531e] font-semibold hover:bg-orange-50 transition-colors"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Purchased Kits &amp; Verification</span>
                      </Link>

                      <Link
                        href="/chat"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] transition-colors font-medium"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#cc6b35]" />
                        <span>Support Chats &amp; Messages</span>
                      </Link>

                      {/* Seller & Developer Specific Options */}
                      {currentUser.role !== 'buyer' && (
                        <>
                          <Link
                            href="/seller/my-kits"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] transition-colors font-medium"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 text-[#cc6b35]" />
                            <span>My Published Products</span>
                          </Link>
                          <Link
                            href="/repos"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] transition-colors font-medium"
                          >
                            <BookMarked className="h-3.5 w-3.5 text-[#cc6b35]" />
                            <span>My Repositories</span>
                          </Link>
                          <Link
                            href="/seller/support"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#b8531e] hover:bg-orange-50 transition-colors font-medium"
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
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] transition-colors font-medium"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-[#cc6b35]" />
                          <span>Browse Marketplace</span>
                        </Link>
                      )}
                    </div>

                    {(currentUser.role === 'admin' || currentUser.role === 'operator') && (
                      <div className="py-1 space-y-0.5 border-b-2 border-orange-100">
                        {currentUser.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[#964115] font-semibold hover:bg-orange-50"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                        <Link
                          href="/operator"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[#b8531e] font-semibold hover:bg-orange-50"
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
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[#b8531e] font-semibold hover:bg-orange-50"
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
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-1.5 text-[#b8531e] font-semibold hover:bg-orange-50"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Switch to Seller Mode</span>
                        </button>
                      )}
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-zinc-700 hover:text-[#b8531e] hover:bg-orange-50"
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
                        className="w-full text-left rounded-lg px-3 py-1.5 text-zinc-700 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
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
                variant="primary"
                size="sm"
                onClick={openLoginModal}
                className="text-xs"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
              className="xl:hidden flex h-8 w-8 items-center justify-center rounded-lg border-2 border-orange-300 bg-white text-[#b8531e] hover:border-[#cc6b35]"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t-2 border-[#cc6b35] bg-white px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Primary Nav Links */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-pixel tracking-wider text-[#b8531e] px-3 block mb-1 font-bold">
                Navigation
              </span>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] font-pixel text-sm"
                  >
                    <Icon className="h-4 w-4 text-[#cc6b35]" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Account / Role Shortcuts in Drawer */}
            <div className="pt-3 border-t-2 border-orange-100 space-y-1">
              {currentUser ? (
                <>
                  <div className="px-3 py-2.5 rounded-xl bg-[#faf5ef] border-2 border-orange-200 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-[#b8531e] flex items-center justify-center font-pixel font-bold text-white text-xs shrink-0">
                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-pixel font-bold text-zinc-950 truncate">
                          {currentUser.name || currentUser.email}
                        </span>
                        <span className="text-[11px] text-zinc-600 font-mono truncate">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                    <Badge variant={roleBadgeMap[currentUser.role]?.variant || 'secondary'} className="text-[10px] shrink-0 ml-2">
                      {roleBadgeMap[currentUser.role]?.icon} {roleBadgeMap[currentUser.role]?.label}
                    </Badge>
                  </div>

                  <Link
                    href={`/${username}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] text-sm"
                  >
                    <User className="h-4 w-4 text-[#cc6b35]" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/buyer/verifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#b8531e] font-semibold hover:bg-orange-50 text-sm"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Purchased Kits &amp; Verification</span>
                  </Link>

                  <Link
                    href="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] text-sm"
                  >
                    <MessageSquare className="h-4 w-4 text-[#cc6b35]" />
                    <span>Support Chats &amp; Messages</span>
                  </Link>

                  {currentUser.role !== 'buyer' && (
                    <>
                      <Link
                        href="/seller/my-kits"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-800 hover:bg-orange-50 hover:text-[#b8531e] text-sm"
                      >
                        <ShoppingBag className="h-4 w-4 text-[#cc6b35]" />
                        <span>My Published Products</span>
                      </Link>
                      <Link
                        href="/seller/support"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#b8531e] hover:bg-orange-50 text-sm"
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
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#964115] font-semibold hover:bg-orange-50 text-sm"
                    >
                      <Layers className="h-4 w-4" />
                      <span>Operator Desk</span>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-700 hover:text-[#b8531e] hover:bg-orange-50 text-sm"
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
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 text-sm"
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
                    variant="primary"
                    className="w-full text-sm"
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