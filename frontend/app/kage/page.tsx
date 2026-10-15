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
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const KageCanvas = dynamic(
  () => import('../../components/kage/kage-canvas').then((mod) => mod.KageCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#06080d] z-0 pointer-events-none" aria-hidden="true" />
    ),
  }
);

import { AmbientSoundscape } from '../../components/kage/ambient-audio';
import { Button } from '../../components/ui/button';

export default function KageExperiencePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const soundscapeRef = useRef<AmbientSoundscape | null>(null);

  // Initialize soundscape ref
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

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        const p = Math.max(0, Math.min(1, window.scrollY / scrollable));
        setScrollProgress(p);

        // Determine current chapter (1 to 5)
        const ch = Math.min(5, Math.max(1, Math.floor(p * 5) + 1));
        setCurrentChapter(ch);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const chapterNames = [
    '閾 // THE THRESHOLD',
    '燈籠 // THE LANTERN PATH',
    '本堂 // THE SACRED CRAFT',
    '枯山水 // STILLNESS & DEPTH',
    '余光 // AFTERLIGHT & SUMMIT',
  ];

  return (
    <div className="relative min-h-[500vh] bg-[#06080d] text-white selection:bg-red-500 selection:text-white font-sans antialiased">
      {/* 1. 3D WebGL Background Canvas */}
      <KageCanvas scrollProgress={scrollProgress} />

      {/* 2. Cinematic Vignette & Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(6,8,13,0.85)_100%)]"
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

      {/* 3. FIXED CINEMATIC HUD / TOP BAR */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 md:px-10 border-b border-white/[0.06] backdrop-blur-md bg-[#06080d]/60">
        {/* Brand Mark */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-lg tracking-widest text-red-500 font-bold group-hover:text-red-400 transition-colors">
              影
            </span>
            <span className="text-xs font-mono tracking-[0.25em] text-zinc-300 font-semibold uppercase">
              Kage // DevKit
            </span>
          </Link>
          <span className="hidden sm:inline text-zinc-600 font-mono text-xs">|</span>
          <span className="hidden sm:inline text-[11px] font-mono text-zinc-400">
            Cinematic Night Walk
          </span>
        </div>

        {/* Dynamic Chapter Indicator */}
        <div className="hidden md:flex items-center gap-3 font-mono text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-zinc-200 uppercase tracking-wider font-semibold">
            {chapterNames[currentChapter - 1]}
          </span>
          <span className="text-zinc-600">[{currentChapter}/5]</span>
        </div>

        {/* Controls: Audio Toggle + Return to Standard Platform */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.1] bg-black/40 text-[11px] font-mono text-zinc-300 hover:text-white hover:border-white/[0.25] transition-all"
            title="Toggle procedural night wind soundscape"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-300">Ambient On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
                <span>Ambient Off</span>
              </>
            )}
          </button>

          <Link href="/standard">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-white/[0.12] bg-white/[0.04] text-zinc-200 hover:text-white hover:border-emerald-500/50 gap-1.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Standard UI</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* 4. FIXED BOTTOM BAR (Progress & Coordinates) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 md:px-10 border-t border-white/[0.06] backdrop-blur-md bg-[#06080d]/60 text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-4">
          <span>35.0116° N, 135.7681° E</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="hidden sm:inline">KYOTO MOUNTAIN TEMPLE</span>
        </div>

        {/* Progress Bar */}
        <div className="w-32 sm:w-64 h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 transition-all duration-100"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span>ALT: {420 + Math.round(scrollProgress * 180)}m</span>
          <span className="text-zinc-600">•</span>
          <span className="text-red-400">MOON: 94%</span>
        </div>
      </footer>

      {/* 5. NARRATIVE SCROLL SECTIONS (Overlaying 3D Canvas) */}
      <main className="relative z-20 space-y-[45vh] pt-32 pb-48">
        {/* ─── CHAPTER I: THE THRESHOLD ─── */}
        <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 border-b border-red-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-red-400">
                <span>01 // 閾 // The Threshold</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight font-extrabold leading-[1.08] text-white">
                The Sacred Night Walk into Precision Code.
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed font-sans font-light">
                Ascend beyond ordinary boilerplate into a cinematic developer sanctuary. 
                Procedural Japanese architecture, glowing torii gates, and living code repositories 
                crafted for production Next.js 15, AI generation, and instant Razorpay payments.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#chapter-2"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-red-900/30"
                >
                  <span>Begin Ascent</span>
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </a>

                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.12] bg-black/40 hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all"
                >
                  <span>Explore Directory</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Vertical Kanji Art Column */}
            <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center">
              <div className="[writing-mode:vertical-rl] font-serif text-6xl text-white/[0.12] tracking-[0.4em] select-none pointer-events-none hover:text-white/[0.2] transition-colors">
                影・静寂の山門
              </div>
              <div className="mt-4 p-4 rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-xl text-[11px] font-mono text-zinc-400 space-y-1 w-full max-w-xs">
                <div className="text-white font-semibold flex items-center justify-between">
                  <span>CAMERA_RIG</span>
                  <span className="text-red-400">WAYPOINT_01</span>
                </div>
                <div>TORII_AZIMUTH: 184°</div>
                <div>FOG_EXTINCTION: 0.022</div>
                <div>RENDERER: THREE_R149</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CHAPTER II: THE LANTERN PATH ─── */}
        <section id="chapter-2" className="min-h-[85vh] flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Kanji Sidebar */}
            <div className="lg:col-span-3 hidden lg:flex flex-col items-start">
              <div className="[writing-mode:vertical-rl] font-serif text-5xl text-amber-500/20 tracking-[0.35em] select-none">
                石灯籠の光道
              </div>
            </div>

            {/* Main Editorial Card */}
            <div className="lg:col-span-9 space-y-6">
              <div className="inline-flex items-center gap-2 border-b border-amber-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-amber-400">
                <span>02 // 燈籠 // The Lantern Path</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-white leading-tight">
                Illuminating Battle-Tested Architecture.
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed font-light">
                Each stone lantern along the path represents a verified code kit in our marketplace. 
                Zero synthetic vanity metrics: 100% test-verified Next.js 15 boilerplates, 
                Razorpay idempotency routers, and Supabase RBAC matrices built with authentic developer discipline.
              </p>

              {/* Editorial Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0c0e14]/70 backdrop-blur-xl space-y-2">
                  <div className="text-xs font-mono text-amber-400 uppercase">● Runtime Verified</div>
                  <div className="text-sm font-bold text-white">Next.js 15 &amp; React 19</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Clean audits on Node 20+ with zero peer dependency conflicts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0c0e14]/70 backdrop-blur-xl space-y-2">
                  <div className="text-xs font-mono text-emerald-400 uppercase">● Instant Settlements</div>
                  <div className="text-sm font-bold text-white">Razorpay Route &amp; UPI</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Direct automated payouts to developer bank accounts and UPI handles.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0c0e14]/70 backdrop-blur-xl space-y-2">
                  <div className="text-xs font-mono text-blue-400 uppercase">● DLP Protection</div>
                  <div className="text-sm font-bold text-white">Anti-Leak Chat Shield</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Automatic obfuscation filters guarding against off-platform leakage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CHAPTER III: THE SACRED CRAFT ─── */}
        <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-black/60 backdrop-blur-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 border-b border-red-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-red-400">
                <span>03 // 本堂 // The Sacred Craft</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-white leading-tight">
                AI Generation Studio &amp; Prompt Blueprints.
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                Step into the glowing pavilion where software requirements transform into 
                multi-file production codebases through Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/studio"
                className="p-5 rounded-2xl border border-white/[0.1] bg-[#141822]/80 hover:border-purple-500/50 hover:bg-[#1a202e] transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 font-semibold uppercase">
                    AI Code Studio
                  </span>
                  <Bot className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  Synthesize Multi-File Codebase →
                </div>
                <p className="text-xs text-zinc-400">
                  Generate complete directory structures, Route Handlers, Prisma schemas, and download as clean ZIP archives.
                </p>
              </Link>

              <Link
                href="/prompts"
                className="p-5 rounded-2xl border border-white/[0.1] bg-[#141822]/80 hover:border-amber-500/50 hover:bg-[#1a202e] transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                    Prompt Marketplace
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  Explore Prompt Blueprints →
                </div>
                <p className="text-xs text-zinc-400">
                  Buy, test, version, and monetize software blueprints with protected paywall template encryption.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── CHAPTER IV: STILLNESS & DEPTH ─── */}
        <section className="min-h-[85vh] flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 border-b border-zinc-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-zinc-400">
                <span>04 // 枯山水 // Stillness &amp; Depth</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight font-bold text-white leading-tight">
                The Quiet Discipline of Open Source Repositories.
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed font-light">
                Like the raked gravel of a zen garden, high-performance code requires 
                uncompromising restraint. Browse repositories with live syntax viewing, clone commands, 
                issue tracking, and branch navigation.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Link href="/repos">
                  <Button className="text-xs bg-white text-black hover:bg-zinc-200 font-semibold px-5">
                    Browse Repositories
                  </Button>
                </Link>
                <Link href="/repos/new">
                  <Button variant="outline" className="text-xs border-white/[0.15] text-white hover:bg-white/[0.08]">
                    Create Repository
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 [writing-mode:vertical-rl] font-serif text-5xl text-white/[0.08] tracking-[0.4em] select-none text-right">
              枯山水・無言の真理
            </div>
          </div>
        </section>

        {/* ─── CHAPTER V: AFTERLIGHT & RETURN ─── */}
        <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 border-b border-red-500/40 pb-1 text-xs font-mono uppercase tracking-[0.25em] text-red-400">
              <span>05 // 余光 // Afterlight</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif tracking-tight font-bold text-white">
              The Summit of DevKit.
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
              You have completed the cinematic night walk. Every system you saw—repositories, 
              digital kits, AI generation, and secure messaging—is live and functional.
            </p>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4">
            <Link
              href="/repos"
              className="p-4 rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl hover:border-blue-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <BookMarked className="h-4 w-4 text-blue-400" />
              <div className="text-xs font-bold text-white">Repositories</div>
              <p className="text-[10px] text-zinc-400">Explore open source code</p>
            </Link>

            <Link
              href="/kits"
              className="p-4 rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl hover:border-emerald-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              <div className="text-xs font-bold text-white">Marketplace</div>
              <p className="text-[10px] text-zinc-400">Verified starter kits</p>
            </Link>

            <Link
              href="/prompts"
              className="p-4 rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl hover:border-purple-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <div className="text-xs font-bold text-white">AI Prompts</div>
              <p className="text-[10px] text-zinc-400">Code generation blueprints</p>
            </Link>

            <Link
              href="/chat"
              className="p-4 rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl hover:border-amber-500/40 hover:bg-[#0c0e14] transition-all text-left space-y-1"
            >
              <Compass className="h-4 w-4 text-amber-400" />
              <div className="text-xs font-bold text-white">Support Chat</div>
              <p className="text-[10px] text-zinc-400">3-Panel DLP collaboration</p>
            </Link>
          </div>

          {/* Prominent Return Button */}
          <div className="pt-6">
            <Link href="/standard">
              <Button
                size="lg"
                className="text-xs font-semibold bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded-xl shadow-xl shadow-white/10 gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Return to Standard DevKit Developer UI</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
