'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Conversation } from '@backend/models/Conversation';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

import { useAuth } from '../../lib/auth-context';

export default function OperatorDashboardPage() {
  const { currentUser, loginAsRole } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [interveneConvId, setInterveneConvId] = useState<string | null>(null);
  const [noticeText, setNoticeText] = useState('');
  const [isPostingNotice, setIsPostingNotice] = useState(false);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/operator/chats?flagged=${flaggedOnly}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load operator conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [flaggedOnly]);

  const handlePostIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interveneConvId || !noticeText.trim()) return;

    setIsPostingNotice(true);
    try {
      const res = await fetch('/api/operator/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: interveneConvId,
          operatorName: 'Senior Safety Operator',
          noticeText: noticeText.trim(),
        }),
      });

      if (res.ok) {
        alert('Official moderator notice posted to conversation!');
        setInterveneConvId(null);
        setNoticeText('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Error posting intervention notice:', err);
    } finally {
      setIsPostingNotice(false);
    }
  };

  const flaggedCount = conversations.filter((c) => c.status === 'flagged').length;

  const isOperatorOrAdmin = currentUser?.role === 'operator' || currentUser?.role === 'admin';

  if (!isOperatorOrAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-2xl bg-amber-950/40 border border-amber-800 text-3xl">
          🛡️
        </div>
        <h1 className="text-2xl font-bold text-white">Operator Clearance Required</h1>
        <p className="text-xs text-zinc-400">
          You are currently signed in as <strong className="text-white capitalize">{currentUser?.name} ({currentUser?.role})</strong>. The moderation desk is restricted to Operators and Administrators.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => loginAsRole('operator')}
            className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-black font-bold"
          >
            🛡️ Switch to Operator Profile
          </Button>
          <Link href="/">
            <Button variant="outline" size="md" className="text-xs">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-xs text-purple-300 font-mono mb-2">
            <span>🛡️ Operator & Moderation Desk</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Buyer-Seller Chat Oversight
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Monitor in-platform buyer-seller communications, inspect flagged contact-leak attempts, and enforce safety policies.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setFlaggedOnly(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              !flaggedOnly ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Conversations
          </button>
          <button
            type="button"
            onClick={() => setFlaggedOnly(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
              flaggedOnly ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>⚠️ Flagged Leaks</span>
            {flaggedCount > 0 && (
              <span className="bg-red-950 border border-red-800 text-[10px] px-1.5 rounded-full">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121319] text-zinc-400 font-mono uppercase text-[11px] border-b border-white/[0.08]">
              <tr>
                <th className="px-5 py-3.5">Kit & Order</th>
                <th className="px-5 py-3.5">Buyer</th>
                <th className="px-5 py-3.5">Seller</th>
                <th className="px-5 py-3.5">Status & Leaks</th>
                <th className="px-5 py-3.5">Last Message</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 font-mono">
                    Loading conversations...
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No conversations found matching criteria.
                  </td>
                </tr>
              ) : (
                conversations.map((conv) => (
                  <tr key={conv.conversationId} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-white block text-sm">
                        {conv.kitTitle}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {conv.orderId}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-zinc-200 block font-medium">{conv.buyerName}</span>
                      <span className="text-zinc-500 text-[11px]">{conv.buyerEmail}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-zinc-200 block font-medium">{conv.sellerName}</span>
                      <span className="text-zinc-500 text-[11px]">{conv.sellerId}</span>
                    </td>
                    <td className="px-5 py-4">
                      {conv.status === 'flagged' ? (
                        <Badge variant="warning" size="sm" className="font-mono text-[10px]">
                          ⚠️ {conv.flaggedCount} Leak Attempts
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm" className="font-mono text-[10px]">
                          Clean Thread
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-zinc-400">
                      {conv.lastMessageSnippet}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Link href={`/chat/${conv.conversationId}`}>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 px-2.5">
                          View Thread
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setInterveneConvId(conv.conversationId)}
                        className="text-[11px] h-7 px-2.5 bg-purple-950/60 border-purple-800/80 text-purple-300 hover:bg-purple-900"
                      >
                        Intervene 🛡️
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operator Intervention Modal */}
      {interveneConvId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-purple-500/40 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🛡️</span>
                <span>Post Operator Moderation Notice</span>
              </h3>
              <button
                type="button"
                onClick={() => setInterveneConvId(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              This message will be injected into conversation <code className="text-purple-300 font-mono">{interveneConvId}</code> with official platform authority.
            </p>

            <form onSubmit={handlePostIntervention} className="space-y-4">
              <textarea
                rows={4}
                required
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="e.g. Official DevKit Security Notice: Off-platform contact sharing is restricted. Please keep technical questions inside this chat to retain buyer dispute guarantees."
                className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/90 p-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 resize-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInterveneConvId(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPostingNotice}
                  className="text-xs bg-purple-600 hover:bg-purple-700"
                >
                  Post Notice to Thread →
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
