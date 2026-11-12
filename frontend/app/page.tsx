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
      <div className="fixed inset-0 bg-[#fcfaf7] z-0 pointer-events-none" aria-hidden="true" />
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
    <div className="relative min-h-screen bg-transparent text-zinc-950 selection:bg-[#cc6b35] selection:text-white font-sans antialiased">
      {/* ─── 1. 3D WebGL CANVASES (Orange & White Arcade Grid Sanctuary) ─── */}
      <KageCanvas scrollProgress={scrollProgress} theme="arcade" />

      {/* Subtle Warm White Edge Wash (Preserves 3D view-through while keeping text crisp) */}
      <div
        className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,_rgba(255,250,245,0.18)_0%,_rgba(255,247,237,0.68)_100%)]"
        aria-hidden="true"
      />

      {/* Arcade Pixel Scanline Overlay (Ultra-subtle) */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #cc6b35 0px, #cc6b35 1px, transparent 1px, transparent 4px)',
        }}
        aria-hidden="true"
      />

      {/* ─── 2. FIXED ARCADE BOTTOM HUD (Ambient Audio & Stage Telemetry) ─── */}
      <aside className="fixed bottom-4 left-4 right-4 md:left-10 md:right-10 z-30 flex items-center justify-between px-5 py-2.5 rounded-xl border-2 border-[#cc6b35] backdrop-blur-md bg-white/95 shadow-[4px_4px_0px_#cc6b35] text-[11px] font-pixel text-zinc-800">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#b8531e] text-white font-arcade text-[10px] shrink-0">
            DK
          </span>
          <span className="hidden sm:inline text-[#b8531e] font-bold">STAGE 0{currentChapter}</span>
          <span className="hidden sm:inline text-orange-300">•</span>
          <span className="text-zinc-950 uppercase font-bold truncate">
            {chapterNames[currentChapter - 1]}
          </span>
        </div>

        {/* Scroll Progress Bar */}
        <div className="w-24 sm:w-56 h-2.5 bg-orange-100 border border-[#cc6b35] rounded-sm overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-[#b8531e] via-[#cc6b35] to-[#e5a982] transition-all duration-100"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        {/* Ambient Soundscape Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-[#cc6b35] bg-[#faf5ef] hover:bg-orange-100 text-[11px] font-pixel text-[#964115] transition-all"
            title="Toggle procedural soundscape"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#b8531e] animate-pulse" />
                <span className="font-bold">SFX ON</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-[#cc6b35]" />
                <span>SFX OFF</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ─── 4. INTERACTIVE CHAPTERS OVERLAYING THE 3D STAGE ─── */}
      <main className="relative z-20 space-y-14 sm:space-y-16 pt-8 sm:pt-12 pb-20 sm:pb-24">
        {/* ══════════════════════════════════════════════════════════════
            CHAPTER I // THE THRESHOLD (Hero & Instant Filter)
           ══════════════════════════════════════════════════════════════ */}
        <section id="hero" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Editorial & Live Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-md border-2 border-[#cc6b35] bg-white px-3 py-1 text-xs font-pixel uppercase tracking-[0.18em] text-[#b8531e] shadow-[3px_3px_0px_#e8c3a8]">
                <span className="h-2 w-2 bg-[#cc6b35] animate-ping" />
                <span>01 // 閾 // Arcade Threshold</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-[2.5rem] font-arcade tracking-tight leading-[1.35] text-zinc-950 drop-shadow-[3px_3px_0px_#e8c3a8]">
                The Developer Arcade of{' '}
                <span className="text-[#b8531e] underline decoration-[#e5a982] decoration-4 underline-offset-8">
                  Precision Code.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-800 max-w-xl leading-relaxed font-medium bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-orange-200">
                Battle-tested Next.js 15 starter kits, automated test verification, and
                instant Razorpay payments—rendered in a crisp orange &amp; white arcade
                interface over an interactive 3D stage.
              </p>

              {/* Arcade Search Bar */}
              <div className="p-3 rounded-2xl border-2 border-[#cc6b35] bg-white shadow-[5px_5px_0px_#cc6b35] space-y-2.5">
                <div className="relative flex items-center bg-[#fcfaf7] rounded-xl border-2 border-orange-200 focus-within:border-[#b8531e]">
                  <Search className="absolute left-4 h-4 w-4 text-[#b8531e]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates, integrations, webhooks, or RAG..."
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-zinc-950 placeholder-zinc-500 outline-none font-mono"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-3 text-xs font-pixel text-[#b8531e] hover:text-zinc-950 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Popular Search Tags */}
                <div className="flex flex-wrap items-center gap-2 px-1 pb-0.5 text-xs font-pixel">
                  <span className="text-zinc-600 text-[11px] font-bold">Popular:</span>
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-2.5 py-0.5 rounded-md border-2 border-orange-200 bg-[#faf5ef] text-[#964115] hover:border-[#cc6b35] hover:bg-orange-100 transition-all text-[11px] font-bold"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#templates"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#b8531e] hover:bg-[#964115] border-2 border-[#78330f] text-white text-xs font-arcade uppercase tracking-wider transition-all shadow-[4px_4px_0px_#e5a982] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <span>Explore Templates</span>
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </a>

                <Link
                  href="/seller/new-kit"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-[#cc6b35] bg-white hover:bg-[#faf5ef] text-[#964115] text-xs font-pixel font-bold uppercase transition-all shadow-[4px_4px_0px_#e8c3a8]"
                >
                  <Sparkles className="h-4 w-4 text-[#cc6b35]" />
                  <span>Publish Your Kit</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Arcade White "Inside a Verified Template" Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border-2 border-[#cc6b35] bg-white p-6 shadow-[6px_6px_0px_#cc6b35] space-y-4 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-orange-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#b8531e]" />
                    <span className="text-xs font-pixel font-bold tracking-wider text-zinc-950 uppercase">
                      Inside a Verified Template
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#b8531e] border border-[#78330f] text-[10px] font-pixel font-bold text-white">
                    100% PASS
                  </span>
                </div>

                {/* File Tree */}
                <div className="space-y-1.5 font-mono text-xs">
                  {KIT_FILES.map((f) => (
                    <div
                      key={f.path}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#faf5ef] border border-orange-200 hover:border-[#cc6b35] transition-colors"
                    >
                      <code className="text-zinc-950 font-semibold truncate">{f.path}</code>
                      <span className="text-[11px] text-[#964115] shrink-0 font-medium">{f.note}</span>
                    </div>
                  ))}
                </div>

                {/* Test Verification Checks */}
                <div className="p-3.5 rounded-xl bg-[#fcfaf7] border-2 border-orange-200 space-y-2">
                  <span className="text-[11px] font-pixel font-bold text-[#b8531e] uppercase tracking-wider block">
                    Automated Verification Pipeline
                  </span>
                  <div className="space-y-1.5">
                    {KIT_CHECKS.map((check) => (
                      <div key={check} className="flex items-start gap-2 text-xs text-zinc-800">
                        <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0 mt-0.5" />
                        <span className="leading-snug">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] font-pixel text-zinc-700">
                  <span>RUNTIME: Next.js 15 &amp; Node 20+</span>
                  <span className="text-[#b8531e] font-bold">Zero-Debt Build</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture & Verification Pillars */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border-2 border-[#cc6b35] bg-white p-4 space-y-1.5 shadow-[4px_4px_0px_#e8c3a8] hover:shadow-[4px_4px_0px_#cc6b35] transition-all">
              <div className="flex items-center gap-2 text-xs font-pixel font-bold text-zinc-950">
                <span className="h-2.5 w-2.5 bg-[#cc6b35]" />
                <span>Zero Setup Debt</span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Next.js 15 App Router &amp; Node 20+ tested clean installs with zero peer conflicts.
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#cc6b35] bg-white p-4 space-y-1.5 shadow-[4px_4px_0px_#e8c3a8] hover:shadow-[4px_4px_0px_#cc6b35] transition-all">
              <div className="flex items-center gap-2 text-xs font-pixel font-bold text-zinc-950">
                <span className="h-2.5 w-2.5 bg-[#cc6b35]" />
                <span>Razorpay Route</span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Cryptographic HMAC-SHA256 signature verification &amp; idempotent settlements.
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#cc6b35] bg-white p-4 space-y-1.5 shadow-[4px_4px_0px_#e8c3a8] hover:shadow-[4px_4px_0px_#cc6b35] transition-all">
              <div className="flex items-center gap-2 text-xs font-pixel font-bold text-zinc-950">
                <span className="h-2.5 w-2.5 bg-[#b8531e]" />
                <span>Security Gate</span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Zip Slip traversal defenses &amp; automated credential leakage inspection on all uploads.
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#cc6b35] bg-white p-4 space-y-1.5 shadow-[4px_4px_0px_#e8c3a8] hover:shadow-[4px_4px_0px_#cc6b35] transition-all">
              <div className="flex items-center gap-2 text-xs font-pixel font-bold text-zinc-950">
                <span className="h-2.5 w-2.5 bg-[#964115]" />
                <span>DLP Safe Chat</span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Encrypted author support channels with automatic phone &amp; off-platform link masking.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER II // VERIFIED CODE TEMPLATES (Marketplace)
           ══════════════════════════════════════════════════════════════ */}
        <section id="templates" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#cc6b35] pb-6 bg-white/85 backdrop-blur-sm p-6 rounded-2xl border-2 shadow-[4px_4px_0px_#e8c3a8]">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 border-b-2 border-[#cc6b35] pb-1 text-xs font-pixel font-bold uppercase tracking-[0.2em] text-[#b8531e]">
                <span>02 // 燈籠 // The Arcade Path</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-arcade tracking-tight text-zinc-950 leading-[1.35]">
                Battle-Tested Code Templates.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                Every arcade block corresponds to a production-ready module.
                Full source code, zero ongoing subscription fees, and 100% test pass guarantee.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-pixel font-bold transition-all border-2 ${
                  selectedCategory === 'all'
                    ? 'border-[#78330f] bg-[#b8531e] text-white shadow-[2px_2px_0px_#e5a982]'
                    : 'border-orange-200 bg-white text-zinc-800 hover:border-[#cc6b35] hover:text-[#b8531e]'
                }`}
              >
                All Modules ({allKits.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-pixel font-bold transition-all border-2 ${
                    selectedCategory === cat.slug
                      ? 'border-[#78330f] bg-[#b8531e] text-white shadow-[2px_2px_0px_#e5a982]'
                      : 'border-orange-200 bg-white text-zinc-800 hover:border-[#cc6b35] hover:text-[#b8531e]'
                  }`}
                >
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Arcade Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredKits.map((kit) => (
              <div
                key={kit.id}
                className="group relative rounded-2xl border-2 border-[#cc6b35] bg-white p-6 sm:p-7 shadow-[5px_5px_0px_#cc6b35] hover:shadow-[7px_7px_0px_#b8531e] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar: Category & Price */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md border-2 border-[#cc6b35] bg-[#f7ece1] text-[11px] font-pixel font-bold uppercase tracking-wider text-[#964115]">
                      {kit.category}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-arcade text-[#b8531e]">
                        ₹{kit.priceINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-zinc-600 font-pixel ml-1.5">
                        (${kit.priceUSD})
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-lg font-pixel font-bold text-zinc-950 group-hover:text-[#b8531e] transition-colors">
                      {kit.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-zinc-700 leading-relaxed line-clamp-2">
                      {kit.tagline}
                    </p>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {kit.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded border border-orange-300 bg-[#faf5ef] text-[11px] font-pixel text-[#964115]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Automated Tests & Verification Badge */}
                  <div className="flex items-center justify-between text-xs font-pixel pt-3 border-t-2 border-orange-100 text-zinc-700">
                    <div className="flex items-center gap-1.5 text-[#b8531e] font-bold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{kit.verification.automatedTestsCount} tests passing</span>
                    </div>
                    <span className="text-zinc-600 text-[11px]">
                      {kit.verification.nodeVersion}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex flex-wrap items-center gap-3">
                  <Link href={`/kits/${kit.slug}`} className="flex-1 min-w-[180px]">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-pixel font-bold text-[#964115] bg-[#faf5ef] hover:bg-orange-100 border-2 border-[#cc6b35] transition-all shadow-[2px_2px_0px_#e8c3a8] group/btn"
                    >
                      <Code2 className="h-3.5 w-3.5 text-[#b8531e]" />
                      <span>View Spec &amp; Files</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#b8531e] group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>

                  <Link href={`/checkout?kitId=${kit.id}`}>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-pixel font-bold text-white bg-[#b8531e] hover:bg-[#964115] border-2 border-[#78330f] transition-all shadow-[3px_3px_0px_#e5a982]"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Instant Buy</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredKits.length === 0 && (
            <div className="p-12 text-center rounded-2xl border-2 border-[#cc6b35] bg-white shadow-[4px_4px_0px_#cc6b35]">
              <p className="text-zinc-700 font-pixel text-sm">
                No templates matched &quot;{searchQuery}&quot;. Try searching for &quot;razorpay&quot;, &quot;rbac&quot;, or &quot;rag&quot;.
              </p>
            </div>
          )}
        </section>

        {/* 3-Step Lifecycle Bridge */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
          <div className="rounded-2xl border-2 border-[#cc6b35] bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#cc6b35] grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8531e] border-2 border-[#78330f] text-xs font-arcade text-white shrink-0">
                01
              </span>
              <div>
                <h4 className="text-xs font-pixel font-bold text-zinc-950 uppercase tracking-wider">1. Choose or Prompt</h4>
                <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed">
                  Pick a battle-tested template or generate custom architectures in the AI Studio.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cc6b35] border-2 border-[#964115] text-xs font-arcade text-white shrink-0">
                02
              </span>
              <div>
                <h4 className="text-xs font-pixel font-bold text-zinc-950 uppercase tracking-wider">2. Audit Spec &amp; Tests</h4>
                <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed">
                  Review automated test suites, clean install guarantees, and runtime dependency specs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7ece1] border-2 border-[#cc6b35] text-xs font-arcade text-[#b8531e] shrink-0">
                03
              </span>
              <div>
                <h4 className="text-xs font-pixel font-bold text-zinc-950 uppercase tracking-wider">3. Deploy &amp; Support</h4>
                <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed">
                  Download full source code and auto-connect with verified authors in secure DLP chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER III // THE SACRED CRAFT & AI PROMPT STUDIO
           ══════════════════════════════════════════════════════════════ */}
        <section id="studio" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-6">
          <div className="p-8 sm:p-12 rounded-2xl border-2 border-[#cc6b35] bg-white relative overflow-hidden shadow-[6px_6px_0px_#cc6b35] space-y-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 border-b-2 border-[#cc6b35] pb-1 text-xs font-pixel font-bold uppercase tracking-[0.2em] text-[#b8531e]">
                <span>03 // 本堂 // Arcade AI Craft</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-arcade tracking-tight text-zinc-950 leading-[1.35]">
                AI Generation Studio &amp; Blueprints.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                Turn system requirements into multi-file production repositories.
                Execute tested prompts through Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro.
              </p>
            </div>

            {/* Prompt Blueprints Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SEED_PROMPTS.slice(0, 2).map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-6 rounded-xl border-2 border-orange-300 bg-[#fcfaf7] hover:border-[#cc6b35] transition-all space-y-4 shadow-[3px_3px_0px_#e8c3a8]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded border-2 border-[#cc6b35] bg-white text-[11px] font-pixel font-bold text-[#b8531e] uppercase">
                      Prompt Blueprint
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-pixel text-zinc-700">
                      <Sparkles className="h-3.5 w-3.5 text-[#cc6b35]" />
                      <span>{prompt.supportedModels[0]}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-pixel font-bold text-zinc-950">{prompt.title}</h4>
                    <p className="mt-1 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                      {prompt.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-orange-200 font-mono text-[11px] text-zinc-700 space-y-1">
                    <div className="text-zinc-950 font-semibold font-pixel">Variables accepted:</div>
                    <div className="flex flex-wrap gap-2 text-[#b8531e] font-bold">
                      {prompt.requiredVariables.map((v) => (
                        <span key={v.name}>&#123;&#123;{v.name}&#125;&#125;</span>
                      ))}
                    </div>
                  </div>

                  <Link href={`/prompts/${prompt.slug}`}>
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                    >
                      <span>Execute in AI Studio</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Direct Studio Launcher */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border-2 border-[#cc6b35] bg-[#f7ece1]">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-sm font-pixel font-bold text-zinc-950">Have a unique specification?</div>
                <div className="text-xs text-zinc-700">Launch the AI studio to generate complete schemas, route handlers, and ZIP packages.</div>
              </div>
              <Link href="/studio">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-pixel font-bold text-white bg-[#b8531e] hover:bg-[#964115] border-2 border-[#78330f] shadow-[3px_3px_0px_#e5a982] transition-all"
                >
                  <span>Open AI Studio Generator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER IV // OPEN SOURCE REPOSITORIES
           ══════════════════════════════════════════════════════════════ */}
        <section id="repos" className="flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-2 border-[#cc6b35] bg-white/90 p-6 rounded-2xl shadow-[4px_4px_0px_#e8c3a8]">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 border-b-2 border-[#cc6b35] pb-1 text-xs font-pixel font-bold uppercase tracking-[0.2em] text-[#b8531e]">
                <span>04 // 枯山水 // Code Vaults</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-arcade tracking-tight text-zinc-950 leading-[1.35]">
                Open Source Repositories.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                High-performance code demands uncompromising restraint.
                Browse repositories with live syntax viewing and branch navigation.
              </p>
            </div>

            <Link href="/repos/new">
              <Button
                variant="outline"
                className="text-xs gap-1.5"
              >
                <BookMarked className="h-3.5 w-3.5" />
                <span>Create Repository</span>
              </Button>
            </Link>
          </div>

          {/* Repositories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEED_REPOSITORIES.map((repo) => (
              <div
                key={repo.id}
                className="rounded-2xl border-2 border-[#cc6b35] bg-white p-6 shadow-[4px_4px_0px_#cc6b35] hover:shadow-[6px_6px_0px_#b8531e] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-pixel text-[#b8531e] font-bold">
                      {repo.ownerUsername}
                    </span>
                    <span className="px-2 py-0.5 rounded border border-orange-300 bg-[#faf5ef] text-[10px] font-pixel font-bold text-[#964115] uppercase">
                      {repo.visibility}
                    </span>
                  </div>

                  <Link
                    href={`/${repo.ownerUsername}/${repo.name}`}
                    className="text-base font-pixel font-bold text-zinc-950 hover:text-[#b8531e] transition-colors block"
                  >
                    {repo.name}
                  </Link>

                  <p className="text-xs text-zinc-700 leading-relaxed line-clamp-2">
                    {repo.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-pixel text-zinc-600 pt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-[#cc6b35]" />
                      <span className="text-zinc-950 font-bold">{repo.starsCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5 text-zinc-600" />
                      <span>{repo.forksCount}</span>
                    </div>
                    <div className="text-orange-300">•</div>
                    <span className="text-[#964115] font-bold">{repo.primaryLanguage}</span>
                  </div>
                </div>

                <Link href={`/${repo.ownerUsername}/${repo.name}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                  >
                    Browse Code Tree →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER V // THE SUMMIT & COLLABORATION
           ══════════════════════════════════════════════════════════════ */}
        <section id="summit" className="flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto text-center space-y-6 pt-4">
          <div className="space-y-4 max-w-2xl mx-auto bg-white/90 border-2 border-[#cc6b35] rounded-2xl p-6 sm:p-8 shadow-[5px_5px_0px_#cc6b35]">
            <div className="inline-flex items-center gap-2 border-b-2 border-[#cc6b35] pb-1 text-xs font-pixel font-bold uppercase tracking-[0.2em] text-[#b8531e]">
              <span>05 // 余光 // Final Stage</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-arcade tracking-tight text-zinc-950 leading-[1.35]">
              The Summit of DevKit.
            </h2>

            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
              Every system—repositories, verified starter kits, AI prompt workflows,
              and DLP-protected chat—lives here in one unified orange &amp; white ecosystem.
            </p>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-2 w-full">
            <Link
              href="/repos"
              className="p-5 rounded-xl border-2 border-[#cc6b35] bg-white hover:bg-[#faf5ef] shadow-[3px_3px_0px_#cc6b35] hover:shadow-[5px_5px_0px_#b8531e] transition-all text-left space-y-1.5"
            >
              <BookMarked className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-pixel font-bold text-zinc-950">Repositories</div>
              <p className="text-[11px] text-zinc-600">Explore open source code</p>
            </Link>

            <Link
              href="/kits"
              className="p-5 rounded-xl border-2 border-[#cc6b35] bg-white hover:bg-[#faf5ef] shadow-[3px_3px_0px_#cc6b35] hover:shadow-[5px_5px_0px_#b8531e] transition-all text-left space-y-1.5"
            >
              <ShoppingBag className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-pixel font-bold text-zinc-950">Marketplace</div>
              <p className="text-[11px] text-zinc-600">Verified starter kits</p>
            </Link>

            <Link
              href="/prompts"
              className="p-5 rounded-xl border-2 border-[#cc6b35] bg-white hover:bg-[#faf5ef] shadow-[3px_3px_0px_#cc6b35] hover:shadow-[5px_5px_0px_#b8531e] transition-all text-left space-y-1.5"
            >
              <Sparkles className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-pixel font-bold text-zinc-950">AI Prompts</div>
              <p className="text-[11px] text-zinc-600">Code generation blueprints</p>
            </Link>

            <Link
              href="/chat"
              className="p-5 rounded-xl border-2 border-[#cc6b35] bg-white hover:bg-[#faf5ef] shadow-[3px_3px_0px_#cc6b35] hover:shadow-[5px_5px_0px_#b8531e] transition-all text-left space-y-1.5"
            >
              <Compass className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-pixel font-bold text-zinc-950">Support Chat</div>
              <p className="text-[11px] text-zinc-600">3-Panel DLP collaboration</p>
            </Link>
          </div>

          <div className="pt-4 pb-2">
            <a
              href="#hero"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#cc6b35] bg-white text-xs font-pixel font-bold text-[#b8531e] hover:bg-[#faf5ef] shadow-[3px_3px_0px_#cc6b35] transition-all"
            >
              <span>↑ Return to Arcade Start</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
