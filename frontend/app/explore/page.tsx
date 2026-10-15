'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  BookMarked,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Star,
  FolderGit2,
  ExternalLink,
  Flame,
  ArrowRight,
  Code2,
} from 'lucide-react';
import type { Repository } from '../../types/repository';
import type { PromptItem } from '../../types/prompt';
import { getAllKits } from '../../lib/kits-store';
import { Kit } from '../../types/kit';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { formatPriceINR } from '../../lib/utils';

export default function ExplorePage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);

  useEffect(() => {
    fetch('/api/repos')
      .then((res) => res.json())
      .then((data) => {
        if (data.repositories) setRepos(data.repositories);
      })
      .catch((e) => console.error('Failed to load repos:', e));

    fetch('/api/prompts')
      .then((res) => res.json())
      .then((data) => {
        if (data.prompts) setPrompts(data.prompts);
      })
      .catch((e) => console.error('Failed to load prompts:', e));

    setKits(getAllKits());
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-12">
      {/* ─── Header ─── */}
      <div className="border-b border-white/[0.08] pb-8 pt-4">
        <div className="flex items-center gap-2 mb-2 text-xs text-emerald-400 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Global Developer Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore the DevKit Ecosystem
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Discover trending code repositories, battle-tested Next.js production kits, software generation prompts, and developer tools.
        </p>

        {/* Quick Section Jump Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-5">
          <a
            href="#trending-repos"
            className="rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-1.5 transition-colors"
          >
            <BookMarked className="h-3.5 w-3.5 text-blue-400" />
            <span>Trending Repositories</span>
          </a>
          <a
            href="#marketplace-kits"
            className="rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
            <span>Verified Kits</span>
          </a>
          <a
            href="#ai-prompts"
            className="rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>AI Prompt Templates</span>
          </a>
        </div>
      </div>

      {/* ─── 1. Trending Repositories ─── */}
      <section id="trending-repos" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trending Repositories</h2>
              <p className="text-xs text-zinc-400">Most active and starred developer codebases</p>
            </div>
          </div>
          <Link href="/repos" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
            <span>View all repos</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {repos.slice(0, 3).map((repo) => (
            <div
              key={repo.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-5 space-y-3.5 backdrop-blur-xl hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono">@{repo.ownerUsername}</span>
                    <span className="text-zinc-600">/</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 border border-white/[0.06] bg-zinc-950 px-2 py-0.5 rounded-full">
                    {repo.visibility}
                  </span>
                </div>

                <Link
                  href={`/repos/${repo.ownerUsername}/${repo.name}`}
                  className="text-base font-bold text-white hover:text-blue-300 transition-colors block"
                >
                  {repo.name}
                </Link>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{repo.description}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    {repo.primaryLanguage}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3.5 w-3.5" />
                    {repo.starsCount}
                  </span>
                </div>
                <Link
                  href={`/repos/${repo.ownerUsername}/${repo.name}`}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  Explore →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 2. Verified Marketplace Kits ─── */}
      <section id="marketplace-kits" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Top Marketplace Kits</h2>
              <p className="text-xs text-zinc-400">Battle-tested building blocks ready for immediate checkout</p>
            </div>
          </div>
          <Link href="/kits" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
            <span>Browse 100% verified kits</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kits.slice(0, 3).map((kit) => (
            <div
              key={kit.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-5 space-y-3.5 backdrop-blur-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-950/60 border border-emerald-800 text-[10px] font-mono font-semibold text-emerald-400 px-2 py-0.5">
                    ● {kit.category}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formatPriceINR(kit.priceINR)}
                  </span>
                </div>

                <Link href={`/kits/${kit.slug}`} className="text-base font-bold text-white hover:text-emerald-300 block">
                  {kit.title}
                </Link>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{kit.tagline}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">
                  {kit.verification?.testSuitePassRate || 100}% Test Pass
                </span>
                <Link
                  href={`/kits/${kit.slug}`}
                  className="rounded-lg bg-white/[0.06] hover:bg-emerald-600 hover:text-black px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. AI Prompt Marketplace Blueprints ─── */}
      <section id="ai-prompts" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Featured AI Prompts</h2>
              <p className="text-xs text-zinc-400">Generate full-stack software products with supported LLMs</p>
            </div>
          </div>
          <Link href="/prompts" className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-mono">
            <span>Explore all prompts</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {prompts.slice(0, 3).map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-5 space-y-3.5 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm" className="font-mono text-[9px] uppercase">
                    {prompt.category}
                  </Badge>
                  <span className="text-xs font-bold text-purple-300 font-mono">
                    {prompt.priceINR === 0 ? 'FREE' : `₹${prompt.priceINR}`}
                  </span>
                </div>

                <Link href={`/prompts/${prompt.slug}`} className="text-base font-bold text-white hover:text-purple-300 block">
                  {prompt.title}
                </Link>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{prompt.problemSolves}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-zinc-500">v{prompt.version}</span>
                <Link
                  href={`/prompts/${prompt.slug}`}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Inspect Template →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
