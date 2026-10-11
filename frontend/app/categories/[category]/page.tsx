'use client';

import React from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { CATEGORIES } from '../../../data/categories';
import { KITS } from '../../../data/kits';
import { KitGrid } from '../../../components/kits/kit-grid';
import { Badge } from '../../../components/ui/badge';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params?.category as string;

  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    return notFound();
  }

  const categoryKits = KITS.filter((kit) => kit.category === categorySlug);

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
        <Link href="/" className="hover:text-zinc-300">
          Home
        </Link>
        <span>/</span>
        <Link href="/kits" className="hover:text-zinc-300">
          Categories
        </Link>
        <span>/</span>
        <span className="text-zinc-300 capitalize">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm" className="capitalize">
            {category.slug}
          </Badge>
          <span className="text-xs text-zinc-500 font-mono">
            {categoryKits.length} verified integration {categoryKits.length === 1 ? 'kit' : 'kits'}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Kits in this category */}
      <div>
        <KitGrid kits={categoryKits} />
      </div>
    </div>
  );
}
