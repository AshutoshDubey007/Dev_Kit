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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cc6b35] bg-[#f7ece1] px-3 py-1 text-xs text-[#b8531e] font-mono mb-2">
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>DevKit Seller Desk • Customer Support & Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Customer Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Manage buyer defect reports, reply inside secure chat threads, and propose resolutions during the 7-day guarantee window.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={isLoading}
            className="text-xs border-orange-200 text-zinc-800 hover:text-zinc-950"
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
              ? 'border-[#cc6b35] bg-[#f7ece1] text-[#b8531e]'
              : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b8531e]" />
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
        <div className="p-4 rounded-xl border border-orange-200 bg-white">
          <span className="text-[11px] text-zinc-600 font-mono block">TOTAL TICKETS</span>
          <span className="text-xl font-bold text-zinc-950 mt-1 block">{tickets.length}</span>
        </div>

        <div className="p-4 rounded-xl border border-[#cc6b35] bg-[#f7ece1]">
          <span className="text-[11px] text-[#b8531e] font-mono block">AWAITING SELLER</span>
          <span className="text-xl font-bold text-[#b8531e] mt-1 block">{awaitingSeller}</span>
        </div>

        <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20">
          <span className="text-[11px] text-rose-400 font-mono block">OVERDUE (&gt;24H)</span>
          <span className="text-xl font-bold text-rose-300 mt-1 block">{overdueCount}</span>
        </div>

        <div className="p-4 rounded-xl border border-[#cc6b35] bg-[#f7ece1]">
          <span className="text-[11px] text-[#b8531e] font-mono block">AWAITING BUYER</span>
          <span className="text-xl font-bold text-[#b8531e] mt-1 block">{awaitingBuyer}</span>
        </div>

        <div className="p-4 rounded-xl border border-[#cc6b35] bg-[#f7ece1]">
          <span className="text-[11px] text-[#b8531e] font-mono block">PROPOSALS SENT</span>
          <span className="text-xl font-bold text-[#b8531e] mt-1 block">{proposed}</span>
        </div>

        <div className="p-4 rounded-xl border border-[#cc6b35] bg-[#f7ece1]">
          <span className="text-[11px] text-[#b8531e] font-mono block">RESOLVED</span>
          <span className="text-xl font-bold text-[#b8531e] mt-1 block">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-orange-200 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'all'
              ? 'bg-orange-100 text-zinc-950 font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          All Tickets ({tickets.length})
        </button>

        <button
          onClick={() => setFilterStatus('awaiting_seller')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'awaiting_seller'
              ? 'bg-[#f7ece1] text-[#b8531e] border border-[#cc6b35] font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          Needs My Response ({awaitingSeller})
        </button>

        <button
          onClick={() => setFilterStatus('awaiting_buyer')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'awaiting_buyer'
              ? 'bg-[#f7ece1] text-[#b8531e] border border-[#cc6b35] font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          Awaiting Buyer ({awaitingBuyer})
        </button>

        <button
          onClick={() => setFilterStatus('resolution_proposed')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'resolution_proposed'
              ? 'bg-[#f7ece1] text-[#b8531e] border border-[#cc6b35] font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          Resolution Proposed ({proposed})
        </button>

        <button
          onClick={() => setFilterStatus('resolved')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'resolved'
              ? 'bg-[#f7ece1] text-[#b8531e] border border-[#cc6b35] font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-[#cc6b35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-600 font-mono">Loading support tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-2xl border border-orange-200 bg-white p-12 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-zinc-950">All Clear! No Tickets In This Queue</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto">
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
                className={`rounded-2xl border bg-white p-6 space-y-4 shadow-xl transition-all ${
                  overdue ? 'border-rose-900/80 bg-rose-950/10' : 'border-orange-200 hover:border-orange-200'
                }`}
              >
                {/* Top strip */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-zinc-600">
                        {t.ticketId}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-800 font-medium">
                        {t.productTitle}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-600 font-mono">
                        {t.orderId}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-zinc-950">
                      {t.title}
                    </h2>

                    <div className="text-xs text-zinc-600 flex items-center gap-2 pt-0.5">
                      <span>Buyer: <strong className="text-zinc-900">{t.buyerName}</strong> ({t.buyerEmail})</span>
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
                      <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-xs">
                        Action Required
                      </Badge>
                    ) : t.status === 'awaiting_buyer' ? (
                      <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-xs">
                        Awaiting Buyer
                      </Badge>
                    ) : t.status === 'resolution_proposed' ? (
                      <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-xs">
                        Proposal Sent
                      </Badge>
                    ) : (
                      <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-xs">
                        ✓ Resolved
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="rounded-xl bg-[#faf5ef] border border-orange-200 p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-600 block text-[11px] font-semibold uppercase">Description</span>
                    <p className="text-zinc-900 mt-1 whitespace-pre-wrap leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {t.errorMessage && (
                    <div>
                      <span className="text-rose-400 block text-[11px] font-semibold uppercase">Error Output</span>
                      <pre className="mt-1 p-2.5 rounded bg-white border border-orange-200 text-rose-300 text-[11px] font-mono overflow-x-auto">
                        {t.errorMessage}
                      </pre>
                    </div>
                  )}

                  {/* Environment spec */}
                  <div className="pt-2 border-t border-orange-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-zinc-600">OS:</span>{' '}
                      <span className="text-zinc-800">{t.environment.os}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">Runtime:</span>{' '}
                      <span className="text-zinc-800">{t.environment.runtime} ({t.environment.nodeVersion})</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">Framework:</span>{' '}
                      <span className="text-zinc-800">{t.environment.frameworkVersion}</span>
                    </div>
                  </div>
                </div>

                {/* Proposed resolution status */}
                {t.proposedResolution && (
                  <div className="p-3 rounded-xl bg-[#f7ece1] border border-[#cc6b35] text-xs space-y-1">
                    <span className="font-semibold text-[#b8531e] block">
                      💡 Your Proposed Resolution:
                    </span>
                    <p className="text-zinc-800 whitespace-pre-wrap">
                      {t.proposedResolution.notes}
                    </p>
                    <span className="text-[10px] text-zinc-600 block pt-1">
                      Submitted on {new Date(t.proposedResolution.proposedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-orange-200">
                  <div className="flex items-center gap-2">
                    {t.chatConversationId && (
                      <Link href={`/chat/${t.chatConversationId}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#b8531e]" />
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
                        className="text-xs bg-[#b8531e] hover:bg-[#b8531e] gap-1.5 shadow-md shadow-[#e8c3a8]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-orange-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-orange-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[#b8531e]" />
                  <span>Propose Resolution for {selectedTicket.ticketId}</span>
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Explain the fix, provide configuration instructions, or code adjustments to solve the issue.
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-zinc-600 hover:text-zinc-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProposeResolution} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-800 block mb-1">
                  Resolution Instructions / Code Patch *
                </label>
                <textarea
                  rows={5}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. In Next.js 15, update your route handler to await params before accessing params.id. I have verified this solves the issue. Please verify on your side."
                  className="w-full rounded-xl border border-orange-200 bg-white p-3 text-xs text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#cc6b35] resize-y font-mono text-[11px]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#faf5ef] border border-orange-200 text-[11px] text-zinc-600 leading-relaxed">
                When you propose this resolution, the ticket status will change to <strong>Resolution Proposed</strong>, the buyer will be alerted by in-app notification, and a summary will be posted to the chat.
              </div>

              <div className="pt-3 border-t border-orange-200 flex items-center justify-end gap-3">
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
                  className="text-xs bg-[#b8531e] hover:bg-[#b8531e] shadow-md shadow-[#e8c3a8]"
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
