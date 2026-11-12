'use client';

import React from 'react';
import { Kit } from '../../types/kit';
import { KitCard } from './kit-card';
import { Button } from '../ui/button';

interface KitGridProps {
  kits: Kit[];
  onSelectTag?: (tag: string) => void;
  selectedTags?: string[];
  onResetFilters?: () => void;
}

export function KitGrid({
  kits,
  onSelectTag,
  selectedTags = [],
  onResetFilters,
}: KitGridProps) {
  if (kits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cc6b35] bg-white py-16 px-6 text-center shadow-[4px_4px_0px_#e8c3a8]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f7ece1] border-2 border-[#cc6b35] text-xl text-[#b8531e] mb-3">
          🔍
        </div>
        <h3 className="text-base font-pixel font-bold text-zinc-950">No integration kits found</h3>
        <p className="mt-1 text-xs text-zinc-600 max-w-sm">
          We couldn't find any kits matching your active search and filter criteria. Try clearing tags or price filters.
        </p>
        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="mt-5 text-xs"
          >
            Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {kits.map((kit) => (
        <KitCard
          key={kit.id}
          kit={kit}
          onSelectTag={onSelectTag}
          selectedTags={selectedTags}
        />
      ))}
    </div>
  );
}
