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
        <div className="inline-flex items-center gap-2 rounded-full border border-[#cc6b35] bg-[#f7ece1] px-3.5 py-1 text-xs text-[#b8531e] font-mono">
          <span>✨ Account Created Successfully</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
          Welcome to DevKit, {currentUser?.name?.split(' ')[0] || 'Developer'}!
        </h1>
        <p className="text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
          How would you like to get started today? You can switch roles or do both anytime.
        </p>
      </div>

      {/* Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer Path */}
        <div className="relative group rounded-2xl border border-orange-200 bg-white p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-[#cc6b35] transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ece1] border border-[#cc6b35] text-2xl">
                🛒
              </span>
              <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                Buyer Mode
              </Badge>
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-950 group-hover:text-[#b8531e] transition-colors">
                I want to Buy Code Kits
              </h2>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                Browse production-ready Next.js 15 integration modules: Razorpay webhook idempotency, enterprise RBAC, and streaming RAG pipelines.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-orange-200 text-xs text-zinc-800">
              <li className="flex items-center gap-2">
                <span className="text-[#b8531e]">✓</span>
                <span>100% Automated Test Pass Guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#b8531e]">✓</span>
                <span>Direct Seller Support Chat</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#b8531e]">✓</span>
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
              className="w-full text-xs font-semibold bg-[#b8531e] hover:bg-[#b8531e] text-white shadow-md shadow-[#e8c3a8] py-2.5"
            >
              Explore Kits &amp; Buy →
            </Button>
          </div>
        </div>

        {/* Seller Path */}
        <div className="relative group rounded-2xl border border-orange-200 bg-white p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-[#cc6b35] transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ece1] border border-[#cc6b35] text-2xl">
                👨‍💻
              </span>
              <Badge variant="purple" size="sm" className="font-mono text-[10px]">
                3 Free Listings
              </Badge>
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-950 group-hover:text-[#b8531e] transition-colors">
                I want to Sell My Code
              </h2>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                Turn your tested Next.js integrations into recurring revenue. Upload your code and setup guide, and earn on every purchase.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-orange-200 text-xs text-zinc-800">
              <li className="flex items-center gap-2">
                <span className="text-[#b8531e]">✓</span>
                <span>First 3 kit listings are 100% Free</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#b8531e]">✓</span>
                <span>Auto-connection to buyers on purchase</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#b8531e]">✓</span>
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
              className="w-full text-xs font-semibold bg-[#b8531e] hover:bg-[#964115] text-white border-2 border-[#78330f] shadow-[3px_3px_0px_#e5a982] hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 py-2.5"
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
          className="text-xs text-zinc-600 hover:text-zinc-800 underline underline-offset-4 transition-colors font-mono"
        >
          Skip for now, take me to home page →
        </button>
      </div>
    </div>
  );
}
