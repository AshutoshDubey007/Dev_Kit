'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Bot,
  Tag,
  Star,
  Plus,
  ArrowRight,
  Lock,
  Unlock,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import type { PromptItem } from '../../types/prompt';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function PromptsMarketplacePage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    fetch('/api/prompts')
      .then((res) => res.json())
      .then((data) => {
        if (data.prompts) setPrompts(data.prompts);
      })
      .catch((e) => console.error('Failed to load prompts:', e));
  }, []);

  const categories = [
    { label: 'All Categories', slug: 'all' },
    { label: 'SaaS Starters', slug: 'saas' },
    { label: 'AI & RAG Chatbots', slug: 'ai' },
    { label: 'Payments & Billing', slug: 'payments' },
    { label: 'Auth & RBAC', slug: 'auth' },
    { label: 'Dashboards & Analytics', slug: 'dashboard' },
    { label: 'APIs & Microservices', slug: 'api' },
  ];

  const filteredPrompts = prompts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.problemSolves.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesFree = !freeOnly || !p.isPaid;

    return matchesSearch && matchesCategory && matchesFree;
  });

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-purple-400 font-mono">
            <span>●</span>
            <span>AI Code Generation Blueprints</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Prompt Marketplace
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Buy, test, and run prompt blueprints that generate complete, production-grade Next.js, Python, and cloud architectures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/studio">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-purple-500/40 text-purple-300">
              <Bot className="h-4 w-4" />
              <span>Open AI Studio</span>
            </Button>
          </Link>
          <Link href="/prompts/new">
            <Button
              variant="primary"
              size="sm"
              className="text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold gap-1.5 shadow-lg shadow-purple-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Prompt</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Search & Category Filter Pills ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search software generation prompts (e.g. SaaS, Razorpay, RAG, Dashboard)..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e14] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-400 font-mono cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="rounded"
            />
            <span>Free Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'bg-zinc-950 text-zinc-400 border border-white/[0.06] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Prompts Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.length === 0 ? (
          <div className="col-span-3 py-16 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No AI prompts match your search</p>
            <p className="text-xs text-zinc-500">Try modifying your query or selecting another category.</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-5 space-y-4 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm" className="font-mono text-[9px] uppercase">
                    {prompt.category}
                  </Badge>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {prompt.priceINR === 0 ? 'FREE' : `₹${prompt.priceINR}`}
                  </span>
                </div>

                <Link
                  href={`/prompts/${prompt.slug}`}
                  className="text-base font-bold text-white hover:text-purple-300 transition-colors block line-clamp-1"
                >
                  {prompt.title}
                </Link>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {prompt.description}
                </p>

                {/* Problem Solved Callout */}
                <div className="rounded-xl bg-purple-950/20 border border-purple-900/40 p-2.5 text-[11px] text-purple-300 leading-relaxed">
                  <span className="font-bold text-purple-200">Solves: </span>
                  {prompt.problemSolves}
                </div>

                {/* Supported AI Models */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Tested Models</span>
                  <div className="flex flex-wrap gap-1">
                    {prompt.supportedModels.slice(0, 3).map((model) => (
                      <span
                        key={model}
                        className="rounded-md border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-[9px] font-mono text-zinc-300"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{prompt.rating.toFixed(1)}</span>
                  </span>
                  <span>({prompt.salesCount} runs)</span>
                </div>

                <Link
                  href={`/prompts/${prompt.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>Inspect Blueprint</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
