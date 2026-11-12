import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="relative z-20 border-t-2 border-[#cc6b35] bg-white text-zinc-700 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Value Proposition */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden border-2 border-[#cc6b35] shadow-[2px_2px_0px_#cc6b35] bg-white">
                <Image
                  src="/logo.png?v=2"
                  alt="DevKit Marketplace Logo"
                  width={36}
                  height={36}
                  unoptimized
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-arcade text-zinc-950 text-xs tracking-tight">
                DevKit Marketplace
              </span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed max-w-sm">
              The curated marketplace of verified, drop-in integrations for Next.js developers and software agencies. Tested from clean installs so you can ship without debugging technical debt.
            </p>
            <div className="inline-flex items-center gap-2 rounded-md border-2 border-[#cc6b35] bg-[#f7ece1] px-3 py-1 text-[11px] text-[#964115] font-pixel font-bold">
              <span className="text-[#cc6b35]">●</span>
              <span>100% Automated Test Pass Guarantee</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-pixel font-bold text-[#b8531e] text-xs uppercase tracking-wider mb-3">
              Verified Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/payments" className="hover:text-[#b8531e] transition-colors font-medium">
                  Razorpay & Payments
                </Link>
              </li>
              <li>
                <Link href="/categories/auth" className="hover:text-[#b8531e] transition-colors font-medium">
                  Authentication & RBAC
                </Link>
              </li>
              <li>
                <Link href="/categories/ai" className="hover:text-[#b8531e] transition-colors font-medium">
                  RAG & AI Search
                </Link>
              </li>
              <li>
                <Link href="/categories/devops" className="hover:text-[#b8531e] transition-colors font-medium">
                  Docker & CI/CD Pipelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div>
            <h4 className="font-pixel font-bold text-[#b8531e] text-xs uppercase tracking-wider mb-3">
              Standards &amp; Terms
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/guarantee" className="hover:text-[#b8531e] transition-colors font-medium">
                  7-Day Guarantee &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-[#b8531e] transition-colors font-medium">
                  Verification Audit Standard
                </Link>
              </li>
              <li>
                <Link href="/seller/guidelines" className="hover:text-[#b8531e] transition-colors font-medium">
                  Seller Quality Guidelines
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#b8531e] transition-colors font-medium">
                  Terms &amp; Commercial License
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#b8531e] transition-colors font-medium">
                  Privacy Policy &amp; Data Safety
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-[#b8531e] font-semibold hover:underline transition-colors">
                  ★ Beta Customer Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-6 border-t-2 border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600 font-pixel">
          <div>
            © {new Date().getFullYear()} DevKit Store. Built for Next.js & React developers.
          </div>
          <div className="flex items-center gap-4 text-[#b8531e]">
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
