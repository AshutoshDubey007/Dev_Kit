'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const orderId = searchParams.get('orderId');
  const email = searchParams.get('email');
  const convId = searchParams.get('convId');

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      {/* Success Badge & Confirmation */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7ece1] border border-[#cc6b35] text-3xl text-[#b8531e]">
          ✓
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
          Payment Verified!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600">
          Thank you for your purchase. Your code package has been unlocked and verified.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="rounded-2xl border border-orange-200 bg-white p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-orange-200 pb-4 text-xs font-mono">
          <span className="text-zinc-600">Order Reference</span>
          <span className="font-bold text-zinc-900">{orderId || 'ORD-VERIFIED'}</span>
        </div>

        {email && (
          <div className="flex items-center justify-between border-b border-orange-200 pb-4 text-xs">
            <span className="text-zinc-600">Delivered To</span>
            <span className="text-zinc-800 font-mono">{email}</span>
          </div>
        )}

        {/* Download Action */}
        <div className="pt-2 space-y-3">
          {token ? (
            <a
              href={`/api/download/${token}`}
              download
              className="block w-full"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-semibold shadow-lg shadow-[#e8c3a8]"
              >
                <span>📦 Download Code Package (.ZIP / Source)</span>
              </Button>
            </a>
          ) : (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs text-center">
              Missing download token. Please check your confirmation email.
            </div>
          )}

          {/* Connected Seller Chat Box Action */}
          {convId && (
            <div className="rounded-xl border border-[#cc6b35] bg-[#f7ece1] p-4 space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#b8531e] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#cc6b35] animate-pulse" />
                  <span>Connected to Seller</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-600">In-App Chat</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The seller has shared the initial setup README and quickstart guide in your private chat.
              </p>
              <Link href={`/chat/${convId}`} className="block pt-1">
                <Button variant="secondary" size="md" className="w-full text-xs font-medium">
                  💬 Open Chat with Seller & View Guide →
                </Button>
              </Link>
            </div>
          )}

          {/* 7-Day Product Verification Callout */}
          <div className="rounded-xl border border-[#cc6b35] bg-[#f7ece1] p-4 space-y-2.5 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#b8531e] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#cc6b35]" />
                <span>7-Day Product Verification Active</span>
              </span>
              <span className="text-[10px] font-mono text-[#b8531e]/80">Guaranteed</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Test your kit in your environment. If anything fails, file a ticket or confirm verification in your dashboard.
            </p>
            <Link href="/buyer/verifications" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs font-medium border-[#cc6b35] text-[#b8531e] hover:bg-[#f7ece1]">
                🛡️ Open Product Verification Dashboard →
              </Button>
            </Link>
          </div>

          <p className="text-[11px] text-zinc-600 text-center">
            Valid for 7 days • Maximum 10 downloads per purchase token
          </p>
        </div>

        {/* Quick Setup Instructions */}
        <div className="mt-6 pt-5 border-t border-orange-200 space-y-3 text-xs text-zinc-800">
          <span className="font-semibold text-zinc-900 block">
            Next Steps (3-Minute Setup):
          </span>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 text-xs">
            <li>Extract the downloaded archive into your local project directory.</li>
            <li>Review the verified architecture notes and required dependencies.</li>
            <li>Add your API keys to <code className="text-zinc-900 font-mono">.env.local</code>.</li>
            <li>Run <code className="text-zinc-900 font-mono">npm run dev</code> to verify integration.</li>
          </ol>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/kits">
          <Button variant="outline" size="sm" className="text-xs">
            ← Return to Marketplace Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-zinc-600">Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
