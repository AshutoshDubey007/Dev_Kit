'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Code2,
  DollarSign,
  Plus,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  ArrowRight,
  Info,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { PromptVariable } from '../../../lib/db/prompts';

const AVAILABLE_MODELS = [
  'Claude 3.5 Sonnet',
  'GPT-4o',
  'Gemini 1.5 Pro',
  'DeepSeek-V3',
  'Llama 3.3 70B',
];

const AVAILABLE_FRAMEWORKS = [
  'Next.js 15',
  'React 19',
  'TypeScript',
  'Tailwind CSS',
  'Prisma',
  'Supabase',
  'MongoDB',
  'Razorpay',
  'Docker',
];

export default function NewPromptPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemSolves, setProblemSolves] = useState('');
  const [category, setCategory] = useState<'saas' | 'auth' | 'payments' | 'ai' | 'dashboard' | 'api' | 'mobile' | 'devops'>('saas');
  const [priceINR, setPriceINR] = useState<number>(299);
  const [isPaid, setIsPaid] = useState(true);
  const [selectedModels, setSelectedModels] = useState<string[]>(['Claude 3.5 Sonnet', 'GPT-4o']);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['Next.js 15', 'TypeScript', 'Tailwind CSS']);

  // Dynamic variables
  const [variables, setVariables] = useState<PromptVariable[]>([
    {
      name: 'project_name',
      label: 'Project Name',
      placeholder: 'DocuFlow SaaS',
      defaultValue: 'MySaaS',
      required: true,
    },
    {
      name: 'database_choice',
      label: 'Database Engine',
      placeholder: 'PostgreSQL with Prisma / Supabase',
      defaultValue: 'PostgreSQL',
      required: true,
    },
  ]);

  // Prompt template content
  const [templateContent, setTemplateContent] = useState(`You are an expert staff software engineer.
Generate a complete, production-ready full-stack software application named {{project_name}}.

Technical Requirements:
1. Framework: Next.js 15 App Router with React 19 and TypeScript.
2. Styling: Tailwind CSS with clean dark theme developer UI.
3. Database: {{database_choice}} with strongly typed ORM schema.
4. Authentication & Security: Modern session authentication with protected route middleware.
5. Provide multi-file project outputs with complete file paths and no omitted placeholders.`);

  const [sampleOutput, setSampleOutput] = useState('Synthesizes multi-file codebases, migrations, Route Handlers, and package configurations.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter((m) => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const toggleFramework = (framework: string) => {
    if (selectedFrameworks.includes(framework)) {
      setSelectedFrameworks(selectedFrameworks.filter((f) => f !== framework));
    } else {
      setSelectedFrameworks([...selectedFrameworks, framework]);
    }
  };

  const addVariable = () => {
    const varIndex = variables.length + 1;
    setVariables([
      ...variables,
      {
        name: `custom_var_${varIndex}`,
        label: `Variable ${varIndex}`,
        placeholder: 'e.g. API Base URL',
        defaultValue: '',
        required: false,
      },
    ]);
  };

  const updateVariable = (index: number, field: keyof PromptVariable, value: any) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please specify a title for your prompt blueprint.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please specify a brief description.');
      return;
    }
    if (!templateContent.trim()) {
      setErrorMsg('Please provide the prompt blueprint template content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const username = currentUser?.email ? currentUser.email.split('@')[0] : 'ashutoshkdubey007';
      const authorName = currentUser?.name || 'Ashutosh Dubey';

      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          problemSolves: problemSolves || description,
          category,
          authorUsername: username,
          authorName,
          supportedModels: selectedModels,
          supportedFrameworks: selectedFrameworks,
          requiredVariables: variables,
          templateContent,
          sampleOutput,
          priceINR: isPaid ? priceINR : 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.prompt) {
        router.push(`/prompts/${data.prompt.slug}`);
      } else {
        setErrorMsg(data.error || 'Failed to publish prompt.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to AI Prompt Marketplace</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <span>Publish AI Prompt Blueprint</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Create a reusable software generation prompt with configurable variables, model guidance, and marketplace monetization.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
              1
            </span>
            <span>Blueprint Metadata</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300">Prompt Blueprint Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 15 Fastlane Auth & Stripe Multi-Tenant Architect"
              className="border-white/[0.1] bg-[#141822] text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="saas">Full-Stack SaaS</option>
                <option value="auth">Authentication & Identity</option>
                <option value="payments">Payments & Billing</option>
                <option value="ai">AI & Agentic Workflows</option>
                <option value="dashboard">Admin & Dashboards</option>
                <option value="api">Backend & Route Handlers</option>
                <option value="devops">DevOps & CI/CD Pipelines</option>
                <option value="mobile">React Native & Mobile</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300">Version Tag</label>
              <Input
                value="v1.0.0"
                disabled
                className="border-white/[0.08] bg-[#0e1017] text-xs text-zinc-500 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300">Short Summary *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What does this AI prompt blueprint generate in production?"
              className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300">Problem It Solves</label>
            <textarea
              value={problemSolves}
              onChange={(e) => setProblemSolves(e.target.value)}
              rows={2}
              placeholder="e.g. Cuts down 20+ hours of authentication setup by outputting clean server actions and typed schemas."
              className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* SECTION 2: COMPATIBILITY & MODELS */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
              2
            </span>
            <span>Tested Models & Supported Stack</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300">Supported AI Models</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModels.includes(model);
                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() => toggleModel(model)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-sm'
                        : 'border-white/[0.08] bg-[#141822] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <span className="mr-1.5">✓</span>}
                    {model}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <label className="text-xs font-mono text-zinc-300">Associated Technologies</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FRAMEWORKS.map((fw) => {
                const isSelected = selectedFrameworks.includes(fw);
                return (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => toggleFramework(fw)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-sm'
                        : 'border-white/[0.08] bg-[#141822] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <span className="mr-1.5">✓</span>}
                    {fw}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: CONFIGURABLE VARIABLES */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                3
              </span>
              <span>Configurable Prompt Variables</span>
            </div>
            <Button
              type="button"
              onClick={addVariable}
              variant="outline"
              size="sm"
              className="text-xs border-white/[0.1] text-zinc-300 hover:text-white gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Variable</span>
            </Button>
          </div>

          <p className="text-xs text-zinc-400">
            Define placeholders like <code className="text-purple-400">{'{{project_name}}'}</code> that users will customize in AI Studio before generating code.
          </p>

          <div className="space-y-3">
            {variables.map((v, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-white/[0.08] bg-[#141822] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 font-semibold">
                    {`{{${v.name}}}`}
                  </span>
                  {variables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Variable Key (no spaces)</label>
                    <Input
                      value={v.name}
                      onChange={(e) =>
                        updateVariable(
                          index,
                          'name',
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                        )
                      }
                      placeholder="e.g. project_name"
                      className="border-white/[0.08] bg-zinc-950 text-xs text-white font-mono h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Display Label</label>
                    <Input
                      value={v.label}
                      onChange={(e) => updateVariable(index, 'label', e.target.value)}
                      placeholder="e.g. Project Name"
                      className="border-white/[0.08] bg-zinc-950 text-xs text-white h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Default Value</label>
                    <Input
                      value={v.defaultValue || ''}
                      onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                      placeholder="e.g. DocuFlow"
                      className="border-white/[0.08] bg-zinc-950 text-xs text-white h-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: TEMPLATE BLUEPRINT */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                4
              </span>
              <span>Template Blueprint Prompt *</span>
            </div>
            <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-[10px] font-mono">
              Protected by Paywall Masking
            </Badge>
          </div>

          <div className="space-y-1.5">
            <textarea
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              rows={10}
              placeholder="Write the full AI prompt here using {{variable}} placeholders..."
              className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-4 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 text-xs text-purple-200 flex items-start gap-2.5">
            <Lock className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
            <div>
              <strong className="block font-semibold">Protected Intellectual Property:</strong>
              When published as a paid prompt, DevKit masks the template content on all public APIs. Buyers only unlock the complete template after verified payment via Razorpay.
            </div>
          </div>
        </div>

        {/* SECTION 5: PRICING & MONETIZATION */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
              5
            </span>
            <span>Marketplace Monetization</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPaid(false)}
              className={`p-3.5 rounded-xl border text-xs font-medium transition-all text-left space-y-1 ${
                !isPaid
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-sm'
                  : 'border-white/[0.08] bg-[#141822] text-zinc-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Free Community Blueprint</div>
              <div className="text-[11px] text-zinc-400">
                Open source for all developers. Visible and runnable by anyone.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPaid(true)}
              className={`p-3.5 rounded-xl border text-xs font-medium transition-all text-left space-y-1 ${
                isPaid
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-sm'
                  : 'border-white/[0.08] bg-[#141822] text-zinc-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-white">Paid Commercial Blueprint</div>
              <div className="text-[11px] text-zinc-400">
                Monetize your AI workflow with Razorpay checkout and automated payouts.
              </div>
            </button>
          </div>

          {isPaid && (
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <label className="text-xs font-mono text-zinc-300">Price in Indian Rupees (INR) *</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-zinc-400">₹</span>
                <Input
                  type="number"
                  min="49"
                  max="10000"
                  value={priceINR}
                  onChange={(e) => setPriceINR(Math.max(0, parseInt(e.target.value) || 0))}
                  className="pl-7 text-xs bg-[#141822] border-white/[0.1] text-white font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                Equivalent to approx. ${Math.round(priceINR / 83)} USD. Settlements routed to your configured UPI / Bank account.
              </p>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/prompts">
            <Button variant="outline" type="button" className="text-xs border-white/[0.1] text-zinc-300 hover:text-white">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 shadow-lg shadow-purple-600/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isSubmitting ? 'Publishing Blueprint...' : 'Publish Prompt Blueprint'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
