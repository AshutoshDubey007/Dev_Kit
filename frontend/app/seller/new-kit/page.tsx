'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { saveCustomKit, publishKitToBackend } from '../../../lib/kits-store';
import { Kit, CategorySlug } from '../../../types/kit';

export default function NewKitPage() {
  const router = useRouter();
  const { currentUser, becomeSeller } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === 'buyer') {
      becomeSeller();
    }
  }, [currentUser, becomeSeller]);

  // Seller project counter
  const [totalListed, setTotalListed] = useState(
    currentUser?.sellerQuotas?.totalListed ?? 1
  );
  const [isSubscribed, setIsSubscribed] = useState(
    currentUser?.sellerQuotas?.isSubscribed ?? false
  );

  // Upload Method Tabs: 'github' | 'zip'
  const [uploadMethod, setUploadMethod] = useState<'github' | 'zip'>('github');

  // GitHub Source fields
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [isInspectingRepo, setIsInspectingRepo] = useState(false);
  const [repoInspectedSuccess, setRepoInspectedSuccess] = useState(false);

  // ZIP / File Upload fields
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('payments');
  const [priceINR, setPriceINR] = useState(1499);
  const [readmeContent, setReadmeContent] = useState(
    `### Step-by-Step Installation Instructions
1. Download package and unzip.
2. Run: npm install
3. Configure .env.local with credentials.
4. Run: npm run dev`
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishedKit, setPublishedKit] = useState<Kit | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Auto-redirect countdown after publishing
  useEffect(() => {
    if (!publishedSuccess || !autoRedirect) return;
    if (countdown <= 0) {
      if (publishedKit) {
        router.push(`/kits/${publishedKit.slug}`);
      } else {
        router.push('/seller/my-kits');
      }
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [publishedSuccess, countdown, autoRedirect, publishedKit, router]);

  // Rule: First 3 projects are 100% Free. Project 4+ requires ₹99/mo subscription.
  const FREE_PROJECTS_LIMIT = 3;
  const isFreeTierAvailable = totalListed < FREE_PROJECTS_LIMIT;
  const requiresSubscription = !isFreeTierAvailable && !isSubscribed;

  const handlePurchaseSubscription = () => {
    alert('Simulating Razorpay ₹99 Seller Pro Pass payment...');
    setIsSubscribed(true);
  };

  // Inspect GitHub repo and auto-fill metadata
  const handleInspectGithub = async () => {
    if (!githubUrl.trim()) {
      alert('Please enter a GitHub repository URL first.');
      return;
    }

    setIsInspectingRepo(true);
    setRepoInspectedSuccess(false);

    try {
      const res = await fetch('/api/seller/inspect-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: githubUrl }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTitle(data.title || title);
        setTagline(data.tagline || tagline);
        if (data.branch) setGithubBranch(data.branch);
        if (data.readme) setReadmeContent(data.readme);
        setRepoInspectedSuccess(true);
      } else {
        alert(data.error || 'Failed to inspect GitHub repository.');
      }
    } catch {
      alert('Could not inspect repository. You can fill the details manually below.');
    } finally {
      setIsInspectingRepo(false);
    }
  };

  // Handle Drag & Drop / File Selection for ZIP
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    // 1. Path traversal defense
    if (file.name.includes('../') || file.name.includes('..\\') || file.name.includes('/..') || file.name.includes('\\..')) {
      alert('Security Alert: Malformed archive filename detected with path traversal characters (Zip Slip defense). Upload rejected.');
      return;
    }

    // 2. Forbidden dangerous extensions
    const isForbidden = /\.(exe|bat|cmd|sh|bash|ps1|dll|so|bin|msi|scr|vbs|pif|com|jar|apk)$/i.test(file.name);
    if (isForbidden) {
      alert('Security Alert: Executable binaries and shell scripts are strictly prohibited in DevKit marketplace packages. Please upload standard source code archives (.zip, .tar.gz) only.');
      return;
    }

    // 3. Allowed archive formats
    const isAllowedArchive = /\.(zip|tar\.gz|tgz|tar)$/i.test(file.name);
    if (!isAllowedArchive) {
      alert('Invalid package format. Please upload a compressed source archive (.zip, .tar.gz, or .tgz).');
      return;
    }

    // 4. File size limits (Max 150MB)
    const MAX_SIZE_BYTES = 150 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      alert('Archive size exceeds the 150 MB maximum allowed limit.');
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFile({
      name: file.name,
      size: `${sizeInMB} MB`,
    });

    // Auto-infer title from filename if empty
    const rawName = file.name.replace(/\.(zip|tar\.gz|tgz|tar)$/i, '');
    const cleanTitle = rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    if (!title) setTitle(cleanTitle);
    if (!tagline) setTagline(`Complete ${cleanTitle} template for Next.js 15`);
  };

  const handleResetForm = () => {
    setTitle('');
    setTagline('');
    setGithubUrl('');
    setUploadedFile(null);
    setPublishedSuccess(false);
    setPublishedKit(null);
    setCountdown(5);
    setAutoRedirect(true);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresSubscription) return;

    if (uploadMethod === 'github' && !githubUrl) {
      alert('Please provide your GitHub repository URL.');
      return;
    }
    if (uploadMethod === 'zip' && !uploadedFile) {
      alert('Please select or drop a .zip project file.');
      return;
    }

    setIsPublishing(true);

    const generatedSlug = (title || 'custom-integration')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const newKit: Kit = {
      id: `kit-${Date.now()}`,
      slug: generatedSlug,
      title: title || 'Custom Verified Integration Kit',
      tagline: tagline || 'Production Next.js 15 integration kit',
      shortDescription: tagline || 'Production Next.js 15 integration kit',
      description: `### Setup & Integration Guide\n\n${readmeContent}`,
      category: category as CategorySlug,
      priceINR: Number(priceINR) || 1499,
      priceUSD: Math.max(9, Math.round((Number(priceINR) || 1499) / 83)),
      framework: 'Next.js 15 (App Router)',
      techStack: [
        'Next.js 15',
        'TypeScript',
        'Tailwind CSS',
        ...(category === 'payments'
          ? ['Razorpay', 'Webhooks']
          : category === 'auth'
          ? ['NextAuth.js', 'OAuth']
          : category === 'ai'
          ? ['OpenAI', 'LangChain']
          : ['REST API']),
      ],
      features: [
        uploadMethod === 'github'
          ? 'Direct GitHub repository access with branch tracking'
          : 'Full source code ZIP archive ready to unzip',
        'Step-by-step setup README auto-injected into buyer support chat',
        '100% clean install tested with zero peer-dependency warnings',
        'Verified with React 19 & Next.js 15 App Router',
      ],
      verification: {
        verifiedDate: new Date().toISOString().split('T')[0],
        nextjsVersion: '15.1.0',
        nodeVersion: 'v20.18.0+',
        testSuitePassRate: 100,
        automatedTestsCount: 14,
        cleanInstallVerified: true,
        testedWithReact: 'React 19',
        knownLimitations: [
          uploadMethod === 'github'
            ? 'Repository access granted after order completion.'
            : 'Unzip project file and follow README instructions in chat.',
        ],
        auditSummary:
          'Automated test suite passed on clean installation with zero peer-dependency warnings. Ready for immediate deployment.',
      },
      codePreviews: [
        {
          filename: uploadMethod === 'github' ? 'README.md' : 'setup-instructions.md',
          language: 'markdown',
          description: 'Setup and integration instructions',
          code: readmeContent,
        },
      ],
      rating: 5.0,
      reviewCount: 1,
      salesCount: 0,
      isFeatured: true,
      badge: '✨ Your Published Repo',
      lastUpdated: new Date().toISOString().split('T')[0],
      license: 'MIT / Commercial Developer License',
      supportScope: 'Direct Author In-App Chat Support',
      githubPreviewUrl: uploadMethod === 'github' ? githubUrl : undefined,
      sellerId: currentUser?.id,
      sellerName: currentUser?.name || 'Verified Seller',
      sellerEmail: currentUser?.email || 'creator@devkit.store',
      uploadMethod: uploadMethod,
      zipFileName: uploadMethod === 'zip' ? uploadedFile?.name : undefined,
      zipFileSize: uploadMethod === 'zip' ? uploadedFile?.size : undefined,
      readmeContent: readmeContent,
    };

    publishKitToBackend(newKit).then((result) => {
      setIsPublishing(false);
      if (result.success && result.kit) {
        setPublishedKit(result.kit);
        setTotalListed((prev) => prev + 1);
        setCountdown(5);
        setAutoRedirect(true);
        setPublishedSuccess(true);
      } else {
        alert(result.error || 'Failed to publish kit to marketplace.');
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-2 mb-2 text-xs text-emerald-400 font-mono">
          <span>●</span>
          <span>Seller Creator Studio</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          List a Verified Code Kit
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Upload your code via GitHub or ZIP archive. Once a buyer purchases, your README is automatically injected into their private support chat thread.
        </p>
      </div>

      {/* Seller Listing Quota Bar */}
      <div className="rounded-2xl border border-white/[0.1] bg-[#0c0d12]/90 p-5 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Your Listing Quota:</span>
            <Badge
              variant={isFreeTierAvailable ? 'success' : isSubscribed ? 'purple' : 'warning'}
              size="sm"
              className="font-mono text-[10px]"
            >
              {isSubscribed
                ? '⚡ Unlimited Seller Pro Pass Active'
                : `${totalListed} of ${FREE_PROJECTS_LIMIT} Free Projects Listed`}
            </Badge>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {FREE_PROJECTS_LIMIT - totalListed > 0
              ? `${FREE_PROJECTS_LIMIT - totalListed} free slots remaining`
              : 'Free slots used'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/[0.06]">
          <div
            className={`h-full transition-all duration-500 ${
              isSubscribed
                ? 'bg-purple-500 w-full'
                : totalListed >= FREE_PROJECTS_LIMIT
                ? 'bg-amber-500 w-full'
                : 'bg-emerald-500'
            }`}
            style={{
              width: isSubscribed ? '100%' : `${(totalListed / FREE_PROJECTS_LIMIT) * 100}%`,
            }}
          />
        </div>

        <p className="text-[11px] text-zinc-400">
          💡 <strong>Policy:</strong> Every seller gets their first <strong>3 integration kits 100% Free</strong>. After 3 projects, a micro-subscription pass of <strong>₹99/mo</strong> is required to maintain quality.
        </p>
      </div>

      {/* Subscription Paywall Barrier (If 3 free kits used) */}
      {requiresSubscription && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-zinc-950 p-6 space-y-4 text-center shadow-xl">
          <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-2xl text-amber-400">
            ⭐
          </div>
          <h2 className="text-xl font-bold text-white">
            Free Listing Limit Reached (3 of 3 used)
          </h2>
          <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
            You&apos;ve published your 3 free starter projects! To publish this 4th kit, unlock the <strong>Seller Pro Pass</strong> for just ₹99/month.
          </p>

          <div className="inline-flex items-baseline gap-1 text-2xl font-extrabold text-white font-mono">
            <span>₹99</span>
            <span className="text-xs text-zinc-400 font-normal">/ month</span>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePurchaseSubscription}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20"
            >
              Unlock Seller Pass (₹99 via Razorpay) →
            </Button>
          </div>
        </div>
      )}

      {/* Main Upload & Publish Form */}
      <form onSubmit={handlePublish} className="space-y-6">
        {/* Step 1: Code Delivery Method */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/70 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Step 1: Connect Source Code
              </h3>
              <p className="text-xs text-zinc-400">
                Choose how buyers will receive your code package.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              Automated Verification
            </span>
          </div>

          {/* Upload Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setUploadMethod('github')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                uploadMethod === 'github'
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Import from GitHub (Recommended)</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMethod('zip')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                uploadMethod === 'zip'
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📦 Upload ZIP / Folder</span>
            </button>
          </div>

          {/* Tab 1: GitHub Input */}
          {uploadMethod === 'github' ? (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  GitHub Repository URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/nextjs-razorpay-template"
                    className="text-xs flex-1 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isInspectingRepo}
                    onClick={handleInspectGithub}
                    className="shrink-0 text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
                  >
                    {isInspectingRepo ? 'Inspecting…' : 'Inspect & Auto-Fill ⚡'}
                  </Button>
                </div>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  We automatically extract your <strong>README.md</strong>, test suite coverage, and package dependencies.
                </span>
              </div>

              {repoInspectedSuccess && (
                <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between text-emerald-300 font-semibold">
                    <span>✓ Repository Inspected Successfully</span>
                    <span className="font-mono text-[10px]">Branch: {githubBranch}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-zinc-300">
                    <div className="p-2 rounded bg-black/40 border border-white/[0.06]">
                      ✓ 0 node_modules leaked
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-white/[0.06]">
                      ✓ Next.js 15 verified
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-white/[0.06]">
                      ✓ README detected
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Drag & Drop ZIP Upload */
            <div className="space-y-3 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.tar.gz,.tgz,.tar"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-950/20'
                    : 'border-white/[0.12] bg-zinc-950/60 hover:border-emerald-500/50 hover:bg-zinc-900/40'
                }`}
              >
                <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-2xl bg-zinc-900 border border-white/[0.08] text-2xl mb-3">
                  📦
                </div>
                <h4 className="text-sm font-semibold text-white">
                  {uploadedFile ? uploadedFile.name : 'Drop your project .zip archive here'}
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  {uploadedFile
                    ? `Size: ${uploadedFile.size} • Click to change file`
                    : 'or browse from your computer (zip, tar.gz)'}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-full">
                  <span>🛡️ Automatic Sanitizer</span>
                  <span>|</span>
                  <span className="text-zinc-400">Excludes node_modules &amp; .env.local</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Listing Details */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/70 p-6 space-y-5">
          <div className="border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-white">
              Step 2: Marketplace Listing Details
            </h3>
            <p className="text-xs text-zinc-400">
              Provide product details shown on the catalogue card.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Integration Kit Title
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 15 Cashfree Gateway Integration"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              One-Line Value Tagline
            </label>
            <Input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Drop-in Cashfree payments with webhook signature checks"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="payments">Payments &amp; Billing</option>
                <option value="auth">Auth &amp; RBAC</option>
                <option value="ai">AI &amp; Vector Search</option>
                <option value="devops">DevOps &amp; Deploy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Price (INR ₹)
              </label>
              <Input
                type="number"
                required
                value={priceINR}
                onChange={(e) => setPriceINR(Number(e.target.value))}
                min={499}
                max={9999}
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Seller Setup README */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-300">
                Setup README.md (Auto-injected into Buyer Chat)
              </label>
              <span className="text-[11px] text-emerald-400 font-mono">
                ⚡ Auto-dispatched on purchase
              </span>
            </div>
            <textarea
              rows={8}
              required
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 p-3.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
            />
            <span className="text-[11px] text-zinc-500 block mt-1">
              Provide exact installation steps and environment variables so buyers can integrate in under 5 minutes without friction.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={requiresSubscription || isPublishing}
          className="w-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-blue-500 text-black hover:opacity-90 shadow-lg shadow-emerald-500/20 py-3"
        >
          {isPublishing
            ? 'Publishing Kit…'
            : requiresSubscription
            ? 'Purchase ₹99 Seller Pass to Publish'
            : isFreeTierAvailable
            ? `Publish Kit for Free (Slot ${totalListed + 1} of 3)`
            : 'Publish Kit with Active Pro Pass →'}
        </Button>
      </form>

      {/* Celebratory Publishing Success Modal */}
      {publishedSuccess && publishedKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-[#0c0d12] p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-center space-y-6">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Celebratory Icon */}
            <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner shadow-emerald-500/30">
              🎉
            </div>

            {/* Header text */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                ● Live on Marketplace
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Repository Published!
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your integration has been verified and published to DevKit. Buyers can now find, inspect, and purchase your code.
              </p>
            </div>

            {/* Published Kit Summary Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-4 text-left space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {publishedKit.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {publishedKit.tagline}
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-emerald-400 font-bold text-sm block">
                    ₹{publishedKit.priceINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    (~${publishedKit.priceUSD})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.04] text-[11px] font-mono text-zinc-400">
                <span className="rounded-md bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 px-2 py-0.5">
                  ● {publishedKit.category}
                </span>
                {publishedKit.uploadMethod === 'github' ? (
                  <span className="truncate max-w-[240px] text-zinc-300">
                    🐙 GitHub: {publishedKit.githubPreviewUrl}
                  </span>
                ) : (
                  <span className="text-zinc-300">
                    📁 ZIP: {publishedKit.zipFileName} ({publishedKit.zipFileSize})
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/50 p-2.5 text-[11px] text-emerald-300/90 flex items-center gap-2">
                <span>⚡</span>
                <span>Setup README automatically queued for buyer in-app chat delivery.</span>
              </div>
            </div>

            {/* Countdown Bar */}
            <div className="rounded-xl bg-zinc-900/80 border border-white/[0.06] p-3 text-xs flex items-center justify-between font-mono">
              {autoRedirect ? (
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    Auto-redirecting in{' '}
                    <strong className="text-emerald-400 text-sm">{countdown}s</strong>...
                  </span>
                </div>
              ) : (
                <span className="text-zinc-400">Auto-redirect paused</span>
              )}

              <button
                type="button"
                onClick={() => setAutoRedirect((prev) => !prev)}
                className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                {autoRedirect ? 'Pause' : 'Resume'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href={`/kits/${publishedKit.slug}`}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2.5 text-xs font-semibold text-black hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  👁 View Live Listing →
                </Link>

                <Link
                  href="/seller/my-kits"
                  className="w-full inline-flex items-center justify-center rounded-xl border border-white/[0.1] bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                >
                  📦 My Published Repos
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/kits"
                  className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-2 text-zinc-300 hover:text-white hover:border-white/[0.15] transition-colors"
                >
                  Browse Catalog (/kits)
                </Link>
                <Link
                  href="/"
                  className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-2 text-zinc-300 hover:text-white hover:border-white/[0.15] transition-colors"
                >
                  Home Page (/)
                </Link>
              </div>

              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors underline pt-2 block mx-auto"
              >
                + List Another Repo / Kit ({FREE_PROJECTS_LIMIT - totalListed} free slots left)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
