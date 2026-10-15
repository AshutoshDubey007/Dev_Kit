'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Megaphone,
  Search,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../lib/auth-context';

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
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New discussion modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Discussion['category']>('q_and_a');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDiscussions = async () => {
    try {
      const res = await fetch('/api/discussions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.discussions)) {
          setDiscussions(data.discussions);
        }
      }
    } catch (e) {
      console.error('Failed to load discussions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          author: currentUser?.name || 'Anonymous Developer',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.discussion) {
          setDiscussions((prev) => [data.discussion, ...prev]);
        }
        setNewTitle('');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating discussion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onClick={() => setIsModalOpen(true)}
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
        {filteredDiscussions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm text-zinc-400 font-mono">No discussions match your filter.</p>
            <p className="text-xs text-zinc-500">Start the conversation by creating a new discussion above.</p>
          </div>
        ) : (
          filteredDiscussions.map((d) => (
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
          ))
        )}
      </div>

      {/* New Discussion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0c0e14] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-base font-bold text-white">Start New Discussion</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Discussion Title / Question
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to configure Razorpay webhook signatures in Next.js 15?"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="q_and_a">Q&amp;A / Technical Help</option>
                  <option value="feature">Feature Request</option>
                  <option value="announcement">Announcement</option>
                  <option value="showcase">Project Showcase</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isSubmitting ? 'Posting...' : 'Post Discussion'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
