'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { getSellerKits, deleteCustomKit } from '../../../lib/kits-store';
import { Kit } from '../../../types/kit';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { formatPriceINR } from '../../../lib/utils';

export default function MyKitsPage() {
  const { currentUser } = useAuth();
  const [kits, setKits] = useState<Kit[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadKits = () => {
    const sellerKits = getSellerKits(currentUser?.email || currentUser?.id);
    setKits(sellerKits);
  };

  useEffect(() => {
    loadKits();
    const handleUpdate = () => loadKits();
    window.addEventListener('devkit_kits_updated', handleUpdate);
    return () => window.removeEventListener('devkit_kits_updated', handleUpdate);
  }, [currentUser]);

  const handleDelete = (kitId: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from the marketplace?`)) {
      deleteCustomKit(kitId);
      loadKits();
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/kits/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const FREE_PROJECTS_LIMIT = 3;
  const totalListed = currentUser?.sellerQuotas?.totalListed ?? kits.length;
  const isSubscribed = currentUser?.sellerQuotas?.isSubscribed ?? false;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-emerald-400 font-mono">
            <span>●</span>
            <span>Seller Creator Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            My Published Repositories & Kits
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Manage your verified listings, inspect GitHub source repositories, and preview how buyers see your code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/kits">
            <Button variant="outline" size="sm" className="text-xs">
              Explore Marketplace Catalog →
            </Button>
          </Link>
          <Link href="/seller/new-kit">
            <Button
              variant="primary"
              size="sm"
              className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold shadow-lg shadow-emerald-500/20"
            >
              + List New Repo / Kit
            </Button>
          </Link>
        </div>
      </div>

      {/* Seller Quota & Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-5 backdrop-blur-xl">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Total Repos Listed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{kits.length}</span>
            <span className="text-xs text-emerald-400 font-mono">active listings</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-5 backdrop-blur-xl">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Free Tier Quota
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {isSubscribed ? '∞' : `${Math.min(kits.length, FREE_PROJECTS_LIMIT)}/${FREE_PROJECTS_LIMIT}`}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {isSubscribed
                ? 'Unlimited Pro'
                : `${Math.max(0, FREE_PROJECTS_LIMIT - kits.length)} slots left`}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-5 backdrop-blur-xl">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Buyer Chat Routing
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-emerald-400">⚡ Active</span>
            <span className="text-xs text-zinc-400 font-mono">Auto-README delivery</span>
          </div>
        </div>
      </div>

      {/* Repositories List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Your Listed Projects</span>
            <Badge variant="secondary" size="sm" className="font-mono text-[11px]">
              {kits.length}
            </Badge>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            Synced with local store &amp; catalog
          </span>
        </div>

        {kits.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#0c0d12]/50 p-12 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-3xl">
              📦
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-semibold text-white">
                No repositories or kits published yet
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your GitHub repository or drop a ZIP template to publish your first verified code kit. The first 3 listings are 100% free!
              </p>
            </div>
            <Link href="/seller/new-kit" className="inline-block pt-2">
              <Button
                variant="primary"
                size="md"
                className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold shadow-lg shadow-emerald-500/20"
              >
                🚀 Publish Your First Repo / Kit
              </Button>
            </Link>
          </div>
        ) : (
          /* Kits List */
          <div className="grid grid-cols-1 gap-4">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-300 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-white hover:text-emerald-400 transition-colors">
                        <Link href={`/kits/${kit.slug}`}>{kit.title}</Link>
                      </span>
                      <Badge variant="success" size="sm" className="font-mono text-[10px]">
                        ● Live on Catalog
                      </Badge>
                      <Badge variant="secondary" size="sm" className="font-mono text-[10px] capitalize">
                        {kit.category}
                      </Badge>
                      {kit.badge && (
                        <Badge variant="purple" size="sm" className="font-mono text-[10px]">
                          {kit.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{kit.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-2 font-mono sm:text-right">
                    <span className="text-lg font-bold text-emerald-400">
                      {formatPriceINR(kit.priceINR)}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      (~${kit.priceUSD})
                    </span>
                  </div>
                </div>

                {/* Source details bar */}
                <div className="rounded-xl bg-zinc-950/80 border border-white/[0.06] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {kit.uploadMethod === 'github' || kit.githubPreviewUrl ? (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-sm">🐙</span>
                        <span className="text-[11px] text-zinc-400 font-mono">GitHub Repo:</span>
                        <a
                          href={kit.githubPreviewUrl || kit.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 underline font-mono text-[11px] hover:text-emerald-300 truncate max-w-xs"
                        >
                          {kit.githubPreviewUrl || kit.githubUrl}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-sm">📁</span>
                        <span className="text-[11px] text-zinc-400 font-mono">ZIP Archive:</span>
                        <span className="text-zinc-200 font-mono text-[11px]">
                          {kit.zipFileName || 'package.zip'} ({kit.zipFileSize || 'Direct upload'})
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-zinc-500 font-mono">
                    Updated: {kit.lastUpdated}
                  </span>
                </div>

                {/* Bottom action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Link href={`/kits/${kit.slug}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        👁 View Public Listing
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(kit.slug)}
                      className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors font-mono"
                    >
                      {copiedSlug === kit.slug ? '✓ Link Copied!' : '🔗 Copy Link'}
                    </button>
                    <Link href="/chat">
                      <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-zinc-200">
                        💬 In-App Support Chat
                      </Button>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(kit.id, kit.title)}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-mono"
                  >
                    Remove Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
