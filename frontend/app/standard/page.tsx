'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KITS } from '../../data/kits';
import { CATEGORIES } from '../../data/categories';
import { KitCard } from '../../components/kits/kit-card';
import { SearchBar } from '../../components/search/search-bar';
import { Button } from '../../components/ui/button';
import { Kit } from '../../types/kit';
import { getAllKits } from '../../lib/kits-store';

const POPULAR_TAGS = ['razorpay', 'rbac', 'rag', 'webhooks', 'docker'];

const KIT_FILES = [
  { path: 'src/webhooks/handler.ts', note: 'Verifies signature' },
  { path: 'src/webhooks/idempotency.ts', note: 'Drops duplicate events' },
  { path: 'tests/retry.test.ts', note: 'Covers retries' },
  { path: 'README.md', note: '8-minute setup' },
];

const KIT_CHECKS = [
  'Retried webhook is processed once',
  'Bad signature is rejected',
  'Clean install, no audit warnings',
];

const BUY_STEPS = [
  {
    title: 'Find the kit',
    body: 'Search by integration or by the problem you are stuck on.',
  },
  {
    title: 'Check what is inside',
    body: 'Every listing shows its files, tests and verification result before you pay.',
  },
  {
    title: 'Download the source',
    body: 'One payment, full code, no subscription. It is yours to modify.',
  },
];

const VERIFY_CHECKS = [
  {
    title: 'Only the packages it needs',
    body: 'No 50-dependency boilerplate. Each kit is scoped to one job.',
  },
  {
    title: 'Failure cases are tested',
    body: 'Retries, duplicates and bad signatures ship with tests.',
  },
  {
    title: 'Installs clean',
    body: 'We run a fresh install on every release before it goes live.',
  },
];

export default function StandardHomePage() {
  const [heroSearch, setHeroSearch] = useState('');
  const [allKits, setAllKits] = useState<Kit[]>(KITS);
  const router = useRouter();

  useEffect(() => {
    setAllKits(getAllKits());
    const handleUpdate = () => setAllKits(getAllKits());
    window.addEventListener('devkit_kits_updated', handleUpdate);
    return () => window.removeEventListener('devkit_kits_updated', handleUpdate);
  }, []);

  const goToSearch = (query: string) => {
    const q = query.trim();
    if (q.length > 0) router.push(`/kits?q=${encodeURIComponent(q)}`);
  };

  const featuredKits = allKits.filter((kit) => kit.isFeatured);
  const totalKits = allKits.length;

  return (
    <div className="pb-24 text-zinc-200">
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-amber-400/[0.07] blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-20 sm:pt-28 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {totalKits} verified kits from independent developers
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/30 px-3.5 py-1 text-xs font-mono text-red-300 hover:text-white hover:border-red-500/70 hover:bg-red-900/40 transition-all shadow-sm"
              >
                <span className="font-serif font-bold text-red-400">影</span>
                <span>Switch to Cinematic Kage 3D View →</span>
              </Link>
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
              Skip the week of integration work.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
              Buy production-ready Next.js code for payments, auth, RAG and
              more. Or sell the kits you have already built.
            </p>

            <form
              className="mt-10 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                goToSearch(heroSearch);
              }}
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 transition-colors focus-within:border-amber-400/70 focus-within:bg-white/[0.06]">
                <SearchBar
                  value={heroSearch}
                  onChange={setHeroSearch}
                  placeholder="Search kits, integrations or problems"
                />
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-zinc-500">Popular:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => goToSearch(tag)}
                  className="rounded-full border border-white/10 px-3 py-1 text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/kits">
                <Button variant="primary" size="lg" className="font-semibold">
                  Browse kits
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" size="lg" className="font-medium">
                  Sell a kit
                </Button>
              </Link>
            </div>
          </div>

          {/* What a kit looks like */}
          <div className="rounded-2xl border border-white/10 bg-[#0f1118] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
              <span className="text-sm font-semibold text-white">
                Inside a kit
              </span>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                Verified
              </span>
            </div>

            <ul className="divide-y divide-white/[0.05]">
              {KIT_FILES.map((f) => (
                <li
                  key={f.path}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <code className="truncate font-mono text-[13px] text-zinc-200">
                    {f.path}
                  </code>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {f.note}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <p className="mb-2.5 text-xs text-zinc-500">Tests passing</p>
              <ul className="space-y-1.5">
                {KIT_CHECKS.map((c) => (
                  <li key={c} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <span className="text-emerald-400" aria-hidden>
                      ✓
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURED ───────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Most-bought kits
            </h2>
            <p className="mt-2 max-w-md text-zinc-400">
              The modules developers reach for first.
            </p>
          </div>
          <Link
            href="/kits"
            className="text-sm font-medium text-amber-300 underline-offset-4 hover:underline"
          >
            View all {totalKits} kits
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredKits.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </div>
      </section>

      {/* ───────────── CATEGORIES ───────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[320px_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Browse by problem
            </h2>
            <p className="mt-3 text-zinc-400">
              Start from what you need to build, not from a tech stack.
            </p>
          </div>

          <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group flex items-center justify-between gap-6 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-zinc-100 transition-colors group-hover:text-amber-300">
                      {cat.name}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                      {cat.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-zinc-500 transition-colors group-hover:text-zinc-200">
                    {cat.count} kits
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── BUY + VERIFY ───────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How buying works
            </h2>
            <ol className="mt-10 space-y-8">
              {BUY_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What “verified” means
            </h2>
            <ul className="mt-10 space-y-6">
              {VERIFY_CHECKS.map((c) => (
                <li key={c.title} className="border-l-2 border-emerald-400/60 pl-5">
                  <h3 className="font-semibold text-white">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              href="/verify"
              className="mt-8 inline-block text-sm font-medium text-amber-300 underline-offset-4 hover:underline"
            >
              Read the full criteria
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── SELL CTA ───────────── */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.10] via-transparent to-transparent p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built something reusable? Sell it.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-zinc-300">
              List your integration once and earn every time another developer
              saves a week. We verify the kit, handle checkout and deliver the
              source instantly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/sell">
              <Button variant="primary" size="lg" className="font-semibold">
                Start selling
              </Button>
            </Link>
            <Link href="/kits">
              <Button variant="outline" size="lg" className="font-medium">
                Browse kits instead
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
