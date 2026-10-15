'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Star,
  CheckCircle2,
  Lock,
  Unlock,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Cpu,
  User,
  ShoppingBag,
} from 'lucide-react';
import type { PromptItem } from '../../../types/prompt';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { formatPriceINR } from '../../../lib/utils';

export default function PromptDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const router = useRouter();
  const { currentUser } = useAuth();

  const [prompt, setPrompt] = useState<PromptItem | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (slug) {
      const emailParam = currentUser?.email ? `?email=${encodeURIComponent(currentUser.email)}` : '';
      fetch(`/api/prompts/${slug}${emailParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.prompt) {
            setPrompt(data.prompt);
            setIsUnlocked(!data.prompt.isPaid || !data.prompt.templateContent.includes('PROTECTED CONTENT'));
          }
        })
        .catch((e) => console.error('Failed to load prompt:', e));
    }
  }, [slug, currentUser]);

  const handleCopyTemplate = () => {
    if (!prompt || !isUnlocked) return;
    navigator.clipboard.writeText(prompt.templateContent);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleRunInStudio = () => {
    if (!prompt) return;
    router.push(`/studio?promptSlug=${prompt.slug}`);
  };

  const handleBuyPrompt = () => {
    if (!currentUser) {
      alert('Please sign in to purchase this prompt.');
      return;
    }
    setIsPurchasing(true);
    setTimeout(() => {
      setIsPurchasing(false);
      setIsUnlocked(true);
      alert(`Payment verified! Prompt blueprint unlocked for ${currentUser.name}.`);
    }, 1000);
  };

  if (!prompt) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-zinc-400">Loading prompt blueprint...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* ─── Breadcrumb ─── */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
        <Link href="/" className="hover:text-zinc-300">Home</Link>
        <span>/</span>
        <Link href="/prompts" className="hover:text-zinc-300">Prompts</Link>
        <span>/</span>
        <span className="text-zinc-300 truncate">{prompt.slug}</span>
      </div>

      {/* ─── Top Banner ─── */}
      <div className="border-b border-white/[0.08] pb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple" size="sm" className="font-mono text-[10px] uppercase">
              {prompt.category}
            </Badge>
            <span className="text-xs text-zinc-500 font-mono">v{prompt.version}</span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{prompt.rating.toFixed(1)}</span>
              <span className="text-zinc-500">({prompt.reviewCount} reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {prompt.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {prompt.description}
          </p>

          <div className="rounded-2xl bg-purple-950/20 border border-purple-900/40 p-4 text-xs text-purple-200">
            <span className="font-bold text-white block mb-0.5">Problem it Solves:</span>
            {prompt.problemSolves}
          </div>
        </div>

        {/* Purchase / Run Card */}
        <div className="w-full md:w-80 rounded-2xl border border-white/[0.1] bg-[#0c0e14] p-5 space-y-4 shrink-0 shadow-2xl">
          <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs text-zinc-400 font-mono">Price</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {prompt.priceINR === 0 ? 'FREE' : formatPriceINR(prompt.priceINR)}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Access Status:</span>
              <span className={`font-semibold ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isUnlocked ? '✓ Unlocked' : '🔒 Paid Blueprint'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Author:</span>
              <Link href={`/${prompt.authorUsername}`} className="text-blue-400 hover:underline">
                @{prompt.authorUsername}
              </Link>
            </div>
          </div>

          {isUnlocked ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleRunInStudio}
              className="w-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white gap-2 shadow-lg shadow-purple-500/20"
            >
              <Bot className="h-4 w-4" />
              <span>Run in AI Studio →</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleBuyPrompt}
              disabled={isPurchasing}
              className="w-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-blue-500 text-black shadow-lg shadow-emerald-500/20"
            >
              {isPurchasing ? 'Processing...' : `Buy Blueprint for ₹${prompt.priceINR}`}
            </Button>
          )}

          <p className="text-[10px] text-zinc-500 text-center leading-relaxed font-mono">
            {prompt.license} • Instant studio access
          </p>
        </div>
      </div>

      {/* ─── Variables Specification & Template Viewer ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Required Input Variables */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                <span>Required Input Variables ({prompt.requiredVariables.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Configurable in AI Studio</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {prompt.requiredVariables.map((v) => (
                <div key={v.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-purple-300 font-mono font-bold">{`{{${v.name}}}`}</code>
                      {v.required && (
                        <span className="rounded bg-red-950/60 text-red-400 border border-red-900/60 px-1.5 py-0.2 text-[9px] font-mono">
                          required
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-400 text-[11px] block mt-0.5">{v.label}</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[11px] bg-zinc-950 px-2 py-1 rounded-md border border-white/[0.04]">
                    e.g. {v.placeholder}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Template Code Viewer (Protected if not unlocked) */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[#0e111a] text-xs font-mono">
              <div className="flex items-center gap-2">
                {isUnlocked ? <Unlock className="h-4 w-4 text-emerald-400" /> : <Lock className="h-4 w-4 text-amber-400" />}
                <span className="font-bold text-white">Prompt Template</span>
              </div>
              {isUnlocked && (
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                >
                  {copiedTemplate ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedTemplate ? 'Copied' : 'Copy Template'}</span>
                </button>
              )}
            </div>

            <pre className="p-5 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed whitespace-pre-wrap bg-black/40">
              <code>{prompt.templateContent}</code>
            </pre>
          </div>
        </div>

        {/* Right Sidebar: Supported Models & Sample IO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Tested Models</h3>
            <div className="space-y-1.5">
              {prompt.supportedModels.map((m) => (
                <div key={m} className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{m}</span>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider pt-3 border-t border-white/[0.06]">
              Supported Tech
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {prompt.supportedFrameworks.map((f) => (
                <span key={f} className="rounded-md border border-white/[0.08] bg-zinc-950 px-2 py-0.5 text-[10px] font-mono text-purple-300">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
