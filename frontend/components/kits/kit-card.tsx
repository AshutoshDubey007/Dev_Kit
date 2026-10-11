'use client';

import React from 'react';
import Link from 'next/link';
import { Kit } from '../../types/kit';
import { formatPriceINR, formatPriceUSD } from '../../lib/utils';
import { VerificationBadge } from './verification-badge';
import { TechStackPills } from './tech-stack-pills';
import { Badge } from '../ui/badge';

interface KitCardProps {
  kit: Kit;
  onSelectTag?: (tag: string) => void;
  selectedTags?: string[];
}

export function KitCard({ kit, onSelectTag, selectedTags }: KitCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden">
      {/* Top Ambient Highlight Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top Header: Badge, Category, and Rating */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            {kit.badge && (
              <Badge variant="purple" size="sm" className="font-medium shadow-sm">
                {kit.badge}
              </Badge>
            )}
            <span className="rounded-full bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-[11px] font-mono capitalize text-zinc-400">
              {kit.category}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-amber-400/90 font-medium font-mono">
            <span>★</span>
            <span className="text-zinc-200">{kit.rating.toFixed(1)}</span>
            <span className="text-zinc-500 font-normal">({kit.reviewCount})</span>
          </div>
        </div>

        {/* Title and Tagline */}
        <Link href={`/kits/${kit.slug}`} className="block group-hover:text-indigo-300 transition-colors">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
            {kit.title}
          </h3>
        </Link>
        <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {kit.tagline}
        </p>

        {/* Verification Trust Badge */}
        <div className="mt-4">
          <VerificationBadge verification={kit.verification} />
        </div>

        {/* Tech Stack Pills */}
        <div className="mt-4 pt-3 border-t border-white/[0.05]">
          <TechStackPills
            stack={kit.techStack}
            onSelectTag={onSelectTag}
            selectedTags={selectedTags}
          />
        </div>
      </div>

      {/* Footer: Pricing & Action Button */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-lg font-bold text-white tracking-tight">
              {formatPriceINR(kit.priceINR)}
            </span>
            <span className="text-[11px] text-zinc-500">
              ({formatPriceUSD(kit.priceUSD)})
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span>Instant delivery</span>
          </span>
        </div>

        <Link
          href={`/kits/${kit.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-all hover:bg-indigo-600 hover:border-indigo-600 hover:text-white shadow-sm"
        >
          <span>View Kit</span>
          <span className="transition-transform group-hover:translate-x-0.5 text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}
