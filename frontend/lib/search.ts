import { Kit, FilterState, SearchAggregations, SortOption, Category } from '../types/kit';

/**
 * Filter and sort kits based on user filter criteria.
 * Executes purely in-memory for instant, zero-latency client-side discovery.
 */
export function filterAndSortKits(kits: Kit[], filters: FilterState): Kit[] {
  let result = [...kits];

  // 1. Text Query Search (title, tagline, description, tech stack, features)
  if (filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    result = result.filter((kit) => {
      const searchableString = [
        kit.title,
        kit.tagline,
        kit.shortDescription,
        kit.description,
        kit.framework,
        ...kit.techStack,
        ...kit.features,
      ]
        .join(' ')
        .toLowerCase();

      // All search terms must match (AND matching)
      return terms.every((term) => searchableString.includes(term));
    });
  }

  // 2. Category Filter
  if (filters.category && filters.category !== 'all') {
    result = result.filter((kit) => kit.category === filters.category);
  }

  // 3. Tech Stack Filters (must include all selected tech tags)
  if (filters.techStack.length > 0) {
    result = result.filter((kit) =>
      filters.techStack.every((selectedTag) =>
        kit.techStack.some((stack) => stack.toLowerCase() === selectedTag.toLowerCase())
      )
    );
  }

  // 4. Max Price Ceiling (INR)
  if (filters.maxPriceINR !== null && filters.maxPriceINR > 0) {
    result = result.filter((kit) => kit.priceINR <= (filters.maxPriceINR as number));
  }

  // 5. Verified Clean Install Only
  if (filters.verifiedOnly) {
    result = result.filter(
      (kit) => kit.verification.cleanInstallVerified && kit.verification.testSuitePassRate >= 100
    );
  }

  // 6. Sorting
  result = sortKits(result, filters.sortBy);

  return result;
}

/**
 * Sort kits according to the chosen sort strategy
 */
export function sortKits(kits: Kit[], sortBy: SortOption): Kit[] {
  const sorted = [...kits];

  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => b.salesCount - a.salesCount);
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    case 'price-low':
      return sorted.sort((a, b) => a.priceINR - b.priceINR);
    case 'price-high':
      return sorted.sort((a, b) => b.priceINR - a.priceINR);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
}

/**
 * Compute real-time aggregations (facets and counts) for the sidebar filters
 */
export function getSearchAggregations(
  filteredKits: Kit[],
  allCategories: Category[]
): SearchAggregations {
  // Count by category
  const categoryCounts = allCategories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    count: filteredKits.filter((k) => k.category === cat.slug).length,
  }));

  // Count by tech stack
  const techStackMap: Record<string, number> = {};
  filteredKits.forEach((kit) => {
    kit.techStack.forEach((tech) => {
      techStackMap[tech] = (techStackMap[tech] || 0) + 1;
    });
  });

  const techStacks = Object.entries(techStackMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    categories: categoryCounts,
    techStacks,
    totalResults: filteredKits.length,
  };
}
