'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

export default function NewKitPage() {
  const { currentUser, becomeSeller } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === 'buyer') {
      becomeSeller();
    }
  }, [currentUser, becomeSeller]);

  // Seller project counter (Simulated: default 2 projects uploaded)
  const [totalListed, setTotalListed] = useState(
    currentUser?.sellerQuotas?.totalListed ?? 2
  );
  const [isSubscribed, setIsSubscribed] = useState(
    currentUser?.sellerQuotas?.isSubscribed ?? false
  );

  // Form fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('payments');
  const [priceINR, setPriceINR] = useState(1499);
  const [readmeContent, setReadmeContent] = useState(
    `### Step-by-Step Installation Instructions
1. Download package and unzip.
2. Run: npm install
3. Configure .env.local with credentials.
4. Run: npm run dev`
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Rule: First 3 projects are 100% Free. Project 4+ requires ₹99/mo subscription.
  const FREE_PROJECTS_LIMIT = 3;
  const isFreeTierAvailable = totalListed < FREE_PROJECTS_LIMIT;
  const requiresSubscription = !isFreeTierAvailable && !isSubscribed;

  const handlePurchaseSubscription = () => {
    alert('Simulating Razorpay ₹99 Seller Pro Pass payment...');
    setIsSubscribed(true);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresSubscription) return;

    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setTotalListed((prev) => prev + 1);
      setPublishedSuccess(true);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-2 mb-2 text-xs text-emerald-400 font-mono">
          <span>●</span>
          <span>Seller Creator Studio</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          List a Verified Integration Kit
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Provide your production code and step-by-step setup README. Once a buyer purchases, your README is automatically injected into their private chat thread.
        </p>
      </div>

      {/* Seller Listing Quota Bar */}
      <div className="rounded-2xl border border-white/[0.1] bg-[#0c0d12]/90 p-5 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Your Listing Quota:</span>
            <Badge
              variant={isFreeTierAvailable ? 'success' : isSubscribed ? 'purple' : 'warning'}
              size="sm"
              className="font-mono text-[10px]"
            >
              {isSubscribed
                ? '⚡ Unlimited Seller Pro Pass Active'
                : `${totalListed} of ${FREE_PROJECTS_LIMIT} Free Projects Listed`}
            </Badge>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {FREE_PROJECTS_LIMIT - totalListed > 0
              ? `${FREE_PROJECTS_LIMIT - totalListed} free slots remaining`
              : 'Free slots used'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.06]">
          <div
            className={`h-full transition-all duration-500 ${
              isSubscribed
                ? 'bg-purple-500 w-full'
                : totalListed >= FREE_PROJECTS_LIMIT
                ? 'bg-amber-500 w-full'
                : 'bg-emerald-500'
            }`}
            style={{
              width: isSubscribed ? '100%' : `${(totalListed / FREE_PROJECTS_LIMIT) * 100}%`,
            }}
          />
        </div>

        <p className="text-[11px] text-zinc-400">
          💡 <strong>Policy:</strong> Every creator gets their first <strong>3 integration kits 100% Free</strong>. After 3 projects, a micro-pass of <strong>₹50–₹100/mo</strong> is required to maintain quality and prevent duplicate listings.
        </p>
      </div>

      {/* Subscription Paywall Barrier (If 3 free kits used) */}
      {requiresSubscription && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-zinc-950 p-6 space-y-4 text-center shadow-xl">
          <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-2xl text-amber-400">
            ⭐
          </div>
          <h2 className="text-xl font-bold text-white">
            Free Listing Limit Reached (3 of 3 used)
          </h2>
          <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
            You've published your 3 free starter projects! To publish this 4th kit, unlock the <strong>Seller Pro Pass</strong> for just ₹99/month.
          </p>

          <div className="inline-flex items-baseline gap-1 text-2xl font-extrabold text-white font-mono">
            <span>₹99</span>
            <span className="text-xs text-zinc-400 font-normal">/ month</span>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePurchaseSubscription}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20"
            >
              Unlock Seller Pass (₹99 via Razorpay) →
            </Button>
          </div>
        </div>
      )}

      {/* Publish Form */}
      <form onSubmit={handlePublish} className="space-y-6">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/70 p-6 space-y-5">
          <h3 className="text-sm font-bold text-white">Kit Details</h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Integration Kit Title
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 15 Cashfree Gateway Integration"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              One-Line Value Tagline
            </label>
            <Input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Drop-in Cashfree payments with webhook signature checks"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="payments">Payments & Billing</option>
                <option value="auth">Auth & RBAC</option>
                <option value="ai">AI & Vector Search</option>
                <option value="devops">DevOps & Deploy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Price (INR)
              </label>
              <Input
                type="number"
                required
                value={priceINR}
                onChange={(e) => setPriceINR(Number(e.target.value))}
                min={499}
                max={9999}
              />
            </div>
          </div>

          {/* Seller Setup README */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-300">
                Setup README.md (Auto-injected into Buyer Chat)
              </label>
              <span className="text-[11px] text-indigo-400 font-mono">
                ⚡ Dispatched on purchase
              </span>
            </div>
            <textarea
              rows={6}
              required
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
            <span className="text-[11px] text-zinc-500 block mt-1">
              Provide exact installation commands, environment variable names, and common gotchas so buyers can integrate in under 5 minutes.
            </span>
          </div>
        </div>

        {publishedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
            <span>✓ Kit published successfully! Your setup README will be auto-delivered to buyers.</span>
            <Link href="/kits" className="underline font-mono">
              View in Catalog →
            </Link>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={requiresSubscription || isPublishing}
          isLoading={isPublishing}
          className="w-full text-xs font-semibold shadow-lg shadow-indigo-600/20"
        >
          {requiresSubscription
            ? 'Purchase ₹99 Seller Pass to Publish'
            : isFreeTierAvailable
            ? `Publish Kit for Free (Slot ${totalListed + 1} of 3)`
            : 'Publish Kit with Active Pro Pass →'}
        </Button>
      </form>
    </div>
  );
}
