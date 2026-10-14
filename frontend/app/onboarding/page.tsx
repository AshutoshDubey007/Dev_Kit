'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, becomeSeller, switchRole } = useAuth();

  const handleChooseBuyer = () => {
    switchRole('buyer');
    router.push('/kits');
  };

  const handleChooseSeller = () => {
    becomeSeller();
    router.push('/seller/new-kit');
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 space-y-8">
      {/* Welcome Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs text-emerald-300 font-mono">
          <span>✨ Account Created Successfully</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Welcome to DevKit, {currentUser?.name?.split(' ')[0] || 'Developer'}!
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          How would you like to get started today? You can switch roles or do both anytime.
        </p>
      </div>

      {/* Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer Path */}
        <div className="relative group rounded-2xl border border-white/[0.1] bg-[#0c0f17]/90 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/60 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-2xl">
                🛒
              </span>
              <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                Buyer Mode
              </Badge>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                I want to Buy Code Kits
              </h2>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Browse production-ready Next.js 15 integration modules: Razorpay webhook idempotency, enterprise RBAC, and streaming RAG pipelines.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>100% Automated Test Pass Guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Direct Seller Support Chat</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Unrestricted Commercial License</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleChooseBuyer}
              className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 py-2.5"
            >
              Explore Kits &amp; Buy →
            </Button>
          </div>
        </div>

        {/* Seller Path */}
        <div className="relative group rounded-2xl border border-white/[0.1] bg-[#0c0f17]/90 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-blue-500/60 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950/60 border border-blue-800/60 text-2xl">
                👨‍💻
              </span>
              <Badge variant="purple" size="sm" className="font-mono text-[10px]">
                3 Free Listings
              </Badge>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                I want to Sell My Code
              </h2>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Turn your tested Next.js integrations into recurring revenue. Upload your code and setup guide, and earn on every purchase.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span>
                <span>First 3 kit listings are 100% Free</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span>
                <span>Auto-connection to buyers on purchase</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span>
                <span>Automated README delivery in chat</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleChooseSeller}
              className="w-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 py-2.5"
            >
              Open Seller Studio →
            </Button>
          </div>
        </div>
      </div>

      {/* Skip / Neutral Link */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={handleChooseBuyer}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors font-mono"
        >
          Skip for now, take me to home page →
        </button>
      </div>
    </div>
  );
}
