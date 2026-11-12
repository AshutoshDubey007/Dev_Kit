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
    <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#cc6b35] bg-white p-5 shadow-[4px_4px_0px_#cc6b35] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8531e] hover:shadow-[6px_6px_0px_#b8531e] overflow-hidden">
      {/* Top Ambient Highlight Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#cc6b35] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top Header: Badge, Category, and Rating */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            {kit.badge && (
              <Badge variant="default" size="sm" className="shadow-sm">
                {kit.badge}
              </Badge>
            )}
            <span className="rounded-md bg-[#faf5ef] border border-orange-300 px-2 py-0.5 text-[11px] font-pixel capitalize text-[#964115]">
              {kit.category}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#b8531e] font-bold font-pixel">
            <span>★</span>
            <span className="text-zinc-950">{kit.rating.toFixed(1)}</span>
            <span className="text-zinc-600 font-normal">({kit.reviewCount})</span>
          </div>
        </div>

        {/* Title and Tagline */}
        <Link href={`/kits/${kit.slug}`} className="block group-hover:text-[#b8531e] transition-colors">
          <h3 className="text-base sm:text-lg font-pixel font-bold tracking-tight text-zinc-950 leading-snug">
            {kit.title}
          </h3>
        </Link>
        <p className="mt-2 text-xs text-zinc-700 line-clamp-2 leading-relaxed">
          {kit.tagline}
        </p>

        {/* Verification Trust Badge */}
        <div className="mt-4">
          <VerificationBadge verification={kit.verification} />
        </div>

        {/* Tech Stack Pills */}
        <div className="mt-4 pt-3 border-t-2 border-orange-100">
          <TechStackPills
            stack={kit.techStack}
            onSelectTag={onSelectTag}
            selectedTags={selectedTags}
          />
        </div>
      </div>

      {/* Footer: Pricing & Action Button */}
      <div className="mt-6 pt-4 border-t-2 border-orange-100 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 font-pixel">
            <span className="text-base font-arcade text-[#b8531e] tracking-tight">
              {formatPriceINR(kit.priceINR)}
            </span>
            <span className="text-[11px] text-zinc-600">
              ({formatPriceUSD(kit.priceUSD)})
            </span>
          </div>
          <span className="text-[10px] text-[#964115] font-pixel font-bold flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#cc6b35]" />
            <span>Instant delivery</span>
          </span>
        </div>

        <Link
          href={`/kits/${kit.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#78330f] bg-[#b8531e] px-3 py-1.5 text-xs font-pixel font-bold text-white transition-all hover:bg-[#964115] shadow-[2px_2px_0px_#e5a982]"
        >
          <span>View Kit</span>
          <span className="transition-transform group-hover:translate-x-0.5 text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}
