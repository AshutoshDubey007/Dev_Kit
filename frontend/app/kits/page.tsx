'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { KITS } from '../../data/kits';
import { CATEGORIES } from '../../data/categories';
import { FilterState, CategorySlug, Kit } from '../../types/kit';
import { filterAndSortKits, getSearchAggregations } from '../../lib/search';
import { getAllKits } from '../../lib/kits-store';
import { KitGrid } from '../../components/kits/kit-grid';
import { FilterSidebar } from '../../components/search/filter-sidebar';
import { SearchBar } from '../../components/search/search-bar';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';

function KitsCatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('cat') as CategorySlug) || 'all';

  const [allKits, setAllKits] = useState<Kit[]>(KITS);

  // Sync client-side custom kits
  useEffect(() => {
    setAllKits(getAllKits());
    const handleUpdate = () => setAllKits(getAllKits());
    window.addEventListener('devkit_kits_updated', handleUpdate);
    return () => window.removeEventListener('devkit_kits_updated', handleUpdate);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    query: initialQuery,
    category: initialCategory,
    techStack: [],
    maxPriceINR: null,
    verifiedOnly: false,
    sortBy: 'popular',
  });

  // Sync if URL query param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setFilters((prev) => ({ ...prev, query: q }));
    }
  }, [searchParams]);

  // Compute filtered kits
  const filteredKits = useMemo(() => {
    return filterAndSortKits(allKits, filters);
  }, [allKits, filters]);

  // Compute facet aggregations based on current search results
  const aggregations = useMemo(() => {
    return getSearchAggregations(filteredKits, CATEGORIES);
  }, [filteredKits]);

  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      techStack: [],
      maxPriceINR: null,
      verifiedOnly: false,
      sortBy: 'popular',
    });
  };

  const handleSelectTag = (tag: string) => {
    const exists = filters.techStack.includes(tag);
    const nextStack = exists
      ? filters.techStack.filter((t) => t !== tag)
      : [...filters.techStack, tag];
    setFilters((prev) => ({ ...prev, techStack: nextStack }));
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="border-b border-white/[0.06] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-indigo-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verified Integration Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Explore Verified Kits
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Search, filter by architecture and technology, and inspect test audits for battle-tested Next.js building blocks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/seller/my-kits"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <span>📦 My Published Repos</span>
          </Link>
          <Link
            href="/seller/new-kit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <span>+ List Kit</span>
          </Link>
        </div>
      </div>

      {/* Main Browse Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Faceted Filter Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            aggregations={aggregations}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Column: Search bar + Active Tags + Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Instant Search Bar */}
          <div className="p-1 rounded-2xl border border-white/[0.08] bg-[#0c0d12]/70 shadow-lg backdrop-blur-md">
            <SearchBar
              value={filters.query}
              onChange={(q) => setFilters((prev) => ({ ...prev, query: q }))}
              placeholder="Search by keywords, framework, feature (e.g. Razorpay, Webhook, Auth)..."
            />
          </div>

          {/* Active Filter Chips Bar */}
          {(filters.techStack.length > 0 ||
            filters.category !== 'all' ||
            filters.maxPriceINR !== null ||
            filters.verifiedOnly ||
            filters.query) && (
            <div className="flex flex-wrap items-center gap-2 text-xs p-3 rounded-xl border border-white/[0.06] bg-zinc-950/40">
              <span className="text-zinc-500 font-mono text-[11px]">Active Filters:</span>

              {filters.query && (
                <Badge variant="secondary" size="sm" className="gap-1.5 font-mono text-[11px]">
                  <span>Query: "{filters.query}"</span>
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, query: '' }))}
                    className="hover:text-white"
                  >
                    ✕
                  </button>
                </Badge>
              )}

              {filters.category !== 'all' && (
                <Badge variant="purple" size="sm" className="gap-1.5 capitalize text-[11px]">
                  <span>{filters.category}</span>
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
                    className="hover:text-white"
                  >
                    ✕
                  </button>
                </Badge>
              )}

              {filters.techStack.map((tech) => (
                <Badge key={tech} variant="default" size="sm" className="gap-1.5 font-mono text-[11px]">
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectTag(tech)}
                    className="hover:text-white"
                  >
                    ✕
                  </button>
                </Badge>
              ))}

              {filters.maxPriceINR !== null && (
                <Badge variant="secondary" size="sm" className="gap-1.5 text-[11px]">
                  <span>≤ ₹{filters.maxPriceINR}</span>
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, maxPriceINR: null }))}
                    className="hover:text-white"
                  >
                    ✕
                  </button>
                </Badge>
              )}

              {filters.verifiedOnly && (
                <Badge variant="success" size="sm" className="gap-1.5 text-[11px]">
                  <span>100% Tested Only</span>
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, verifiedOnly: false }))}
                    className="hover:text-white"
                  >
                    ✕
                  </button>
                </Badge>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 ml-auto font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Grid */}
          <KitGrid
            kits={filteredKits}
            onSelectTag={handleSelectTag}
            selectedTags={filters.techStack}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
}

export default function KitsCatalogPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-zinc-500 font-mono">Loading catalog...</div>}>
      <KitsCatalogContent />
    </Suspense>
  );
}
