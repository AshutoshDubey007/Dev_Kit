import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#070709] text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Value Proposition */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden border border-white/20 shadow-md shadow-indigo-500/20 bg-black">
                <Image
                  src="/logo.png"
                  alt="DevKit Marketplace Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-bold text-zinc-100 text-sm tracking-tight">
                DevKit Marketplace
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              The curated marketplace of verified, drop-in integrations for Next.js developers and software agencies. Tested from clean installs so you can ship without debugging technical debt.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/60 bg-emerald-950/30 px-3 py-1 text-[11px] text-emerald-400 font-mono">
              <span>●</span>
              <span>100% Automated Test Pass Guarantee</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider mb-3">
              Verified Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/payments" className="hover:text-zinc-100 transition-colors">
                  Razorpay & Payments
                </Link>
              </li>
              <li>
                <Link href="/categories/auth" className="hover:text-zinc-100 transition-colors">
                  Authentication & RBAC
                </Link>
              </li>
              <li>
                <Link href="/categories/ai" className="hover:text-zinc-100 transition-colors">
                  RAG & AI Search
                </Link>
              </li>
              <li>
                <Link href="/categories/devops" className="hover:text-zinc-100 transition-colors">
                  Docker & CI/CD Pipelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div>
            <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider mb-3">
              Standards &amp; Terms
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/guarantee" className="hover:text-emerald-400 transition-colors">
                  7-Day Guarantee &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-zinc-100 transition-colors">
                  Verification Audit Standard
                </Link>
              </li>
              <li>
                <Link href="/seller/guidelines" className="hover:text-zinc-100 transition-colors">
                  Seller Quality Guidelines
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-100 transition-colors">
                  Terms &amp; Commercial License
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-zinc-100 transition-colors">
                  Privacy Policy &amp; Data Safety
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-amber-400 hover:text-amber-300 transition-colors">
                  ★ Beta Customer Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} DevKit Store. Built for Next.js & React developers.
          </div>
          <div className="flex items-center gap-4">
            <span>Next.js 15 App Router</span>
            <span>•</span>
            <span>TypeScript Native</span>
            <span>•</span>
            <span>MongoDB Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
