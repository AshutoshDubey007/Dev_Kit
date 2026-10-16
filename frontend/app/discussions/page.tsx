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
  Send,
  CornerDownRight,
  Sparkles,
  User,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../lib/auth-context';
import { DiscussionItem, DiscussionReply } from '../../lib/db/discussions';

export default function DiscussionsPage() {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New discussion modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<DiscussionItem['category']>('q_and_a');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active viewing discussion (for click-to-open drawer)
  const [activeDiscussion, setActiveDiscussion] = useState<DiscussionItem | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

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

  // Open discussion and fetch fresh replies if needed
  const handleOpenDiscussion = async (discussion: DiscussionItem) => {
    setActiveDiscussion(discussion);
    try {
      const res = await fetch(`/api/discussions/${discussion.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.discussion) {
          setActiveDiscussion(data.discussion);
          // Sync in list
          setDiscussions((prev) =>
            prev.map((d) => (d.id === data.discussion.id ? data.discussion : d))
          );
        }
      }
    } catch (e) {
      console.warn('Could not refresh discussion replies:', e);
    }
  };

  // Create discussion and immediately open it
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const authorName = currentUser?.name || 'Anonymous Developer';
      const authorRole = currentUser?.role || 'buyer';

      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim() || newTitle.trim(),
          category: newCategory,
          author: authorName,
          authorRole: authorRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.discussion) {
          const created = data.discussion;
          setDiscussions((prev) => [created, ...prev]);
          // Reset create modal
          setNewTitle('');
          setNewContent('');
          setIsCreateModalOpen(false);
          // IMMEDIATELY OPEN the newly created discussion for the user!
          setActiveDiscussion(created);
        }
      }
    } catch (err) {
      console.error('Error creating discussion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply to active discussion
  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDiscussion || !replyContent.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const authorName = currentUser?.name || 'Verified Developer';
      const authorRole = currentUser?.role || 'buyer';

      const res = await fetch(`/api/discussions/${activeDiscussion.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          content: replyContent.trim(),
          author: authorName,
          authorRole: authorRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const updatedDiscussion: DiscussionItem = {
            ...activeDiscussion,
            repliesCount: (activeDiscussion.repliesCount || 0) + 1,
            replies: [...(activeDiscussion.replies || []), data.reply],
          };

          setActiveDiscussion(updatedDiscussion);
          setDiscussions((prev) =>
            prev.map((d) => (d.id === activeDiscussion.id ? updatedDiscussion : d))
          );
          setReplyContent('');
        }
      }
    } catch (err) {
      console.error('Error posting reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Toggle answered status
  const handleToggleAnswered = async () => {
    if (!activeDiscussion) return;
    const newStatus = !activeDiscussion.isAnswered;
    try {
      const res = await fetch(`/api/discussions/${activeDiscussion.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_answered',
          isAnswered: newStatus,
        }),
      });

      if (res.ok) {
        const updated: DiscussionItem = {
          ...activeDiscussion,
          isAnswered: newStatus,
        };
        setActiveDiscussion(updated);
        setDiscussions((prev) =>
          prev.map((d) => (d.id === activeDiscussion.id ? updated : d))
        );
      }
    } catch (err) {
      console.error('Failed to toggle answered state:', err);
    }
  };

  const filteredDiscussions = discussions.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.author.toLowerCase().includes(q) ||
      (d.content && d.content.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryIcon = (cat: DiscussionItem['category']) => {
    switch (cat) {
      case 'q_and_a':
        return <HelpCircle className="h-4 w-4 text-emerald-400" />;
      case 'feature':
        return <Lightbulb className="h-4 w-4 text-amber-400" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-blue-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-indigo-400" />;
    }
  };

  const getCategoryLabel = (cat: DiscussionItem['category']) => {
    switch (cat) {
      case 'q_and_a':
        return 'Q&A Help';
      case 'feature':
        return 'Feature Idea';
      case 'announcement':
        return 'Announcement';
      default:
        return 'Showcase';
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
            Ask technical implementation questions, share building showcases, and request new marketplace integrations. Click any discussion to open and participate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
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
            placeholder="Search discussions by question, author, or keyword..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e14] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'q_and_a', 'feature', 'announcement', 'showcase'].map((cat) => (
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
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="h-8 w-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Loading developer discussions...</p>
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <MessageSquare className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300 font-mono">No discussions match your filter.</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Start the conversation by creating a new discussion above.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs mt-2"
            >
              + Create First Discussion
            </Button>
          </div>
        ) : (
          filteredDiscussions.map((d) => (
            <div
              key={d.id}
              onClick={() => handleOpenDiscussion(d)}
              className="p-5 flex items-start gap-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDiscussion(d);
                }
              }}
            >
              <div className="mt-1 h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:border-blue-500/40 flex items-center justify-center shrink-0 transition-colors">
                {getCategoryIcon(d.category)}
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {d.title}
                  </span>
                  <Badge variant="outline" size="sm" className="font-mono text-[9px] border-zinc-700 text-zinc-400">
                    {getCategoryLabel(d.category)}
                  </Badge>
                  {d.isAnswered && (
                    <Badge variant="success" size="sm" className="font-mono text-[9px] shrink-0">
                      ✓ Answered
                    </Badge>
                  )}
                </div>

                {d.content && (
                  <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                    {d.content}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 pt-0.5">
                  <span className="text-zinc-400">by @{d.author}</span>
                  {d.authorRole && d.authorRole !== 'buyer' && (
                    <span className="capitalize text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-sans">
                      {d.authorRole}
                    </span>
                  )}
                  <span>•</span>
                  <span>{d.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 shrink-0 group-hover:text-zinc-200 transition-colors pl-2">
                <MessageSquare className="h-4 w-4 text-zinc-500 group-hover:text-blue-400" />
                <span className="font-semibold">{d.repliesCount || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Interactive Discussion Detail Slide-Over / Modal ─── */}
      {activeDiscussion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/[0.12] bg-[#0c0e14] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="p-5 border-b border-white/[0.08] bg-[#10121a] flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] border-zinc-700 text-zinc-400">
                    {getCategoryLabel(activeDiscussion.category)}
                  </Badge>
                  {activeDiscussion.isAnswered ? (
                    <Badge variant="success" size="sm" className="font-mono text-[10px]">
                      ✓ Answered
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm" className="font-mono text-[10px] text-zinc-400">
                      Open Discussion
                    </Badge>
                  )}
                  <span className="text-[11px] font-mono text-zinc-500">
                    {activeDiscussion.date}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {activeDiscussion.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span>Started by</span>
                  <strong className="text-zinc-200">@{activeDiscussion.author}</strong>
                  {activeDiscussion.authorRole && (
                    <span className="capitalize text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-sans">
                      {activeDiscussion.authorRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleAnswered}
                  className="rounded-xl border border-white/[0.1] bg-zinc-900 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                  title="Toggle answered status"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {activeDiscussion.isAnswered ? 'Mark Unresolved' : 'Mark Answered'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDiscussion(null)}
                  className="rounded-xl p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  aria-label="Close discussion"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Thread Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Original Post Body */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#141822] p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pb-2 border-b border-white/[0.06]">
                  <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Original Question &amp; Description</span>
                  </span>
                  <span>ID: {activeDiscussion.id}</span>
                </div>
                <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {activeDiscussion.content || activeDiscussion.title}
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <CornerDownRight className="h-4 w-4 text-blue-400" />
                    <span>Community Replies ({activeDiscussion.replies?.length || 0})</span>
                  </h3>
                </div>

                {(!activeDiscussion.replies || activeDiscussion.replies.length === 0) ? (
                  <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-2">
                    <p className="text-xs text-zinc-400 font-mono">No replies yet on this topic.</p>
                    <p className="text-[11px] text-zinc-500">
                      Be the first developer to reply or share a solution below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeDiscussion.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className={`rounded-2xl border p-4 space-y-2 transition-all ${
                          rep.isSolution
                            ? 'border-emerald-500/40 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                            : 'border-white/[0.06] bg-zinc-950/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-200">@{rep.author}</span>
                            {rep.authorRole && (
                              <span className="capitalize text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-sans">
                                {rep.authorRole}
                              </span>
                            )}
                            <span>•</span>
                            <span className="text-zinc-500">{rep.createdAt}</span>
                          </div>

                          {rep.isSolution && (
                            <Badge variant="success" size="sm" className="font-mono text-[9px]">
                              ✓ Marked Solution
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                          {rep.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom / Reply Composer */}
            <div className="p-4 border-t border-white/[0.08] bg-[#10121a]">
              <form onSubmit={handlePostReply} className="space-y-2.5">
                <textarea
                  rows={3}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to @${activeDiscussion.author} with technical advice, code examples, or feedback...`}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handlePostReply(e);
                    }
                  }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                    Posting as <strong className="text-zinc-300">@{currentUser?.name || 'Developer'}</strong> • Ctrl+Enter to send
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSendingReply || !replyContent.trim()}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSendingReply ? 'Posting...' : 'Post Reply'}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Start New Discussion Modal ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/[0.12] bg-[#0c0e14] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Start New Discussion</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Post technical questions, integration discussions, or feature suggestions to the community.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Discussion Title / Question *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to configure Razorpay webhook signatures in Next.js 15?"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141822] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141822] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="q_and_a">Q&amp;A / Technical Implementation Help</option>
                  <option value="feature">Feature Request &amp; Marketplace Ideas</option>
                  <option value="announcement">Official Release &amp; Announcement</option>
                  <option value="showcase">Project Showcase &amp; Reusable Kits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Detailed Explanation / Code Details *
                </label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe your architecture setup, steps to reproduce, error stack trace, or details on what you want to achieve..."
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Posting as <strong className="text-zinc-300">@{currentUser?.name || 'Developer'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting || !newTitle.trim()}
                    className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold shadow-md shadow-emerald-500/20"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish & Open Discussion →'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
