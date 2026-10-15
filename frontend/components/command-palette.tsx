'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookMarked,
  ShoppingBag,
  Sparkles,
  Bot,
  FolderKanban,
  MessageSquare,
  Compass,
  PlusCircle,
  Code2,
  X,
  ArrowRight,
  User,
} from 'lucide-react';
import { KITS } from '../data/kits';
import { SEED_REPOSITORIES } from '../data/repositories';
import { SEED_PROMPTS } from '../data/prompts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Navigation Items
  const navItems = [
    { title: 'Explore Overview', subtitle: 'Trending repositories, kits & prompts', icon: Compass, href: '/explore', category: 'Navigation' },
    { title: 'Repositories', subtitle: 'Browse developer code repositories', icon: BookMarked, href: '/repos', category: 'Navigation' },
    { title: 'Marketplace Kits', subtitle: 'Verified Next.js 15 production blocks', icon: ShoppingBag, href: '/kits', category: 'Navigation' },
    { title: 'AI Prompt Marketplace', subtitle: 'Software generation prompts & templates', icon: Sparkles, href: '/prompts', category: 'Navigation' },
    { title: 'AI Generation Studio', subtitle: 'Generate runnable codebases from prompts', icon: Bot, href: '/studio', category: 'Navigation' },
    { title: 'Projects & Tasks', subtitle: 'Collaborative Kanban boards & tracking', icon: FolderKanban, href: '/projects', category: 'Navigation' },
    { title: 'Discussions & Q&A', subtitle: 'Developer community troubleshooting', icon: MessageSquare, href: '/discussions', category: 'Navigation' },
    { title: 'Messages & Chat', subtitle: 'In-app buyer and seller support threads', icon: MessageSquare, href: '/chat', category: 'Navigation' },
  ];

  // Action Items
  const actionItems = [
    { title: 'Create New Repository', subtitle: 'Initialize a clean repo or import from GitHub', icon: PlusCircle, href: '/repos/new', category: 'Actions' },
    { title: 'List a Marketplace Kit', subtitle: 'Upload a verified repo or ZIP package', icon: Code2, href: '/seller/new-kit', category: 'Actions' },
    { title: 'Create AI Prompt', subtitle: 'Publish a software-generating prompt template', icon: Sparkles, href: '/prompts/new', category: 'Actions' },
  ];

  // Dynamic search results
  const q = query.toLowerCase().trim();

  const filteredNav = navItems.filter((i) => !q || i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q));
  const filteredActions = actionItems.filter((i) => !q || i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q));

  const filteredRepos = SEED_REPOSITORIES.filter(
    (r) => q && (r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.topics.some((t) => t.includes(q)))
  ).map((r) => ({
    title: `${r.ownerUsername}/${r.name}`,
    subtitle: r.description,
    icon: BookMarked,
    href: `/repos/${r.ownerUsername}/${r.name}`,
    category: 'Repositories',
  }));

  const filteredKits = KITS.filter(
    (k) => q && (k.title.toLowerCase().includes(q) || k.tagline.toLowerCase().includes(q) || k.category.includes(q))
  ).map((k) => ({
    title: k.title,
    subtitle: `₹${k.priceINR} • ${k.category} • ${k.tagline}`,
    icon: ShoppingBag,
    href: `/kits/${k.slug}`,
    category: 'Marketplace Kits',
  }));

  const filteredPrompts = SEED_PROMPTS.filter(
    (p) => q && (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.includes(q))
  ).map((p) => ({
    title: p.title,
    subtitle: `${p.priceINR === 0 ? 'Free' : `₹${p.priceINR}`} • ${p.category} • ${p.description}`,
    icon: Sparkles,
    href: `/prompts/${p.slug}`,
    category: 'AI Prompts',
  }));

  const allResults = [...filteredActions, ...filteredRepos, ...filteredKits, ...filteredPrompts, ...filteredNav];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex].href);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.12] bg-[#0c0e14] shadow-2xl shadow-black/80 overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#0e111a]">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search repos, kits, prompts, tools..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="rounded bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm text-zinc-400">No results found for "{query}"</p>
              <p className="text-xs text-zinc-500">Try searching for "razorpay", "auth", "saas", "repos", or "studio"</p>
            </div>
          ) : (
            allResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.category}-${item.title}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected ? 'bg-indigo-600/20 border border-indigo-500/40 text-white' : 'text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-white/[0.06] text-zinc-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                        <span className="rounded px-1.5 py-0.2 text-[9px] font-mono bg-white/[0.06] text-zinc-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className={`h-3.5 w-3.5 text-zinc-500 shrink-0 ${isSelected ? 'text-indigo-400' : 'opacity-0'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-[#080a0f] text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>DevKit Command Palette</span>
        </div>
      </div>
    </div>
  );
}
