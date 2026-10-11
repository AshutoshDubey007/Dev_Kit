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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 py-16 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-xl text-zinc-400 mb-3">
          🔍
        </div>
        <h3 className="text-base font-semibold text-zinc-200">No integration kits found</h3>
        <p className="mt-1 text-xs text-zinc-400 max-w-sm">
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
