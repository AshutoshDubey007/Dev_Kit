'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Play,
  FileCode,
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Code2,
  FolderTree,
} from 'lucide-react';
import { SEED_PROMPTS } from '../../data/prompts';
import type { PromptItem } from '../../types/prompt';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

function StudioContent() {
  const searchParams = useSearchParams();
  const promptSlugParam = searchParams.get('promptSlug') || '';

  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem>(
    SEED_PROMPTS.find((p) => p.slug === promptSlugParam) || SEED_PROMPTS[0]
  );
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Sonnet');
  const [variables, setVariables] = useState<Record<string, string>>({
    project_name: 'LeadPulse CRM',
    core_features: 'Kanban boards, real-time webhooks, Razorpay subscription billing, and dark mode shadcn/ui',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [projectPlan, setProjectPlan] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [copiedFile, setCopiedFile] = useState(false);

  // Update selected prompt if URL param changes
  useEffect(() => {
    if (promptSlugParam) {
      const found = SEED_PROMPTS.find((p) => p.slug === promptSlugParam);
      if (found) setSelectedPrompt(found);
    }
  }, [promptSlugParam]);

  const handleVariableChange = (name: string, value: string) => {
    setVariables((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProjectPlan(null);
    setGeneratedFiles([]);
    setSelectedFile(null);

    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptSlug: selectedPrompt.slug,
          variables,
          model: selectedModel,
          techStack: selectedPrompt.supportedFrameworks,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProjectPlan(data.projectPlan);
        setGeneratedFiles(data.files);
        if (data.files.length > 0) {
          setSelectedFile(data.files[0]);
        }
      } else {
        alert(data.error || 'Generation failed');
      }
    } catch {
      alert('Error connecting to AI generation service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadAll = () => {
    if (generatedFiles.length === 0) return;
    const bundleText = generatedFiles
      .map(
        (f) => `========================================
FILE: ${f.path}
========================================
${f.content}
`
      )
      .join('\n\n');

    const blob = new Blob([bundleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${variables.project_name || 'project'}-generated-devkit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* ─── Top Studio Banner ─── */}
      <div className="border-b border-white/[0.08] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-blue-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>AI Code Generation Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Project Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Configure prompt blueprints, specify requirements, and generate complete runnable Next.js 15 repositories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/prompts">
            <Button variant="outline" size="sm" className="text-xs">
              Browse Prompts Catalog →
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Studio Workspace: Configuration (Left) + Output Explorer (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Blueprint & Variables Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-6 space-y-5 shadow-xl">
            {/* Prompt Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">Prompt Blueprint</label>
              <select
                value={selectedPrompt.slug}
                onChange={(e) => {
                  const p = SEED_PROMPTS.find((item) => item.slug === e.target.value);
                  if (p) setSelectedPrompt(p);
                }}
                className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                {SEED_PROMPTS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">Target Model Provider</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="Claude 3.5 Sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="GPT-4o">OpenAI GPT-4o</option>
                <option value="Gemini 1.5 Pro">Google Gemini 1.5 Pro</option>
                <option value="DeepSeek-V3">DeepSeek-V3 (Local Engine)</option>
              </select>
            </div>

            {/* Dynamic Prompt Variables */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Blueprint Input Variables
              </span>
              {selectedPrompt.requiredVariables.map((v) => (
                <div key={v.name} className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-300">
                    {v.label} {v.required && <span className="text-red-400">*</span>}
                  </label>
                  <Input
                    type="text"
                    value={variables[v.name] || ''}
                    placeholder={v.placeholder}
                    onChange={(e) => handleVariableChange(v.name, e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              ))}
            </div>

            {/* Run Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full text-xs font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white gap-2 shadow-lg shadow-blue-500/20 py-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Synthesizing Architecture &amp; Files...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Generate Project Files</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Codebase Explorer & File Viewer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {generatedFiles.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#0c0e14]/50 p-16 text-center space-y-3">
              <Bot className="h-10 w-10 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No project files generated yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Choose a prompt blueprint on the left, configure your parameters, and click Generate to produce a full multi-file codebase.
              </p>
            </div>
          ) : (
            /* Output Workspace */
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <FolderTree className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-white">{generatedFiles.length} files generated</span>
                  <span className="text-zinc-600">•</span>
                  <span>{selectedModel}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors font-mono"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Download Bundle</span>
                  </button>

                  <Link href={`/seller/new-kit?title=${encodeURIComponent(variables.project_name || 'My Generated Project')}`}>
                    <Button variant="outline" size="sm" className="text-xs text-emerald-400 border-emerald-500/30">
                      Publish to Marketplace →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Code Viewer Box */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14] overflow-hidden shadow-2xl">
                {/* File Tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.08] bg-[#0e111a] overflow-x-auto text-xs font-mono">
                  {generatedFiles.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                        selectedFile?.path === file.path
                          ? 'bg-blue-600/30 border border-blue-500/40 text-white font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <FileCode className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{file.path}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="ml-auto text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 px-2"
                  >
                    {copiedFile ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedFile ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* File Code Content */}
                <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed max-h-[500px] bg-black/40">
                  <code>{selectedFile?.content}</code>
                </pre>
              </div>

              {/* Architectural Plan Box */}
              {projectPlan && (
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-5 space-y-2 text-xs">
                  <span className="font-bold text-white block">Project Architectural Plan:</span>
                  <div className="text-zinc-300 font-sans leading-relaxed whitespace-pre-line text-xs">
                    {projectPlan}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading AI Studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}
