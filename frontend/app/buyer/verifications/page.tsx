'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Download,
  ExternalLink,
  ChevronRight,
  Terminal,
  FileCode,
  Bug,
  RefreshCw,
  Send,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAuth } from '../../../lib/auth-context';

interface ProductVerification {
  verificationId: string;
  orderId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  sellerId: string;
  sellerName?: string;
  sellerEmail?: string;
  purchaseVerifiedAt: string;
  verificationDeadline: string;
  verificationStatus: 'pending' | 'verified_success' | 'issue_reported' | 'expired';
  supportCaseId?: string;
  chatConversationId?: string;
  downloadToken?: string;
  resolvedAt?: string;
}

interface SupportTicket {
  ticketId: string;
  verificationId: string;
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
  createdAt: string;
}

export default function BuyerVerificationDashboard() {
  const { currentUser } = useAuth();
  const [verifications, setVerifications] = useState<ProductVerification[]>([]);
  const [tickets, setTickets] = useState<Record<string, SupportTicket>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Issue modal state
  const [activeModalVerification, setActiveModalVerification] = useState<ProductVerification | null>(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [osName, setOsName] = useState('Windows 11 / Node v20 LTS');
  const [frameworkVersion, setFrameworkVersion] = useState('Next.js 15.1.0 App Router');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Resolution review state
  const [activeResolutionTicket, setActiveResolutionTicket] = useState<SupportTicket | null>(null);

  const activeEmail = currentUser?.email || 'ashutosh@agency.dev';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/verifications?buyerEmail=${encodeURIComponent(activeEmail)}`);
      const data = await res.json();
      if (data.verifications) {
        setVerifications(data.verifications);

        // Fetch tickets for any items with issue_reported or supportCaseId
        const ticketMap: Record<string, SupportTicket> = {};
        for (const v of data.verifications) {
          if (v.supportCaseId) {
            try {
              const tRes = await fetch(`/api/support/tickets/${v.supportCaseId}`);
              const tData = await tRes.json();
              if (tData.ticket) {
                ticketMap[v.verificationId] = tData.ticket;
              }
            } catch (err) {
              console.warn('Failed to load ticket for verification:', v.verificationId);
            }
          }
        }
        setTickets(ticketMap);
      }
    } catch (err) {
      console.error('Failed to load verifications:', err);
      setErrorToast('Could not load product verification records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEmail]);

  // Handle "Product Works" confirmation
  const handleConfirmWorks = async (verificationId: string) => {
    setActionLoading(verificationId);
    setErrorToast(null);
    try {
      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_works',
          verificationId,
          buyerId: activeEmail,
          actorRole: currentUser?.role || 'buyer',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast('Verification completed! Product confirmed as fully working.');
        await loadData();
      } else {
        setErrorToast(data.error || 'Failed to verify product.');
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Error executing verification action.');
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Issue Ticket
  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalVerification) return;

    if (!issueTitle.trim() || issueTitle.trim().length < 5) {
      setErrorToast('Issue title must be at least 5 characters');
      return;
    }
    if (!issueDescription.trim() || issueDescription.trim().length < 10) {
      setErrorToast('Please describe the issue in at least 10 characters');
      return;
    }

    setIsSubmittingTicket(true);
    setErrorToast(null);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: activeModalVerification.verificationId,
          buyerEmail: activeEmail,
          title: issueTitle,
          description: issueDescription,
          errorMessage,
          expectedBehavior,
          actualBehavior,
          reproductionSteps,
          environment: {
            os: osName,
            frameworkVersion,
            runtime: 'Node.js',
            nodeVersion: '20.x',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast(`Support ticket created: ${data.ticket.ticketId}. Seller notified.`);
        setActiveModalVerification(null);
        setIssueTitle('');
        setIssueDescription('');
        setErrorMessage('');
        setExpectedBehavior('');
        setActualBehavior('');
        setReproductionSteps('');
        await loadData();
      } else {
        setErrorToast(data.error || 'Failed to file support ticket');
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Error filing support ticket');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Accept seller resolution
  const handleAcceptResolution = async (ticketId: string) => {
    setActionLoading(`accept_${ticketId}`);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_resolution',
          actorId: activeEmail,
          actorRole: 'buyer',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast('Resolution accepted. Verification completed as successful!');
        setActiveResolutionTicket(null);
        await loadData();
      } else {
        setErrorToast(data.error || 'Failed to confirm resolution');
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Error confirming resolution');
    } finally {
      setActionLoading(null);
    }
  };

  // Format remaining time
  const formatRemainingTime = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) {
      return { text: 'Window Closed', isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { text: `${days}d ${hours}h remaining`, isExpired: false };
    }
    return { text: `${hours}h ${mins}m remaining`, isExpired: false };
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400 font-mono mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DevKit Trust Standard • 7-Day Protection Window</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Product Verification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Every paid kit comes with 7 full days of defect resolution guarantee and direct seller chat assistance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs border-zinc-800 text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/kits">
            <Button variant="secondary" size="sm" className="text-xs">
              Explore More Kits
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successToast && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-rose-400 hover:text-rose-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Verification List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-mono">Loading your purchased kits and verification status...</p>
        </div>
      ) : verifications.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Active Verifications</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            When you purchase verified kits or blueprints, your 7-day testing and support window appears here automatically.
          </p>
          <div className="pt-2">
            <Link href="/kits">
              <Button variant="primary" size="md" className="text-xs">
                Browse Verified Marketplace Kits →
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {verifications.map((v) => {
            const timeInfo = formatRemainingTime(v.verificationDeadline);
            const ticket = tickets[v.verificationId];

            return (
              <div
                key={v.verificationId}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl hover:border-zinc-700/80 transition-all"
              >
                {/* Header Strip */}
                <div className="bg-[#10121a] px-6 py-4 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-zinc-400">
                        {v.orderId}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-400">
                        Purchased {new Date(v.purchaseVerifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {v.productTitle}
                    </h2>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-3">
                    {v.verificationStatus === 'verified_success' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs py-1 px-3">
                        ✓ Verified Working
                      </Badge>
                    ) : v.verificationStatus === 'issue_reported' ? (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs py-1 px-3">
                        ⚠️ Issue Under Review
                      </Badge>
                    ) : v.verificationStatus === 'expired' ? (
                      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs py-1 px-3">
                        Period Concluded
                      </Badge>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 text-xs text-indigo-300 font-mono">
                        <Clock className="h-3 w-3 text-indigo-400 animate-pulse" />
                        <span>{timeInfo.text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Context & Setup */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Seller & Verification Metadata */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[11px]">Seller</span>
                        <span className="text-zinc-200 font-medium block mt-0.5">
                          {v.sellerName || 'DevKit Core Team'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[11px]">7-Day Deadline (UTC)</span>
                        <span className="text-zinc-200 font-mono text-[11px] block mt-0.5">
                          {new Date(v.verificationDeadline).toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[11px]">Verification ID</span>
                        <span className="text-zinc-300 font-mono text-[11px] block mt-0.5 truncate">
                          {v.verificationId}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Setup Guide */}
                    <div className="p-4 rounded-xl bg-[#0e1017] border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Standard Setup Verification Steps:</span>
                        </span>
                        <Link
                          href={`/kits/${v.productSlug}`}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <span>Listing Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/60 font-mono text-[11px] text-zinc-300 space-y-1">
                        <div><span className="text-emerald-400">$</span> tar -xzf package.zip</div>
                        <div><span className="text-emerald-400">$</span> npm install</div>
                        <div><span className="text-emerald-400">$</span> cp .env.example .env.local</div>
                        <div><span className="text-emerald-400">$</span> npm run dev</div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        If npm install fails or dependencies conflict with Next.js 15, report the issue immediately. The 7-day window keeps you protected until resolved.
                      </p>
                    </div>

                    {/* Open Ticket Details Banner if Applicable */}
                    {ticket && (
                      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-200">
                              Linked Support Ticket: {ticket.ticketId}
                            </span>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                            Status: {ticket.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          <strong>{ticket.title}</strong>: {ticket.description}
                        </p>

                        {ticket.proposedResolution && ticket.status === 'resolution_proposed' && (
                          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/40 space-y-2 mt-2">
                            <span className="text-xs font-semibold text-indigo-300 block">
                              💡 Solution Proposed by Seller:
                            </span>
                            <p className="text-xs text-zinc-300 whitespace-pre-wrap">
                              {ticket.proposedResolution.notes}
                            </p>
                            <div className="pt-2 flex items-center gap-3">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAcceptResolution(ticket.ticketId)}
                                disabled={actionLoading === `accept_${ticket.ticketId}`}
                                className="text-xs bg-emerald-600 hover:bg-emerald-500"
                              >
                                {actionLoading === `accept_${ticket.ticketId}`
                                  ? 'Confirming...'
                                  : '✓ Accept Resolution & Complete Verification'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="rounded-xl bg-zinc-900/40 border border-zinc-800 p-4 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                        Verification Actions
                      </span>

                      {/* Download Link */}
                      {v.downloadToken ? (
                        <a
                          href={`/api/download/${v.downloadToken}`}
                          download
                          className="block w-full"
                        >
                          <Button
                            variant="secondary"
                            size="md"
                            className="w-full text-xs justify-start gap-2 border-zinc-700"
                          >
                            <Download className="h-3.5 w-3.5 text-purple-400" />
                            <span>Download Package Source</span>
                          </Button>
                        </a>
                      ) : (
                        <div className="text-[11px] text-zinc-500 p-2 rounded bg-zinc-900">
                          Order reference: {v.orderId}
                        </div>
                      )}

                      {/* Private Chat Thread */}
                      {v.chatConversationId && (
                        <Link href={`/chat/${v.chatConversationId}`} className="block w-full">
                          <Button
                            variant="outline"
                            size="md"
                            className="w-full text-xs justify-start gap-2 border-zinc-700 text-zinc-200 hover:text-white"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Open Dedicated Seller Chat</span>
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Primary Decision Gate */}
                    <div className="pt-4 border-t border-zinc-800 space-y-2.5">
                      {v.verificationStatus === 'verified_success' ? (
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-center space-y-1">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto" />
                          <span className="text-xs font-semibold text-emerald-300 block">
                            Successfully Verified
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            Confirmed on {v.resolvedAt ? new Date(v.resolvedAt).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleConfirmWorks(v.verificationId)}
                            disabled={actionLoading === v.verificationId || v.verificationStatus === 'expired'}
                            className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
                          >
                            {actionLoading === v.verificationId ? (
                              <span>Verifying...</span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Product Works (Confirm)</span>
                              </span>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="md"
                            onClick={() => setActiveModalVerification(v)}
                            disabled={v.verificationStatus === 'expired'}
                            className="w-full text-xs border-amber-600/40 text-amber-400 hover:bg-amber-950/30"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                            <span>Report an Issue & Open Ticket</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Issue Modal */}
      {activeModalVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bug className="h-4 w-4 text-amber-400" />
                  <span>Report Issue for {activeModalVerification.productTitle}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Filing a ticket preserves your 7-day guarantee until the seller solves the issue.
                </p>
              </div>
              <button
                onClick={() => setActiveModalVerification(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Issue Summary / Title *
                </label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Next.js 15 webhook signature mismatch on local environment"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Explain what happened during installation or build execution..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Expected Behavior
                  </label>
                  <input
                    type="text"
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    placeholder="e.g. Order creates without type error"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Actual Behavior
                  </label>
                  <input
                    type="text"
                    value={actualBehavior}
                    onChange={(e) => setActualBehavior(e.target.value)}
                    placeholder="e.g. Webhook returns 400 invalid signature"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Terminal / Runtime Error Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Paste error logs, stack traces, or console warnings..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-rose-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Reproduction Steps
                </label>
                <textarea
                  rows={2}
                  value={reproductionSteps}
                  onChange={(e) => setReproductionSteps(e.target.value)}
                  placeholder="1. Run npm install&#10;2. Add environment variables&#10;3. Trigger webhook"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Operating System & Node Version
                  </label>
                  <input
                    type="text"
                    value={osName}
                    onChange={(e) => setOsName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Framework Version
                  </label>
                  <input
                    type="text"
                    value={frameworkVersion}
                    onChange={(e) => setFrameworkVersion(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setActiveModalVerification(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingTicket}
                  className="text-xs bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20"
                >
                  {isSubmittingTicket ? 'Filing Ticket...' : '🚨 Submit Support Ticket & Alert Seller'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
