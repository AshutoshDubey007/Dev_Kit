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
      className={`flex flex-col gap-6 rounded-2xl border-2 border-[#cc6b35] bg-white p-5 shadow-[5px_5px_0px_#cc6b35] ${className}`}
    >
      {/* Header with Reset */}
      <div className="flex items-center justify-between border-b-2 border-orange-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-pixel font-bold text-zinc-950">Filters</span>
          {aggregations.totalResults > 0 && (
            <Badge size="sm" variant="default" className="text-[10px]">
              {aggregations.totalResults} kits
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-pixel font-bold text-[#b8531e] hover:underline transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Sort Option */}
      <div>
        <label className="block text-xs font-pixel font-bold uppercase tracking-wider text-[#964115] mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full rounded-lg border-2 border-orange-300 bg-[#fcfaf7] px-3 py-2 text-xs font-pixel text-zinc-950 focus:border-[#b8531e] focus:outline-none"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Recently Verified</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* 2. Verification Strictness Toggle */}
      <div className="rounded-xl border-2 border-[#cc6b35] bg-[#faf5ef] p-3">
        <label className="flex items-center justify-between cursor-pointer gap-2">
          <div className="flex flex-col">
            <span className="text-xs font-pixel font-bold text-[#964115]">
              Verified 100% Pass Only
            </span>
            <span className="text-[11px] text-zinc-600">
              Clean install + 100% test pass
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, verifiedOnly: e.target.checked })
            }
            className="h-4 w-4 rounded border-orange-400 text-[#b8531e] focus:ring-[#cc6b35] bg-white"
          />
        </label>
      </div>

      {/* 3. Categories */}
      <div>
        <label className="block text-xs font-pixel font-bold uppercase tracking-wider text-[#964115] mb-2.5">
          Categories
        </label>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-pixel transition-colors border ${
              filters.category === 'all'
                ? 'bg-[#b8531e] text-white font-bold border-[#78330f]'
                : 'border-transparent text-zinc-700 hover:bg-orange-50 hover:text-[#b8531e]'
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
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-pixel transition-colors border ${
                  isActive
                    ? 'bg-[#b8531e] text-white font-bold border-[#78330f]'
                    : 'border-transparent text-zinc-700 hover:bg-orange-50 hover:text-[#b8531e]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-orange-100' : 'text-zinc-500'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tech Stack Facets */}
      <div>
        <label className="block text-xs font-pixel font-bold uppercase tracking-wider text-[#964115] mb-2.5">
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
                  variant={isChecked ? 'success' : 'secondary'}
                  className="text-[11px] transition-colors"
                >
                  {tech.name}
                  <span className="text-[9px] opacity-75 ml-0.5">({tech.count})</span>
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Max Price Filter */}
      <div>
        <label className="block text-xs font-pixel font-bold uppercase tracking-wider text-[#964115] mb-2.5">
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
                className={`rounded-lg px-2.5 py-1.5 text-xs font-pixel text-center border-2 transition-colors ${
                  isSelected
                    ? 'border-[#78330f] bg-[#b8531e] text-white font-bold'
                    : 'border-orange-200 bg-[#fcfaf7] text-zinc-700 hover:border-[#cc6b35] hover:text-[#b8531e]'
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
