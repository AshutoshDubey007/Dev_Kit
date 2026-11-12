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
import { KageCanvas } from '../../components/kage/kage-canvas';
import { AmbientSoundscape } from '../../components/kage/ambient-audio';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { KITS } from '../../data/kits';
import { CATEGORIES } from '../../data/categories';
import { SEED_REPOSITORIES } from '../../data/repositories';
import { SEED_PROMPTS } from '../../data/prompts';
import { Kit } from '../../types/kit';
import { getAllKits } from '../../lib/kits-store';

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
    <div className="relative min-h-[600vh] bg-transparent text-zinc-950 selection:bg-[#cc6b35] selection:text-white font-sans antialiased">
      {/* ─── 1. 3D WebGL CANVASES ─── */}
      <KageCanvas scrollProgress={scrollProgress} theme="arcade" />

      {/* Subtle Warm Arcade Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,_transparent_65%,_rgba(255,247,237,0.65)_100%)]"
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
      <aside className="fixed bottom-4 left-4 right-4 md:left-10 md:right-10 z-30 flex items-center justify-between px-5 py-2.5 rounded-2xl border border-orange-200 backdrop-blur-xl bg-white shadow-2xl text-[10px] font-mono text-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-red-500 font-serif font-bold text-sm">影</span>
          <span className="hidden sm:inline">35.0116° N, 135.7681° E</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="text-zinc-900 uppercase font-semibold">
            {chapterNames[currentChapter - 1]}
          </span>
        </div>

        {/* Scroll Progress Bar */}
        <div className="w-24 sm:w-56 h-1 bg-[#faf5ef] rounded-full overflow-hidden">
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
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200 bg-[#faf5ef] hover:bg-[#faf5ef] hover:border-[#cc6b35] text-[10px] font-mono text-zinc-900 transition-all"
            title="Toggle procedural mountain night wind soundscape"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="h-3 w-3 text-[#b8531e] animate-pulse" />
                <span className="text-[#b8531e] font-semibold">Wind Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3 w-3 text-zinc-600" />
                <span>Ambient Off</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ─── 4. INTERACTIVE CHAPTERS OVERLAYING THE 3D TEMPLE ─── */}
      <main className="relative z-20 space-y-[28vh] pt-28 pb-16">
        {/* ══════════════════════════════════════════════════════════════
            CHAPTER I // 閾 // THE THRESHOLD (Hero & Instant Filter)
           ══════════════════════════════════════════════════════════════ */}
        <section id="hero" className="min-h-[85vh] flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Editorial & Live Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 border-b border-red-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span>01 // 閾 // The Threshold</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-serif tracking-tight font-extrabold leading-[1.08] text-zinc-950">
                The Developer Sanctuary of Precision Code.
              </h1>

              <p className="text-sm sm:text-base text-zinc-900 max-w-xl leading-relaxed font-light">
                Battle-tested Next.js 15 starter kits, automated test verification, and 
                instant Razorpay payments—rendered in a see-through glass interface against 
                a living 3D Kyoto mountain temple.
              </p>

              {/* Glassmorphic Search Bar */}
              <div className="p-2 rounded-2xl border border-orange-200 bg-white backdrop-blur-xl shadow-2xl space-y-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-4 w-4 text-zinc-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates, integrations, webhooks, or RAG..."
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-zinc-950 placeholder:text-zinc-500 outline-none font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-2 text-xs font-mono text-zinc-600 hover:text-zinc-950"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Popular Search Tags */}
                <div className="flex flex-wrap items-center gap-2 px-2 pb-1 text-xs font-mono">
                  <span className="text-zinc-600 text-[11px]">Popular:</span>
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-2.5 py-0.5 rounded-full border border-orange-200 bg-[#faf5ef] text-zinc-800 hover:border-[#cc6b35] hover:text-[#b8531e] transition-all text-[11px]"
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#b8531e] hover:bg-[#964115] text-white border-2 border-[#78330f] shadow-[3px_3px_0px_#e5a982] hover:from-red-500 hover:to-amber-400 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-[#e8c3a8]"
                >
                  <span>Explore Verified Templates</span>
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </a>

                <Link
                  href="/seller/new-kit"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-orange-200 bg-white hover:bg-[#faf5ef] text-zinc-900 hover:text-zinc-950 text-xs font-mono transition-all backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#b8531e]" />
                  <span>Publish Your Kit</span>
                </Link>
              </div>
            </div>

            {/* Right Column: See-Through Glass "Inside a Verified Template" Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-orange-200 bg-white backdrop-blur-2xl p-6 shadow-2xl shadow-orange-200/60 space-y-4 hover:border-orange-200 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-orange-200 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#b8531e]" />
                    <span className="text-xs font-mono font-bold tracking-wider text-zinc-950 uppercase">
                      Inside a Verified Template
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#f7ece1] border border-[#cc6b35] text-[10px] font-mono text-[#b8531e]">
                    100% Pass
                  </span>
                </div>

                {/* File Tree with See-Through Row Highlight */}
                <div className="space-y-1.5 font-mono text-xs">
                  {KIT_FILES.map((f) => (
                    <div
                      key={f.path}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#faf5ef] border border-orange-200 hover:bg-[#faf5ef] transition-colors"
                    >
                      <code className="text-zinc-900 truncate">{f.path}</code>
                      <span className="text-[10px] text-zinc-600 shrink-0">{f.note}</span>
                    </div>
                  ))}
                </div>

                {/* Test Verification Checks */}
                <div className="p-3.5 rounded-2xl bg-[#faf5ef] border border-orange-200 space-y-2">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider block">
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

                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-zinc-600">
                  <span>RUNTIME: Next.js 15 &amp; Node 20+</span>
                  <span className="text-[#b8531e] font-semibold">Zero-Dependency Debt</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER II // 燈籠 // VERIFIED CODE TEMPLATES (Marketplace)
           ══════════════════════════════════════════════════════════════ */}
        <section id="templates" className="min-h-[90vh] flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-orange-200 pb-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 border-b border-[#cc6b35] pb-1 text-xs font-mono uppercase tracking-[0.25em] text-[#b8531e]">
                <span>02 // 燈籠 // The Lantern Path</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-zinc-950">
                Battle-Tested Code Templates.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-800 font-light leading-relaxed">
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
                    ? 'border-[#cc6b35] bg-[#f7ece1] text-zinc-950 font-bold'
                    : 'border-orange-200 bg-white text-zinc-600 hover:text-zinc-950'
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
                      ? 'border-[#cc6b35] bg-[#f7ece1] text-zinc-950 font-bold'
                      : 'border-orange-200 bg-white text-zinc-600 hover:text-zinc-950'
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
                className="group relative rounded-3xl border border-orange-200 bg-white backdrop-blur-xl p-6 sm:p-7 shadow-2xl hover:border-[#cc6b35] hover:bg-white/45 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Glow backdrop on hover */}
                <div className="absolute inset-0 rounded-3xl bg-amber-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="space-y-4">
                  {/* Top Bar: Category & Price */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full border border-orange-200 bg-[#faf5ef] text-[10px] font-mono uppercase tracking-wider text-[#b8531e]">
                      {kit.category}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-zinc-950">
                        ₹{kit.priceINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-zinc-600 font-mono ml-1.5">
                        (${kit.priceUSD})
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-zinc-950 group-hover:text-[#b8531e] transition-colors">
                      {kit.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-800 leading-relaxed font-light line-clamp-2">
                      {kit.tagline}
                    </p>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {kit.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md border border-orange-200 bg-[#faf5ef] text-[10px] font-mono text-zinc-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Automated Tests & Verification Badge */}
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-orange-200 text-zinc-800">
                    <div className="flex items-center gap-1.5 text-[#b8531e]">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{kit.verification.automatedTestsCount} automated tests passing</span>
                    </div>
                    <span className="text-zinc-600 text-[11px]">
                      {kit.verification.nodeVersion}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex items-center gap-3">
                  <Link href={`/kits/${kit.slug}`} className="flex-1">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-950 bg-[#faf5ef] hover:bg-[#faf5ef] border border-orange-200 hover:border-[#cc6b35] backdrop-blur-md transition-all shadow-sm group/btn"
                    >
                      <Code2 className="h-3.5 w-3.5 text-[#b8531e] group-hover/btn:scale-110 transition-transform" />
                      <span>View Full Spec &amp; Files</span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>

                  <Link href={`/checkout?kitId=${kit.id}`}>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#b8531e] bg-[#f7ece1] hover:bg-[#f7ece1] border border-[#cc6b35] hover:border-[#cc6b35] transition-all shadow-sm"
                    >
                      <Zap className="h-3.5 w-3.5 text-[#b8531e]" />
                      <span>Instant Buy</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredKits.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-orange-200 bg-white backdrop-blur-xl">
              <p className="text-zinc-600 font-mono text-sm">
                No templates matched &quot;{searchQuery}&quot;. Try searching for &quot;razorpay&quot;, &quot;rbac&quot;, or &quot;rag&quot;.
              </p>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER III // 本堂 // THE SACRED CRAFT & AI PROMPT STUDIO
           ══════════════════════════════════════════════════════════════ */}
        <section id="studio" className="min-h-[90vh] flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-8">
          <div className="p-8 sm:p-12 rounded-3xl border border-orange-200 bg-white backdrop-blur-2xl relative overflow-hidden shadow-2xl space-y-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 border-b border-[#cc6b35] pb-1 text-xs font-mono uppercase tracking-[0.25em] text-[#b8531e]">
                <span>03 // 本堂 // The Sacred Craft</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-zinc-950">
                AI Generation Studio &amp; Prompt Blueprints.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-light">
                Turn system requirements into multi-file production repositories. 
                Execute tested prompts through Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro.
              </p>
            </div>

            {/* Prompt Blueprints Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SEED_PROMPTS.slice(0, 2).map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-6 rounded-2xl border border-orange-200 bg-white backdrop-blur-xl hover:border-[#cc6b35] transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full border border-[#cc6b35] bg-[#f7ece1] text-[10px] font-mono text-[#b8531e] uppercase">
                      Prompt Blueprint
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600">
                      <Sparkles className="h-3.5 w-3.5 text-[#b8531e]" />
                      <span>{prompt.supportedModels[0]}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-zinc-950">{prompt.title}</h4>
                    <p className="mt-1 text-xs text-zinc-800 leading-relaxed font-light">
                      {prompt.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf5ef] border border-orange-200 font-mono text-[11px] text-zinc-600 space-y-1">
                    <div className="text-zinc-800 font-semibold">Variables accepted:</div>
                    <div className="flex flex-wrap gap-2 text-[#b8531e]">
                      {prompt.requiredVariables.map((v) => (
                        <span key={v.name}>&#123;&#123;{v.name}&#125;&#125;</span>
                      ))}
                    </div>
                  </div>

                  <Link href={`/prompts/${prompt.slug}`}>
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold bg-[#b8531e] hover:bg-[#b8531e] text-white"
                    >
                      <span>Execute in AI Studio</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Direct Studio Launcher */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-orange-200 bg-[#f7ece1] backdrop-blur-md">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-sm font-bold text-zinc-950">Have a unique specification?</div>
                <div className="text-xs text-zinc-600">Launch the AI studio to generate complete schemas, route handlers, and ZIP packages.</div>
              </div>
              <Link href="/studio">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#b8531e] hover:bg-[#b8531e] shadow-lg shadow-[#e8c3a8] transition-all"
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
        <section id="repos" className="min-h-[90vh] flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-orange-200 pb-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 border-b border-[#cc6b35] pb-1 text-xs font-mono uppercase tracking-[0.25em] text-[#b8531e]">
                <span>04 // 枯山水 // Stillness &amp; Depth</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-zinc-950">
                Open Source Repositories.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-800 font-light leading-relaxed">
                Like the raked gravel of a zen garden, high-performance code demands 
                uncompromising restraint. Browse repositories with live syntax viewing and branch navigation.
              </p>
            </div>

            <Link href="/repos/new">
              <Button
                variant="outline"
                className="text-xs border-orange-200 bg-white text-zinc-950 hover:bg-[#faf5ef] gap-1.5 font-mono"
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
                className="rounded-3xl border border-orange-200 bg-white backdrop-blur-xl p-6 shadow-2xl hover:border-[#cc6b35] hover:bg-white/45 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#b8531e] font-semibold">
                      {repo.ownerUsername}
                    </span>
                    <span className="px-2 py-0.5 rounded-full border border-orange-200 bg-[#faf5ef] text-[10px] font-mono text-zinc-800">
                      {repo.visibility}
                    </span>
                  </div>

                  <Link
                    href={`/${repo.ownerUsername}/${repo.name}`}
                    className="text-lg font-bold text-zinc-950 hover:text-[#b8531e] transition-colors block"
                  >
                    {repo.name}
                  </Link>

                  <p className="text-xs text-zinc-800 leading-relaxed font-light line-clamp-2">
                    {repo.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 pt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-[#b8531e]" />
                      <span>{repo.starsCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5 text-zinc-600" />
                      <span>{repo.forksCount}</span>
                    </div>
                    <div className="text-zinc-600">•</div>
                    <span className="text-zinc-800">{repo.primaryLanguage}</span>
                  </div>
                </div>

                <Link href={`/${repo.ownerUsername}/${repo.name}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-orange-200 text-zinc-900 hover:text-zinc-950 hover:border-[#cc6b35]"
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
        <section id="summit" className="min-h-[85vh] flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 border-b border-red-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-red-700">
              <span>05 // 余光 // Afterlight</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif tracking-tight font-bold text-zinc-950">
              The Summit of DevKit.
            </h2>

            <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-light">
              You have journeyed through the mountain temple. Every system—repositories, 
              verified starter kits, AI prompt workflows, and DLP-protected chat—lives here in one unified ecosystem.
            </p>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4">
            <Link
              href="/repos"
              className="p-5 rounded-2xl border border-orange-200 bg-white backdrop-blur-xl hover:border-[#cc6b35] hover:bg-white transition-all text-left space-y-1"
            >
              <BookMarked className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-bold text-zinc-950">Repositories</div>
              <p className="text-[10px] text-zinc-600">Explore open source code</p>
            </Link>

            <Link
              href="/kits"
              className="p-5 rounded-2xl border border-orange-200 bg-white backdrop-blur-xl hover:border-[#cc6b35] hover:bg-white transition-all text-left space-y-1"
            >
              <ShoppingBag className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-bold text-zinc-950">Marketplace</div>
              <p className="text-[10px] text-zinc-600">Verified starter kits</p>
            </Link>

            <Link
              href="/prompts"
              className="p-5 rounded-2xl border border-orange-200 bg-white backdrop-blur-xl hover:border-[#cc6b35] hover:bg-white transition-all text-left space-y-1"
            >
              <Sparkles className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-bold text-zinc-950">AI Prompts</div>
              <p className="text-[10px] text-zinc-600">Code generation blueprints</p>
            </Link>

            <Link
              href="/chat"
              className="p-5 rounded-2xl border border-orange-200 bg-white backdrop-blur-xl hover:border-[#cc6b35] hover:bg-white transition-all text-left space-y-1"
            >
              <Compass className="h-4 w-4 text-[#b8531e]" />
              <div className="text-xs font-bold text-zinc-950">Support Chat</div>
              <p className="text-[10px] text-zinc-600">3-Panel DLP collaboration</p>
            </Link>
          </div>

          <div className="pt-5 pb-2">
            <a
              href="#hero"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-orange-200 bg-white text-xs font-mono text-zinc-800 hover:text-zinc-950 hover:border-[#cc6b35] transition-all"
            >
              <span>↑ Return to Sanmon Entrance</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
