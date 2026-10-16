'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Megaphone,
  Send,
  CornerDownRight,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAuth } from '../../../lib/auth-context';
import { DiscussionItem } from '../../../lib/db/discussions';

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = params?.id as string;
  const { currentUser } = useAuth();

  const [discussion, setDiscussion] = useState<DiscussionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    async function fetchDiscussion() {
      if (!discussionId) return;
      try {
        const res = await fetch(`/api/discussions/${discussionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.discussion) {
            setDiscussion(data.discussion);
          }
        }
      } catch (e) {
        console.error('Failed to load discussion:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDiscussion();
  }, [discussionId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussion || !replyContent.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const authorName = currentUser?.name || 'Verified Developer';
      const authorRole = currentUser?.role || 'buyer';

      const res = await fetch(`/api/discussions/${discussion.id}`, {
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
          setDiscussion((prev) =>
            prev
              ? {
                  ...prev,
                  repliesCount: (prev.repliesCount || 0) + 1,
                  replies: [...(prev.replies || []), data.reply],
                }
              : null
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

  const handleToggleAnswered = async () => {
    if (!discussion) return;
    const newStatus = !discussion.isAnswered;
    try {
      const res = await fetch(`/api/discussions/${discussion.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_answered',
          isAnswered: newStatus,
        }),
      });

      if (res.ok) {
        setDiscussion((prev) => (prev ? { ...prev, isAnswered: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to toggle answered state:', err);
    }
  };

  const getCategoryIcon = (cat?: DiscussionItem['category']) => {
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

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/discussions"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Discussions</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-20 text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-mono">Loading discussion thread...</p>
        </div>
      ) : !discussion ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e14] p-12 text-center space-y-4">
          <MessageSquare className="h-10 w-10 text-zinc-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Discussion Not Found</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            The requested community discussion may have been removed or has an invalid reference ID.
          </p>
          <Link href="/discussions">
            <Button variant="outline" size="sm" className="text-xs mt-2">
              Return to Discussions
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Discussion Thread Container */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e14] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] bg-[#10121a] flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 min-w-0 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] border-zinc-700 text-zinc-400">
                    {discussion.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {discussion.isAnswered ? (
                    <Badge variant="success" size="sm" className="font-mono text-[10px]">
                      ✓ Answered
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm" className="font-mono text-[10px] text-zinc-400">
                      Open Discussion
                    </Badge>
                  )}
                  <span className="text-[11px] font-mono text-zinc-500">{discussion.date}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                  {discussion.title}
                </h1>

                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span>Author:</span>
                  <strong className="text-zinc-200">@{discussion.author}</strong>
                  {discussion.authorRole && (
                    <span className="capitalize text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-sans">
                      {discussion.authorRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAnswered}
                  className="rounded-xl border border-white/[0.1] bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{discussion.isAnswered ? 'Mark Unresolved' : 'Mark Answered'}</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              <div className="rounded-2xl border border-white/[0.08] bg-[#141822] p-5 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {discussion.content || discussion.title}
              </div>

              {/* Replies */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <CornerDownRight className="h-4 w-4 text-blue-400" />
                  <span>Community Replies ({discussion.replies?.length || 0})</span>
                </h3>

                {(!discussion.replies || discussion.replies.length === 0) ? (
                  <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-2">
                    <p className="text-xs text-zinc-400 font-mono">No replies yet on this topic.</p>
                    <p className="text-[11px] text-zinc-500">
                      Share your technical perspective or answer below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussion.replies.map((rep) => (
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

            {/* Reply Composer */}
            <div className="p-5 border-t border-white/[0.08] bg-[#10121a]">
              <form onSubmit={handlePostReply} className="space-y-3">
                <textarea
                  rows={3}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to @${discussion.author} with technical advice, code examples, or feedback...`}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handlePostReply(e);
                    }
                  }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Posting as <strong className="text-zinc-300">@{currentUser?.name || 'Developer'}</strong> • Ctrl+Enter to send
                  </span>

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
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
