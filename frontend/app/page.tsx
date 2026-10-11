'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KITS } from '../data/kits';
import { CATEGORIES } from '../data/categories';
import { KitCard } from '../components/kits/kit-card';
import { SearchBar } from '../components/search/search-bar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const [heroSearch, setHeroSearch] = useState('');
  const router = useRouter();

  const handleHeroSearch = (query: string) => {
    setHeroSearch(query);
    if (query.trim().length > 2) {
      router.push(`/kits?q=${encodeURIComponent(query)}`);
    }
  };

  const featuredKits = KITS.filter((kit) => kit.isFeatured);

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section (Linear / Raycast aesthetic) */}
      <section className="relative flex flex-col items-center text-center pt-8 sm:pt-16 pb-6">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 -z-10 h-80 w-[36rem] rounded-full bg-gradient-to-tr from-indigo-600/20 via-violet-500/15 to-transparent blur-3xl pointer-events-none" />

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-[#121319]/80 px-3.5 py-1 text-xs text-zinc-300 backdrop-blur-xl shadow-lg mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium">Next.js 15 & React 19 Verified</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-mono text-[11px]">Zero Technical Debt</span>
        </div>

        {/* High-Contrast Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1]">
          Stop debugging boilerplates.{' '}
          <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-purple-300 bg-clip-text text-transparent block sm:inline">
            Buy code you can actually trust.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Pre-tested integration modules solving production edge cases: Razorpay webhook idempotency, enterprise RBAC hierarchies, and streaming RAG pipelines.
        </p>

        {/* Tactile Command Search Bar */}
        <div className="w-full max-w-xl mt-10">
          <div className="p-1 rounded-2xl border border-white/[0.12] bg-[#0e0f14]/80 shadow-2xl backdrop-blur-xl">
            <SearchBar
              value={heroSearch}
              onChange={handleHeroSearch}
              placeholder="Search integrations (e.g. Razorpay, Subscriptions, Auth, RAG)..."
            />
          </div>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-zinc-500">
            <span className="font-mono text-[11px] text-zinc-400">Quick explore:</span>
            {['Razorpay', 'Auth RBAC', 'AI Search', 'Docker'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => router.push(`/kits?q=${encodeURIComponent(tag)}`)}
                className="rounded-md border border-white/[0.08] bg-zinc-900/60 px-2.5 py-1 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-mono text-[11px]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Real Architecture Comparison (Why Engineers Buy This) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-red-950/40 bg-red-950/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-red-400">
            <span>✕</span>
            <span>The Ordinary Boilerplate Trap</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Bloated repos that ship 50 dependencies you don't need. Webhook handlers that fail on network retries, granting customers double subscriptions or crashing on Next.js raw body parsing.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-950/50 bg-emerald-950/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
            <span>✓</span>
            <span>The DevKit Verified Standard</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Laser-focused integration kits. Every package is audited from a clean install, runs automated failure-mode tests, and handles database locks and signature checks out of the box.
          </p>
        </div>
      </section>

      {/* 3. Featured Verified Modules */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="purple" size="sm">
                Flagship Modules
              </Badge>
              <span className="text-xs text-zinc-500 font-mono">100% Test Pass Guarantee</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready-to-Deploy Integration Kits
            </h2>
          </div>
          <Link
            href="/kits"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
          >
            <span>Explore all verified kits</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredKits.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </div>
      </section>

      {/* 4. Browse by Category */}
      <section className="space-y-6">
        <div className="border-b border-white/[0.06] pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Architecture Categories
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Choose by the exact problem you are solving today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group p-5 rounded-xl border border-white/[0.07] bg-[#0c0d12]/70 hover:border-indigo-500/40 hover:bg-zinc-900/50 transition-all flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-bold text-sm text-zinc-200 group-hover:text-indigo-300 transition-colors">
                    {cat.name}
                  </span>
                  <Badge size="sm" variant="secondary" className="font-mono text-[10px]">
                    {cat.count} kits
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <span className="mt-4 text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1">
                <span>View integrations</span>
                <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Clean Trust Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#131520] to-[#0a0a0f] p-8 sm:p-14 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 text-xs text-indigo-300 font-mono mb-4">
          <span>⚡ Instant Digital Delivery</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Save 15+ billable engineering hours on your next build.
        </h3>
        <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          One-time commercial purchase. Full source code ownership. Tested on clean systems with zero vendor lock-in.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/kits">
            <Button variant="primary" size="lg" className="text-xs font-semibold shadow-lg shadow-indigo-600/30">
              Browse All Integration Kits →
            </Button>
          </Link>
          <Link href="/verify">
            <Button variant="outline" size="lg" className="text-xs font-medium">
              Inspect Verification Criteria ✓
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
