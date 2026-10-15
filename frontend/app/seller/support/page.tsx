'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Filter,
  Send,
  X,
  ExternalLink,
  Terminal,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAuth } from '../../../lib/auth-context';

interface SupportTicket {
  ticketId: string;
  verificationId: string;
  orderId: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  sellerId: string;
  sellerEmail?: string;
  sellerName?: string;
  chatConversationId: string;
  title: string;
  description: string;
  errorMessage?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  reproductionSteps?: string;
  environment: {
    os?: string;
    runtime?: string;
    frameworkVersion?: string;
    nodeVersion?: string;
    dependencies?: string;
  };
  status:
    | 'open'
    | 'awaiting_seller'
    | 'awaiting_buyer'
    | 'resolution_proposed'
    | 'resolved'
    | 'closed'
    | 'reopened';
  proposedResolution?: {
    notes: string;
    proposedAt: string;
    proposedBy: string;
  };
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function SellerCustomerSupportPage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Proposal modal state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  const activeEmail = currentUser?.email || 'support@devkit.store';

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/support/tickets?email=${encodeURIComponent(activeEmail)}&role=seller`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to load seller support tickets:', err);
      setToastMsg({ text: 'Error fetching seller support tickets', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeEmail]);

  // Handle Resolution Proposal Submission
  const handleProposeResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!resolutionNotes.trim() || resolutionNotes.trim().length < 5) {
      setToastMsg({ text: 'Please provide at least 5 characters of solution explanation', type: 'error' });
      return;
    }

    setIsSubmittingProposal(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'propose_resolution',
          notes: resolutionNotes,
          actorId: activeEmail,
          actorRole: 'seller',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMsg({ text: 'Resolution proposed! The buyer has been notified.', type: 'success' });
        setSelectedTicket(null);
        setResolutionNotes('');
        await fetchTickets();
      } else {
        setToastMsg({ text: data.error || 'Failed to submit proposal', type: 'error' });
      }
    } catch (err: any) {
      setToastMsg({ text: err.message || 'Error proposing resolution', type: 'error' });
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'open') return t.status === 'open' || t.status === 'reopened';
    if (filterStatus === 'awaiting_seller') return t.status === 'awaiting_seller' || t.status === 'open';
    if (filterStatus === 'awaiting_buyer') return t.status === 'awaiting_buyer';
    if (filterStatus === 'resolution_proposed') return t.status === 'resolution_proposed';
    if (filterStatus === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  // Calculate metrics
  const totalOpen = tickets.filter((t) => ['open', 'reopened', 'awaiting_seller'].includes(t.status)).length;
  const awaitingSeller = tickets.filter((t) => t.status === 'awaiting_seller' || t.status === 'open').length;
  const awaitingBuyer = tickets.filter((t) => t.status === 'awaiting_buyer').length;
  const proposed = tickets.filter((t) => t.status === 'resolution_proposed').length;
  const resolvedCount = tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;

  // Check if overdue (>24h without seller reply)
  const isOverdue = (ticket: SupportTicket) => {
    if (ticket.status !== 'open' && ticket.status !== 'awaiting_seller') return false;
    const diffHours = (Date.now() - new Date(ticket.lastActivityAt || ticket.createdAt).getTime()) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  const overdueCount = tickets.filter(isOverdue).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-900/60 bg-indigo-950/40 px-3 py-1 text-xs text-indigo-400 font-mono mb-2">
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>DevKit Seller Desk • Customer Support & Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage buyer defect reports, reply inside secure chat threads, and propose resolutions during the 7-day guarantee window.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={isLoading}
            className="text-xs border-zinc-800 text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/seller/my-kits">
            <Button variant="secondary" size="sm" className="text-xs">
              ← Return to My Kits
            </Button>
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
            toastMsg.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
              : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <span className="text-[11px] text-zinc-500 font-mono block">TOTAL TICKETS</span>
          <span className="text-xl font-bold text-white mt-1 block">{tickets.length}</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20">
          <span className="text-[11px] text-amber-400 font-mono block">AWAITING SELLER</span>
          <span className="text-xl font-bold text-amber-300 mt-1 block">{awaitingSeller}</span>
        </div>

        <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20">
          <span className="text-[11px] text-rose-400 font-mono block">OVERDUE (&gt;24H)</span>
          <span className="text-xl font-bold text-rose-300 mt-1 block">{overdueCount}</span>
        </div>

        <div className="p-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20">
          <span className="text-[11px] text-indigo-400 font-mono block">AWAITING BUYER</span>
          <span className="text-xl font-bold text-indigo-300 mt-1 block">{awaitingBuyer}</span>
        </div>

        <div className="p-4 rounded-xl border border-purple-900/40 bg-purple-950/20">
          <span className="text-[11px] text-purple-400 font-mono block">PROPOSALS SENT</span>
          <span className="text-xl font-bold text-purple-300 mt-1 block">{proposed}</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20">
          <span className="text-[11px] text-emerald-400 font-mono block">RESOLVED</span>
          <span className="text-xl font-bold text-emerald-300 mt-1 block">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'all'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Tickets ({tickets.length})
        </button>

        <button
          onClick={() => setFilterStatus('awaiting_seller')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'awaiting_seller'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Needs My Response ({awaitingSeller})
        </button>

        <button
          onClick={() => setFilterStatus('awaiting_buyer')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'awaiting_buyer'
              ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Awaiting Buyer ({awaitingBuyer})
        </button>

        <button
          onClick={() => setFilterStatus('resolution_proposed')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'resolution_proposed'
              ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60 font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Resolution Proposed ({proposed})
        </button>

        <button
          onClick={() => setFilterStatus('resolved')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'resolved'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-mono">Loading support tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-white">All Clear! No Tickets In This Queue</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You have no pending support tickets under this status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => {
            const overdue = isOverdue(t);

            return (
              <div
                key={t.ticketId}
                className={`rounded-2xl border bg-zinc-950 p-6 space-y-4 shadow-xl transition-all ${
                  overdue ? 'border-rose-900/80 bg-rose-950/10' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Top strip */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-zinc-400">
                        {t.ticketId}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-300 font-medium">
                        {t.productTitle}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-400 font-mono">
                        {t.orderId}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-white">
                      {t.title}
                    </h2>

                    <div className="text-xs text-zinc-400 flex items-center gap-2 pt-0.5">
                      <span>Buyer: <strong className="text-zinc-200">{t.buyerName}</strong> ({t.buyerEmail})</span>
                      <span>•</span>
                      <span>Filed: {new Date(t.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    {overdue && (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] animate-pulse">
                        ⚠️ Overdue (&gt;24h)
                      </Badge>
                    )}

                    {t.status === 'open' || t.status === 'awaiting_seller' ? (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
                        Action Required
                      </Badge>
                    ) : t.status === 'awaiting_buyer' ? (
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs">
                        Awaiting Buyer
                      </Badge>
                    ) : t.status === 'resolution_proposed' ? (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
                        Proposal Sent
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                        ✓ Resolved
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[11px] font-semibold uppercase">Description</span>
                    <p className="text-zinc-200 mt-1 whitespace-pre-wrap leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {t.errorMessage && (
                    <div>
                      <span className="text-rose-400 block text-[11px] font-semibold uppercase">Error Output</span>
                      <pre className="mt-1 p-2.5 rounded bg-zinc-950 border border-zinc-800 text-rose-300 text-[11px] font-mono overflow-x-auto">
                        {t.errorMessage}
                      </pre>
                    </div>
                  )}

                  {/* Environment spec */}
                  <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-zinc-500">OS:</span>{' '}
                      <span className="text-zinc-300">{t.environment.os}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Runtime:</span>{' '}
                      <span className="text-zinc-300">{t.environment.runtime} ({t.environment.nodeVersion})</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Framework:</span>{' '}
                      <span className="text-zinc-300">{t.environment.frameworkVersion}</span>
                    </div>
                  </div>
                </div>

                {/* Proposed resolution status */}
                {t.proposedResolution && (
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
                    <span className="font-semibold text-purple-300 block">
                      💡 Your Proposed Resolution:
                    </span>
                    <p className="text-zinc-300 whitespace-pre-wrap">
                      {t.proposedResolution.notes}
                    </p>
                    <span className="text-[10px] text-zinc-500 block pt-1">
                      Submitted on {new Date(t.proposedResolution.proposedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    {t.chatConversationId && (
                      <Link href={`/chat/${t.chatConversationId}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Reply in Buyer Chat Thread</span>
                        </Button>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {t.status !== 'resolved' && t.status !== 'closed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(t);
                          setResolutionNotes('');
                        }}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 gap-1.5 shadow-md shadow-indigo-600/20"
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Propose Resolution</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-indigo-400" />
                  <span>Propose Resolution for {selectedTicket.ticketId}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Explain the fix, provide configuration instructions, or code adjustments to solve the issue.
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProposeResolution} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Resolution Instructions / Code Patch *
                </label>
                <textarea
                  rows={5}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. In Next.js 15, update your route handler to await params before accessing params.id. I have verified this solves the issue. Please verify on your side."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-[11px]"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                When you propose this resolution, the ticket status will change to <strong>Resolution Proposed</strong>, the buyer will be alerted by in-app notification, and a summary will be posted to the chat.
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedTicket(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingProposal}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  {isSubmittingProposal ? 'Submitting...' : '💡 Submit Resolution to Buyer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
