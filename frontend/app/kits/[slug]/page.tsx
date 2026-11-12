'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { KITS } from '../../../data/kits';
import { getKitBySlug, fetchKitBySlugFromApi } from '../../../lib/kits-store';
import { useAuth } from '../../../lib/auth-context';
import { Kit } from '../../../types/kit';
import { formatPriceINR, formatPriceUSD, formatDate } from '../../../lib/utils';
import { VerificationBadge } from '../../../components/kits/verification-badge';
import { CodePreview } from '../../../components/kits/code-preview';
import { TechStackPills } from '../../../components/kits/tech-stack-pills';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { CheckoutModal } from '../../../components/checkout/checkout-modal';

export default function KitDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { currentUser } = useAuth();

  const [kit, setKit] = useState<Kit | undefined>(() => {
    return getKitBySlug(slug) || KITS.find((k) => k.slug === slug || k.id === slug);
  });
  const [isLoading, setIsLoading] = useState(!kit);

  useEffect(() => {
    let isMounted = true;
    fetchKitBySlugFromApi(slug)
      .then((k) => {
        if (isMounted) {
          if (k) setKit(k);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Track product page view
  useEffect(() => {
    if (slug) {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'page_view',
          entityId: slug,
          path: `/kits/${slug}`,
        }),
      }).catch(() => {});
    }
  }, [slug]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-[#cc6b35] border-t-transparent rounded-full mx-auto" />
        <p className="text-xs font-mono text-zinc-600">Loading verified code package...</p>
      </div>
    );
  }

  if (!kit) {
    return notFound();
  }

  const isAuthor =
    currentUser &&
    (currentUser.email === kit.sellerEmail ||
      (kit.sellerId && currentUser.id === kit.sellerId));

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
        <Link href="/" className="hover:text-zinc-800">
          Home
        </Link>
        <span>/</span>
        <Link href="/kits" className="hover:text-zinc-800">
          Kits
        </Link>
        <span>/</span>
        <Link href={`/categories/${kit.category}`} className="hover:text-zinc-800 capitalize">
          {kit.category}
        </Link>
        <span>/</span>
        <span className="text-zinc-800 truncate">{kit.slug}</span>
      </div>

      {/* Author Indicator Bar */}
      {isAuthor && (
        <div className="rounded-2xl border border-[#cc6b35] bg-[#f7ece1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">👑</span>
            <div>
              <span className="font-bold text-[#b8531e] block">
                You are the author of this repository listing.
              </span>
              <span className="text-zinc-600">
                Buyers who purchase will receive your README and can connect with you via in-app chat.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/seller/my-kits"
              className="rounded-lg border border-orange-200 bg-[#faf5ef] px-3 py-1.5 text-xs text-zinc-950 hover:bg-orange-100 transition-colors font-mono"
            >
              📦 My Repos
            </Link>
            <Link
              href="/seller/new-kit"
              className="rounded-lg bg-[#f7ece1] text-[#b8531e] border border-[#cc6b35] px-3 py-1.5 text-xs hover:bg-[#f7ece1] transition-colors font-mono"
            >
              + List Another
            </Link>
          </div>
        </div>
      )}

      {/* 2. Top Banner Header */}
      <div className="border-b border-orange-200 pb-8">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          {kit.badge && (
            <Badge variant="purple" size="sm">
              {kit.badge}
            </Badge>
          )}
          <Badge variant="secondary" size="sm" className="capitalize">
            {kit.category}
          </Badge>
          <span className="text-xs text-zinc-600 font-mono">
            Updated: {formatDate(kit.lastUpdated)}
          </span>
          <div className="flex items-center gap-1 text-xs text-[#b8531e] font-medium ml-auto">
            <span>★</span>
            <span>{kit.rating.toFixed(1)}</span>
            <span className="text-zinc-600 font-normal">({kit.reviewCount} verified reviews)</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 max-w-4xl">
          {kit.title}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-3xl leading-relaxed">
          {kit.tagline}
        </p>

        <div className="mt-5">
          <TechStackPills stack={kit.techStack} maxDisplay={8} />
        </div>
      </div>

      {/* 3. Main Detail Grid (Left: Code & Audit, Right: Purchase Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 2 Columns: Deep Dive Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Detailed Verification Audit Report */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <span>🧪</span>
              <span>Verification & Audit Report</span>
            </h2>
            <VerificationBadge verification={kit.verification} detailed={true} />
          </section>

          {/* Interactive Code Preview */}
          <section id="code-preview" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <span>💻</span>
                <span>Code Architecture Preview</span>
              </h2>
              <span className="text-xs text-zinc-600 font-mono">
                {kit.codePreviews.length} files previewed
              </span>
            </div>
            <CodePreview snippets={kit.codePreviews} />
          </section>

          {/* Detailed Description */}
          <section className="space-y-4 rounded-2xl border border-orange-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900">About this Integration</h2>
            <div className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line space-y-3">
              {kit.description}
            </div>
          </section>

          {/* Features Included Checklist */}
          <section className="space-y-4 rounded-2xl border border-orange-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900">Production Features Included</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-800">
              {kit.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#b8531e] font-bold shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Licensing and Support Policy */}
          <section className="rounded-2xl border border-orange-200 bg-white p-6 space-y-3 text-xs text-zinc-600">
            <h3 className="font-semibold text-zinc-900 text-sm">Commercial License & Support Policy</h3>
            <p>
              <strong className="text-zinc-800">License:</strong> {kit.license}
            </p>
            <p>
              <strong className="text-zinc-800">Support Boundary:</strong> {kit.supportScope}
            </p>
            <p className="text-[11px] text-zinc-600 pt-2 border-t border-orange-200">
              Note: Support covers code bugs in clean environments via private GitHub issues. It does not include building custom features or telephone/live screen-sharing sessions.
            </p>
          </section>
        </div>

        {/* Right 1 Column: Sticky Buy Box */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-5">
          <div className="relative rounded-2xl border border-orange-200 bg-white p-6 shadow-2xl backdrop-blur-2xl space-y-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div>
              <span className="text-xs font-mono text-zinc-600 block mb-1">
                Commercial License
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-zinc-950">
                  {formatPriceINR(kit.priceINR)}
                </span>
                <span className="text-sm text-zinc-600">
                  ({formatPriceUSD(kit.priceUSD)})
                </span>
              </div>
              <span className="text-[11px] text-[#b8531e] font-medium block mt-1">
                ✓ One-time purchase • Unlimited personal & client projects
              </span>
            </div>

            {/* Buy CTA */}
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full text-sm font-semibold shadow-lg shadow-[#e8c3a8]"
              >
                <span>Buy & Instant Download</span>
                <span>→</span>
              </Button>

              {kit.demoUrl && (
                <a
                  href={kit.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" size="md" className="w-full text-xs">
                    <span>Explore Live Interactive Demo</span>
                    <span>↗</span>
                  </Button>
                </a>
              )}
            </div>

            {/* Deliverables summary */}
            <div className="border-t border-orange-200 pt-4 space-y-2.5 text-xs text-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-[#b8531e]">📦</span>
                <span>Instant .ZIP download + GitHub invite</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b8531e]">🧪</span>
                <span>100% automated test suite included</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b8531e]">📄</span>
                <span>Step-by-step 5-minute setup README</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b8531e]">🔄</span>
                <span>6 months core repo version updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b8531e]">🛡️</span>
                <span>Zero vendor lock-in or telemetry</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="border-t border-orange-200 pt-4 flex items-center justify-between text-[11px] text-zinc-600">
              <span>{kit.salesCount} agencies shipped</span>
              <span className="text-[#b8531e]">★ {kit.rating} / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        kit={kit}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
