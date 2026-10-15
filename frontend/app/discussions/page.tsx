'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Megaphone,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

interface Discussion {
  id: string;
  title: string;
  author: string;
  category: 'q_and_a' | 'feature' | 'announcement' | 'showcase';
  repliesCount: number;
  isAnswered: boolean;
  date: string;
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 'disc-1',
      title: 'How to handle Razorpay webhook signatures in Next.js 15 Route Handlers without raw-body corruption?',
      author: 'alex_dev',
      category: 'q_and_a',
      repliesCount: 8,
      isAnswered: true,
      date: '2 hours ago',
    },
    {
      id: 'disc-2',
      title: 'Best practices for chunking technical PDF docs in RAG vector pipelines with Pinecone',
      author: 'sam_ai',
      category: 'q_and_a',
      repliesCount: 4,
      isAnswered: false,
      date: 'Yesterday',
    },
    {
      id: 'disc-3',
      title: 'DevKit AI Studio v2 released: Multi-file project synthesis with Claude 3.5 Sonnet',
      author: 'devkit-core',
      category: 'announcement',
      repliesCount: 16,
      isAnswered: false,
      date: '3 days ago',
    },
    {
      id: 'disc-4',
      title: 'Feature Request: Add automated GitHub Action CI/CD workflow generator in Prompt Marketplace',
      author: 'cloud_architect',
      category: 'feature',
      repliesCount: 5,
      isAnswered: true,
      date: '5 days ago',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredDiscussions = discussions.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || d.title.toLowerCase().includes(q) || d.author.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryIcon = (cat: Discussion['category']) => {
    switch (cat) {
      case 'q_and_a':
        return <HelpCircle className="h-4 w-4 text-emerald-400" />;
      case 'feature':
        return <Lightbulb className="h-4 w-4 text-amber-400" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-blue-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-blue-400 font-mono">
            <span>●</span>
            <span>Developer Discussions &amp; Support</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Community Discussions
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Ask technical implementation questions, share building showcases, and request new marketplace integrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Discussion</span>
          </Button>
        </div>
      </div>

      {/* ─── Search & Categories ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions by topic or keyword..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e14] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'q_and_a', 'feature', 'announcement'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-2 text-xs font-mono transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'bg-zinc-950 text-zinc-400 border border-white/[0.06] hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Discussions List ─── */}
      <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 shadow-xl overflow-hidden">
        {filteredDiscussions.map((d) => (
          <div
            key={d.id}
            className="p-5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="mt-1 h-8 w-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              {getCategoryIcon(d.category)}
            </div>

            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white hover:text-blue-400 transition-colors cursor-pointer leading-snug">
                  {d.title}
                </span>
                {d.isAnswered && (
                  <Badge variant="success" size="sm" className="font-mono text-[9px] shrink-0">
                    ✓ Answered
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                <span>by @{d.author}</span>
                <span>•</span>
                <span>{d.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
              <span>{d.repliesCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
