'use client';

import React from 'react';
import { FilterState, SearchAggregations, SortOption, CategorySlug } from '../../types/kit';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  aggregations: SearchAggregations;
  onReset: () => void;
  className?: string;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  aggregations,
  onReset,
  className = '',
}: FilterSidebarProps) {
  const handleCategorySelect = (slug: CategorySlug | 'all') => {
    onFilterChange({ ...filters, category: slug });
  };

  const handleTechToggle = (tech: string) => {
    const exists = filters.techStack.includes(tech);
    const nextStack = exists
      ? filters.techStack.filter((t) => t !== tech)
      : [...filters.techStack, tech];
    onFilterChange({ ...filters, techStack: nextStack });
  };

  const handlePriceChange = (maxPrice: number | null) => {
    onFilterChange({ ...filters, maxPriceINR: maxPrice });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as SortOption });
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.techStack.length > 0 ||
    filters.maxPriceINR !== null ||
    filters.verifiedOnly ||
    filters.query !== '';

  return (
    <aside
      className={`flex flex-col gap-6 rounded-2xl border border-white/[0.08] bg-[#0c0d12]/85 p-5 backdrop-blur-xl shadow-xl ${className}`}
    >
      {/* Header with Reset */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">Filters</span>
          {aggregations.totalResults > 0 && (
            <Badge size="sm" variant="secondary" className="font-mono text-[10px]">
              {aggregations.totalResults} kits
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Sort Option */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Recently Verified</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* 2. Verification Strictness Toggle */}
      <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-emerald-300">
              Verified 100% Pass Only
            </span>
            <span className="text-[11px] text-zinc-400">
              Clean install + 100% test pass
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, verifiedOnly: e.target.checked })
            }
            className="h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-zinc-900"
          />
        </label>
      </div>

      {/* 3. Categories */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
          Categories
        </label>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
              filters.category === 'all'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <span>All Categories</span>
          </button>

          {aggregations.categories.map((cat) => {
            const isActive = filters.category === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategorySelect(cat.slug as CategorySlug)}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tech Stack Facets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
          Tech Stack
        </label>
        <div className="flex flex-wrap gap-1.5">
          {aggregations.techStacks.map((tech) => {
            const isChecked = filters.techStack.includes(tech.name);
            return (
              <button
                key={tech.name}
                type="button"
                onClick={() => handleTechToggle(tech.name)}
                className="cursor-pointer"
              >
                <Badge
                  size="sm"
                  variant={isChecked ? 'purple' : 'default'}
                  className="font-mono text-[11px] transition-colors"
                >
                  {tech.name}
                  <span className="text-[9px] opacity-60 ml-0.5">({tech.count})</span>
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Max Price Filter */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
          Budget Ceiling (INR)
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Any Price', val: null },
            { label: '< ₹1,000', val: 1000 },
            { label: '< ₹1,500', val: 1500 },
            { label: '< ₹2,500', val: 2500 },
          ].map((option) => {
            const isSelected = filters.maxPriceINR === option.val;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => handlePriceChange(option.val)}
                className={`rounded-lg px-2.5 py-1.5 text-xs text-center border transition-colors ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-medium'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
