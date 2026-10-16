import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  FileCode,
  DollarSign,
  LifeBuoy,
  Lock,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export default function SellerGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 pb-20">
      <div>
        <Link
          href="/seller/new-kit"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Seller Creator Studio</span>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm">
            Seller Quality Standard
          </Badge>
          <span className="text-xs text-zinc-500 font-mono">Last updated: October 16, 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Seller Guidelines &amp; Quality Checklist
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          DevKit is not an uncurated dumping ground. We only feature battle-tested, high-utility code modules that solve difficult implementation challenges for developers.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
        {/* Quality Checklist */}
        <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>The 8-Point Product Submission Checklist</span>
          </h2>
          <p className="text-zinc-400">
            Before listing your kit or repository, ensure every point in this checklist is verified:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">1. Clear Target Problem</strong>
              <p className="text-zinc-400 text-xs">
                The product solves a specific engineering pain point (e.g. Razorpay webhook idempotency, multi-tenant RBAC, vector RAG search).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">2. Modern Tech Stack</strong>
              <p className="text-zinc-400 text-xs">
                Built for Next.js 15 App Router, React 19, and TypeScript 5+ with zero peer-dependency warnings.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">3. Step-by-Step Setup Guide</strong>
              <p className="text-zinc-400 text-xs">
                README contains exact commands (`npm install`, `npm run dev`) and complete setup instructions under 10 minutes.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">4. Documented .env.example</strong>
              <p className="text-zinc-400 text-xs">
                All required environment variables are listed with dummy placeholders. Never include real API secrets or test keys.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">5. Automated Test Suite</strong>
              <p className="text-zinc-400 text-xs">
                Must include unit or integration tests covering key logic and error handling (`npm test` passes 100%).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">6. Disclosed Known Limitations</strong>
              <p className="text-zinc-400 text-xs">
                List requirements (e.g., local ngrok tunnel needed for webhooks, specific Atlas replica set required).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">7. Zero Malware or Telemetry</strong>
              <p className="text-zinc-400 text-xs">
                No obfuscated binaries, hidden tracking pings, crypto miners, or license phone-home scripts.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1">
              <strong className="text-white text-xs block">8. Clean-Environment Verification</strong>
              <p className="text-zinc-400 text-xs">
                Tested from a fresh git clone / clean directory with no pre-existing node_modules or global state.
              </p>
            </div>
          </div>
        </section>

        {/* Support SLA */}
        <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-indigo-400" />
            <span>Seller Support Obligations &amp; 48-Hour SLA</span>
          </h2>
          <p className="text-zinc-400">
            When a buyer purchases your code kit, DevKit automatically opens a private support chat thread. As a verified seller, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>Acknowledge and respond to buyer inquiries regarding product setup within 48 hours.</li>
            <li>Investigate reproducible bugs and provide code fixes or patches directly through chat.</li>
            <li>Maintain professional, respectful communication in the in-app chat channel.</li>
          </ul>
        </section>

        {/* Pricing & Fees */}
        <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <span>Pricing &amp; Payout Terms</span>
          </h2>
          <p className="text-zinc-400">
            Sellers set their own price in Indian Rupees (₹INR). DevKit provides:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>
              <strong>First 3 Listings 100% Free:</strong> No listing fee or upfront charge for your first 3 code kits.
            </li>
            <li>
              <strong>Pro Seller Pass:</strong> For unlimited listings beyond 3, sellers can unlock the Seller Pro Pass (₹99/month).
            </li>
            <li>
              <strong>Direct Payouts:</strong> Earnings are settled directly to your registered UPI ID or Bank Account following completion of the 7-day buyer verification window.
            </li>
          </ul>
        </section>

        <div className="text-center pt-4">
          <Link href="/seller/new-kit">
            <Button variant="primary" size="lg" className="text-xs font-semibold">
              <span>List Your Verified Code Kit Now</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
