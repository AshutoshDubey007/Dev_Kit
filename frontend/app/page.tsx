'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  Compass,
  ArrowRight,
  ArrowDown,
  Sparkles,
  BookMarked,
  Bot,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Star,
  GitFork,
  Eye,
  Search,
  Layers,
  Zap,
  Filter,
  CheckCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const KageCanvas = dynamic(
  () => import('../components/kage/kage-canvas').then((mod) => mod.KageCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#06080d] z-0 pointer-events-none" aria-hidden="true" />
    ),
  }
);

import { AmbientSoundscape } from '../components/kage/ambient-audio';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { KITS } from '../data/kits';
import { CATEGORIES } from '../data/categories';
import { SEED_REPOSITORIES } from '../data/repositories';
import { SEED_PROMPTS } from '../data/prompts';
import { Kit } from '../types/kit';
import { getAllKits } from '../lib/kits-store';

const POPULAR_TAGS = ['razorpay', 'rbac', 'rag', 'webhooks', 'docker'];

const KIT_FILES = [
  { path: 'src/webhooks/handler.ts', note: 'Verifies HMAC-SHA256 signature' },
  { path: 'src/webhooks/idempotency.ts', note: 'Drops duplicate events' },
  { path: 'tests/retry.test.ts', note: 'Guarantees single settlement' },
  { path: 'README.md', note: '8-minute setup on clean install' },
];

const KIT_CHECKS = [
  'Retried webhook is processed once (Idempotency guaranteed)',
  'Bad cryptographic signatures rejected with 400',
  '100% clean install on Node 20+, zero peer conflicts',
];

export default function SingleKageMarketplacePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const soundscapeRef = useRef<AmbientSoundscape | null>(null);

  // Marketplace states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allKits, setAllKits] = useState<Kit[]>(KITS);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'webhook' | 'idempotency'>('webhook');

  // Initialize ambient audio synthesizer
  useEffect(() => {
    soundscapeRef.current = new AmbientSoundscape();
    return () => {
      soundscapeRef.current?.stop();
    };
  }, []);

  const toggleSound = () => {
    if (soundscapeRef.current) {
      const active = soundscapeRef.current.toggle();
      setIsAudioActive(active);
    }
  };

  // Sync kits store
  useEffect(() => {
    setAllKits(getAllKits());
    const handleUpdate = () => setAllKits(getAllKits());
    window.addEventListener('devkit_kits_updated', handleUpdate);
    return () => window.removeEventListener('devkit_kits_updated', handleUpdate);
  }, []);

  // Track scroll position for WebGL camera flight & chapter indicators
  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        const p = Math.max(0, Math.min(1, window.scrollY / scrollable));
        setScrollProgress(p);

        // Map scroll to 5 chapters
        const ch = Math.min(5, Math.max(1, Math.floor(p * 5) + 1));
        setCurrentChapter(ch);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter templates / kits
  const filteredKits = allKits.filter((kit) => {
    const matchesCategory = selectedCategory === 'all' || kit.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === '' ||
      kit.title.toLowerCase().includes(query) ||
      kit.tagline.toLowerCase().includes(query) ||
      kit.techStack.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  const copySnippet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const chapterNames = [
    '閾 // THE THRESHOLD',
    '燈籠 // VERIFIED TEMPLATES',
    '本堂 // SACRED CRAFT & AI',
    '枯山水 // REPOSITORIES',
    '余光 // THE SUMMIT',
  ];

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-red-500 selection:text-white font-sans antialiased">
      {/* ─── 1. 3D WebGL CANVASES (Temple, Torii, Lanterns, Embers, Moon, Rain) ─── */}
      <KageCanvas scrollProgress={scrollProgress} />

      {/* Subtle Cinematic Vignette (Preserves maximum 3D view-through) */}
      <div
        className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,_transparent_65%,_rgba(6,8,13,0.5)_100%)]"
        aria-hidden="true"
      />

      {/* SVG Grain Film Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* ─── 2. FIXED CINEMATIC BOTTOM HUD (Ambient Audio & Kyoto Telemetry) ─── */}
      <aside className="fixed bottom-4 left-4 right-4 md:left-10 md:right-10 z-30 flex items-center justify-between px-5 py-2.5 rounded-2xl border border-white/[0.1] backdrop-blur-xl bg-black/60 shadow-2xl text-[10px] font-mono text-zinc-300">
        <div className="flex items-center gap-3">
          <span className="text-red-500 font-serif font-bold text-sm">影</span>
          <span className="hidden sm:inline">35.0116° N, 135.7681° E</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="text-zinc-200 uppercase font-semibold">
            {chapterNames[currentChapter - 1]}
          </span>
        </div>

        {/* Scroll Progress Bar */}
        <div className="w-24 sm:w-56 h-1 bg-white/[0.1] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-red-500 transition-all duration-100"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        {/* Ambient Soundscape Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-400/40 text-[10px] font-mono text-zinc-200 transition-all"
            title="Toggle procedural mountain night wind soundscape"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="h-3 w-3 text-amber-400 animate-pulse" />
                <span className="text-amber-300 font-semibold">Wind Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3 w-3 text-zinc-400" />
                <span>Ambient Off</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ─── 4. INTERACTIVE CHAPTERS OVERLAYING THE 3D TEMPLE ─── */}
      <main className="relative z-20 space-y-14 sm:space-y-16 pt-8 sm:pt-12 pb-28">
        {/* ══════════════════════════════════════════════════════════════
            CHAPTER I // 閾 // THE THRESHOLD (Hero & Instant Filter)
           ══════════════════════════════════════════════════════════════ */}
        <section id="hero" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Editorial & Live Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 border-b border-red-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span>01 // 閾 // The Threshold</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-serif tracking-tight font-extrabold leading-[1.08] text-white">
                The Developer Sanctuary of Precision Code.
              </h1>

              <p className="text-sm sm:text-base text-zinc-200 max-w-xl leading-relaxed font-light">
                Battle-tested Next.js 15 starter kits, automated test verification, and 
                instant Razorpay payments—rendered in a see-through glass interface against 
                a living 3D Kyoto mountain temple.
              </p>

              {/* Glassmorphic Search Bar */}
              <div className="p-2 rounded-2xl border border-white/[0.12] bg-black/40 backdrop-blur-xl shadow-2xl space-y-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates, integrations, webhooks, or RAG..."
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-white placeholder-zinc-400 outline-none font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-2 text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Popular Search Tags */}
                <div className="flex flex-wrap items-center gap-2 px-2 pb-1 text-xs font-mono">
                  <span className="text-zinc-400 text-[11px]">Popular:</span>
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-2.5 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-amber-400/60 hover:text-amber-200 transition-all text-[11px]"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#templates"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-red-950/50"
                >
                  <span>Explore Verified Templates</span>
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </a>

                <Link
                  href="/seller/new-kit"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.12] bg-black/40 hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-mono transition-all backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Publish Your Kit</span>
                </Link>
              </div>
            </div>

            {/* Right Column: See-Through Glass "Inside a Verified Template" Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/[0.1] bg-black/30 backdrop-blur-2xl p-6 shadow-2xl shadow-black/80 space-y-4 hover:border-white/[0.2] transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                      Inside a Verified Template
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                    100% Pass
                  </span>
                </div>

                {/* File Tree with See-Through Row Highlight */}
                <div className="space-y-1.5 font-mono text-xs">
                  {KIT_FILES.map((f) => (
                    <div
                      key={f.path}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors"
                    >
                      <code className="text-zinc-200 truncate">{f.path}</code>
                      <span className="text-[10px] text-zinc-400 shrink-0">{f.note}</span>
                    </div>
                  ))}
                </div>

                {/* Test Verification Checks */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Automated Verification Pipeline
                  </span>
                  <div className="space-y-1.5">
                    {KIT_CHECKS.map((check) => (
                      <div key={check} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>RUNTIME: Next.js 15 &amp; Node 20+</span>
                  <span className="text-amber-400 font-semibold">Zero-Dependency Debt</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture & Verification Pillars */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-4 space-y-1.5 hover:border-white/[0.16] transition-all">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Zero Setup Debt</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                Next.js 15 App Router &amp; Node 20+ tested clean installs with zero peer conflicts.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-4 space-y-1.5 hover:border-white/[0.16] transition-all">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Razorpay Route</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                Cryptographic HMAC-SHA256 signature verification &amp; idempotent settlements.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-4 space-y-1.5 hover:border-white/[0.16] transition-all">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Security Gate</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                Zip Slip traversal defenses &amp; automated credential leakage inspection on all uploads.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-4 space-y-1.5 hover:border-white/[0.16] transition-all">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>DLP Safe Chat</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                Encrypted author support channels with automatic phone &amp; off-platform link masking.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER II // 燈籠 // VERIFIED CODE TEMPLATES (Marketplace)
           ══════════════════════════════════════════════════════════════ */}
        <section id="templates" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 border-b border-amber-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-amber-400">
                <span>02 // 燈籠 // The Lantern Path</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-white">
                Battle-Tested Code Templates.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                Every stone lantern along the path corresponds to a production-ready module. 
                Full source code, zero ongoing subscription fees, and 100% test pass guarantee.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedCategory === 'all'
                    ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                    : 'border-white/[0.08] bg-black/40 text-zinc-400 hover:text-white'
                }`}
              >
                All Modules ({allKits.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                    selectedCategory === cat.slug
                      ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                      : 'border-white/[0.08] bg-black/40 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* See-Through Glass Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredKits.map((kit, index) => (
              <div
                key={kit.id}
                className="group relative rounded-3xl border border-white/[0.1] bg-black/30 backdrop-blur-xl p-6 sm:p-7 shadow-2xl hover:border-amber-400/40 hover:bg-black/45 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Glow backdrop on hover */}
                <div className="absolute inset-0 rounded-3xl bg-amber-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="space-y-4">
                  {/* Top Bar: Category & Price */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-[10px] font-mono uppercase tracking-wider text-amber-300">
                      {kit.category}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-white">
                        ₹{kit.priceINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono ml-1.5">
                        (${kit.priceUSD})
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                      {kit.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed font-light line-clamp-2">
                      {kit.tagline}
                    </p>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {kit.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Automated Tests & Verification Badge */}
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/[0.06] text-zinc-300">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{kit.verification.automatedTestsCount} automated tests passing</span>
                    </div>
                    <span className="text-zinc-400 text-[11px]">
                      {kit.verification.nodeVersion}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex items-center gap-3">
                  <Link href={`/kits/${kit.slug}`} className="flex-1">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.15] hover:border-white/30 backdrop-blur-md transition-all shadow-sm group/btn"
                    >
                      <Code2 className="h-3.5 w-3.5 text-amber-400 group-hover/btn:scale-110 transition-transform" />
                      <span>View Full Spec &amp; Files</span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>

                  <Link href={`/checkout?kitId=${kit.id}`}>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 transition-all shadow-sm"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Instant Buy</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredKits.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-white/[0.08] bg-black/30 backdrop-blur-xl">
              <p className="text-zinc-400 font-mono text-sm">
                No templates matched &quot;{searchQuery}&quot;. Try searching for &quot;razorpay&quot;, &quot;rbac&quot;, or &quot;rag&quot;.
              </p>
            </div>
          )}
        </section>

        {/* 3-Step Lifecycle Bridge */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
          <div className="rounded-2xl border border-white/[0.08] bg-black/30 backdrop-blur-xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold font-mono text-amber-400 shrink-0">
                01
              </span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">1. Choose or Prompt</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed font-light">
                  Pick a battle-tested template or generate custom architectures in the AI Studio.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-bold font-mono text-purple-400 shrink-0">
                02
              </span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">2. Audit Spec &amp; Tests</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed font-light">
                  Review automated test suites, clean install guarantees, and runtime dependency specs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold font-mono text-emerald-400 shrink-0">
                03
              </span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">3. Deploy &amp; Support</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed font-light">
                  Download full source code and auto-connect with verified authors in secure DLP chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER III // 本堂 // THE SACRED CRAFT & AI PROMPT STUDIO
           ══════════════════════════════════════════════════════════════ */}
        <section id="studio" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-6">
          <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.1] bg-black/30 backdrop-blur-2xl relative overflow-hidden shadow-2xl space-y-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 border-b border-purple-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-purple-400">
                <span>03 // 本堂 // The Sacred Craft</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-white">
                AI Generation Studio &amp; Prompt Blueprints.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                Turn system requirements into multi-file production repositories. 
                Execute tested prompts through Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro.
              </p>
            </div>

            {/* Prompt Blueprints Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SEED_PROMPTS.slice(0, 2).map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-6 rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl hover:border-purple-500/40 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-950/30 text-[10px] font-mono text-purple-300 uppercase">
                      Prompt Blueprint
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      <span>{prompt.supportedModels[0]}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{prompt.title}</h4>
                    <p className="mt-1 text-xs text-zinc-300 leading-relaxed font-light">
                      {prompt.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] font-mono text-[11px] text-zinc-400 space-y-1">
                    <div className="text-zinc-300 font-semibold">Variables accepted:</div>
                    <div className="flex flex-wrap gap-2 text-purple-300">
                      {prompt.requiredVariables.map((v) => (
                        <span key={v.name}>&#123;&#123;{v.name}&#125;&#125;</span>
                      ))}
                    </div>
                  </div>

                  <Link href={`/prompts/${prompt.slug}`}>
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      <span>Execute in AI Studio</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Direct Studio Launcher */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.08] bg-purple-950/20 backdrop-blur-md">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-sm font-bold text-white">Have a unique specification?</div>
                <div className="text-xs text-zinc-400">Launch the AI studio to generate complete schemas, route handlers, and ZIP packages.</div>
              </div>
              <Link href="/studio">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/40 transition-all"
                >
                  <span>Open AI Studio Generator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER IV // 枯山水 // OPEN SOURCE REPOSITORIES
           ══════════════════════════════════════════════════════════════ */}
        <section id="repos" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 border-b border-blue-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-blue-400">
                <span>04 // 枯山水 // Stillness &amp; Depth</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-white">
                Open Source Repositories.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                Like the raked gravel of a zen garden, high-performance code demands 
                uncompromising restraint. Browse repositories with live syntax viewing and branch navigation.
              </p>
            </div>

            <Link href="/repos/new">
              <Button
                variant="outline"
                className="text-xs border-white/[0.15] bg-black/40 text-white hover:bg-white/[0.08] gap-1.5 font-mono"
              >
                <BookMarked className="h-3.5 w-3.5" />
                <span>Create Repository</span>
              </Button>
            </Link>
          </div>

          {/* See-Through Repositories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEED_REPOSITORIES.map((repo) => (
              <div
                key={repo.id}
                className="rounded-3xl border border-white/[0.1] bg-black/30 backdrop-blur-xl p-6 shadow-2xl hover:border-blue-400/40 hover:bg-black/45 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-400 font-semibold">
                      {repo.ownerUsername}
                    </span>
                    <span className="px-2 py-0.5 rounded-full border border-white/[0.1] bg-white/[0.04] text-[10px] font-mono text-zinc-300">
                      {repo.visibility}
                    </span>
                  </div>

                  <Link
                    href={`/${repo.ownerUsername}/${repo.name}`}
                    className="text-lg font-bold text-white hover:text-blue-300 transition-colors block"
                  >
                    {repo.name}
                  </Link>

                  <p className="text-xs text-zinc-300 leading-relaxed font-light line-clamp-2">
                    {repo.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      <span>{repo.starsCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{repo.forksCount}</span>
                    </div>
                    <div className="text-zinc-500">•</div>
                    <span className="text-zinc-300">{repo.primaryLanguage}</span>
                  </div>
                </div>

                <Link href={`/${repo.ownerUsername}/${repo.name}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-white/[0.1] text-zinc-200 hover:text-white hover:border-blue-400/40"
                  >
                    Browse Code Tree →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER V // 余光 // THE SUMMIT & COLLABORATION
           ══════════════════════════════════════════════════════════════ */}
        <section id="summit" className="flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto text-center space-y-6 pt-4">
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 border-b border-red-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-red-400">
              <span>05 // 余光 // Afterlight</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif tracking-tight font-bold text-white">
              The Summit of DevKit.
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
              You have journeyed through the mountain temple. Every system—repositories, 
              verified starter kits, AI prompt workflows, and DLP-protected chat—lives here in one unified ecosystem.
            </p>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4">
            <Link
              href="/repos"
              className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl hover:border-blue-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <BookMarked className="h-4 w-4 text-blue-400" />
              <div className="text-xs font-bold text-white">Repositories</div>
              <p className="text-[10px] text-zinc-400">Explore open source code</p>
            </Link>

            <Link
              href="/kits"
              className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl hover:border-emerald-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              <div className="text-xs font-bold text-white">Marketplace</div>
              <p className="text-[10px] text-zinc-400">Verified starter kits</p>
            </Link>

            <Link
              href="/prompts"
              className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl hover:border-purple-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <div className="text-xs font-bold text-white">AI Prompts</div>
              <p className="text-[10px] text-zinc-400">Code generation blueprints</p>
            </Link>

            <Link
              href="/chat"
              className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl hover:border-amber-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <Compass className="h-4 w-4 text-amber-400" />
              <div className="text-xs font-bold text-white">Support Chat</div>
              <p className="text-[10px] text-zinc-400">3-Panel DLP collaboration</p>
            </Link>
          </div>

          <div className="pt-8">
            <a
              href="#hero"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/[0.1] bg-black/40 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/30 transition-all"
            >
              <span>↑ Return to Sanmon Entrance</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
