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
      <div className="border-b border-orange-200 pb-8 pt-4">
        <div className="flex items-center gap-2 mb-2 text-xs text-[#b8531e] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#cc6b35] animate-pulse" />
          <span>Global Developer Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
          Explore the DevKit Ecosystem
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
          Discover trending code repositories, battle-tested Next.js production kits, software generation prompts, and developer tools.
        </p>

        {/* Quick Section Jump Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-5">
          <a
            href="#trending-repos"
            className="rounded-xl border border-orange-200 bg-white px-3.5 py-1.5 text-xs text-zinc-800 hover:text-zinc-950 hover:border-[#cc6b35] flex items-center gap-1.5 transition-colors"
          >
            <BookMarked className="h-3.5 w-3.5 text-[#b8531e]" />
            <span>Trending Repositories</span>
          </a>
          <a
            href="#marketplace-kits"
            className="rounded-xl border border-orange-200 bg-white px-3.5 py-1.5 text-xs text-zinc-800 hover:text-zinc-950 hover:border-[#cc6b35] flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#b8531e]" />
            <span>Verified Kits</span>
          </a>
          <a
            href="#ai-prompts"
            className="rounded-xl border border-orange-200 bg-white px-3.5 py-1.5 text-xs text-zinc-800 hover:text-zinc-950 hover:border-[#cc6b35] flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#b8531e]" />
            <span>AI Prompt Templates</span>
          </a>
        </div>
      </div>

      {/* ─── 1. Trending Repositories ─── */}
      <section id="trending-repos" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#f7ece1] border border-[#cc6b35] flex items-center justify-center text-[#b8531e]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Trending Repositories</h2>
              <p className="text-xs text-zinc-600">Most active and starred developer codebases</p>
            </div>
          </div>
          <Link href="/repos" className="text-xs text-[#b8531e] hover:underline flex items-center gap-1 font-mono">
            <span>View all repos</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {repos.slice(0, 3).map((repo) => (
            <div
              key={repo.id}
              className="rounded-2xl border border-orange-200 bg-white p-5 space-y-3.5 backdrop-blur-xl hover:border-[#cc6b35] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600 font-mono">@{repo.ownerUsername}</span>
                    <span className="text-zinc-600">/</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 border border-orange-200 bg-white px-2 py-0.5 rounded-full">
                    {repo.visibility}
                  </span>
                </div>

                <Link
                  href={`/repos/${repo.ownerUsername}/${repo.name}`}
                  className="text-base font-bold text-zinc-950 hover:text-[#b8531e] transition-colors block"
                >
                  {repo.name}
                </Link>
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">{repo.description}</p>
              </div>

              <div className="pt-3 border-t border-orange-200 flex items-center justify-between text-xs font-mono text-zinc-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-zinc-800">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    {repo.primaryLanguage}
                  </span>
                  <span className="flex items-center gap-1 text-[#b8531e]">
                    <Star className="h-3.5 w-3.5" />
                    {repo.starsCount}
                  </span>
                </div>
                <Link
                  href={`/repos/${repo.ownerUsername}/${repo.name}`}
                  className="text-xs text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
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
            <div className="h-8 w-8 rounded-lg bg-[#f7ece1] border border-[#cc6b35] flex items-center justify-center text-[#b8531e]">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Top Marketplace Kits</h2>
              <p className="text-xs text-zinc-600">Battle-tested building blocks ready for immediate checkout</p>
            </div>
          </div>
          <Link href="/kits" className="text-xs text-[#b8531e] hover:underline flex items-center gap-1 font-mono">
            <span>Browse 100% verified kits</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kits.slice(0, 3).map((kit) => (
            <div
              key={kit.id}
              className="rounded-2xl border border-orange-200 bg-white p-5 space-y-3.5 backdrop-blur-xl hover:border-[#cc6b35] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#f7ece1] border border-[#cc6b35] text-[10px] font-mono font-semibold text-[#b8531e] px-2 py-0.5">
                    ● {kit.category}
                  </span>
                  <span className="text-sm font-bold text-[#b8531e] font-mono">
                    {formatPriceINR(kit.priceINR)}
                  </span>
                </div>

                <Link href={`/kits/${kit.slug}`} className="text-base font-bold text-zinc-950 hover:text-[#b8531e] block">
                  {kit.title}
                </Link>
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">{kit.tagline}</p>
              </div>

              <div className="pt-3 border-t border-orange-200 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-600">
                  {kit.verification?.testSuitePassRate || 100}% Test Pass
                </span>
                <Link
                  href={`/kits/${kit.slug}`}
                  className="rounded-lg bg-[#faf5ef] hover:bg-[#b8531e] hover:text-orange-100 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
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
            <div className="h-8 w-8 rounded-lg bg-[#f7ece1] border border-[#cc6b35] flex items-center justify-center text-[#b8531e]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Featured AI Prompts</h2>
              <p className="text-xs text-zinc-600">Generate full-stack software products with supported LLMs</p>
            </div>
          </div>
          <Link href="/prompts" className="text-xs text-[#b8531e] hover:underline flex items-center gap-1 font-mono">
            <span>Explore all prompts</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {prompts.slice(0, 3).map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-2xl border border-orange-200 bg-white p-5 space-y-3.5 backdrop-blur-xl hover:border-[#cc6b35] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm" className="font-mono text-[9px] uppercase">
                    {prompt.category}
                  </Badge>
                  <span className="text-xs font-bold text-[#b8531e] font-mono">
                    {prompt.priceINR === 0 ? 'FREE' : `₹${prompt.priceINR}`}
                  </span>
                </div>

                <Link href={`/prompts/${prompt.slug}`} className="text-base font-bold text-zinc-950 hover:text-[#b8531e] block">
                  {prompt.title}
                </Link>
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">{prompt.problemSolves}</p>
              </div>

              <div className="pt-3 border-t border-orange-200 flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-zinc-600">v{prompt.version}</span>
                <Link
                  href={`/prompts/${prompt.slug}`}
                  className="text-xs text-[#b8531e] hover:text-[#b8531e] flex items-center gap-1"
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
