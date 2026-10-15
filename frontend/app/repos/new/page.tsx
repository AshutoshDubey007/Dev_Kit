'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookMarked,
  Globe,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Github } from '../../../components/icons';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function NewRepositoryPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [initReadme, setInitReadme] = useState(true);
  const [license, setLicense] = useState('MIT');
  const [primaryLanguage, setPrimaryLanguage] = useState('TypeScript');
  const [topicsInput, setTopicsInput] = useState('');
  const [isImport, setIsImport] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ownerUsername = currentUser?.email ? currentUser.email.split('@')[0] : 'ashutoshkdubey007';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const topics = topicsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ownerUsername,
          ownerName: currentUser?.name || ownerUsername,
          ownerAvatar: currentUser?.avatarText,
          description: description.trim() || 'A developer repository on DevKit.',
          visibility,
          topics: topics.length > 0 ? topics : ['nextjs', 'typescript'],
          primaryLanguage,
          isImported: isImport,
          githubUrl: isImport ? githubUrl : undefined,
          license,
          readme: `# ${name}\n\n${description || 'A new developer repository on DevKit.'}\n\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
        }),
      });

      const data = await res.json();
      if (res.ok && data.repository) {
        router.push(`/repos/${ownerUsername}/${data.repository.name}`);
      } else {
        alert(data.error || 'Failed to create repository');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create repository');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
      <div className="border-b border-white/[0.08] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create a New Repository
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          A repository contains all project files, revision history, and can be associated with a marketplace code kit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner & Repository Name */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">Repository Name *</label>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-white/[0.08] bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-400">
              {ownerUsername} /
            </span>
            <Input
              type="text"
              required
              placeholder="my-nextjs-microservice"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
              className="text-xs font-mono flex-1"
            />
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Great repository names are short and memorable. Need inspiration? Try <code>realtime-vector-search</code>.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">
            Description <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Short description of what this project provides..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Primary Language & Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">Primary Language</label>
            <select
              value={primaryLanguage}
              onChange={(e) => setPrimaryLanguage(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-zinc-950 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">Topics (comma separated)</label>
            <Input
              type="text"
              placeholder="nextjs, razorpay, webhooks"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="text-xs font-mono"
            />
          </div>
        </div>

        {/* Visibility: Public vs Private */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-zinc-300">Visibility</label>
          <div className="space-y-2.5">
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                visibility === 'public'
                  ? 'border-blue-500/50 bg-blue-950/20'
                  : 'border-white/[0.08] bg-zinc-950 hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mt-1"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Public</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Anyone on the internet can see this repository. You choose who can commit.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                visibility === 'private'
                  ? 'border-blue-500/50 bg-blue-950/20'
                  : 'border-white/[0.08] bg-zinc-950 hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="mt-1"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Private</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  You choose who can see and commit to this repository.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* GitHub Import Option */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-zinc-300" />
              <span className="text-xs font-bold text-white">Import from GitHub</span>
            </div>
            <input
              type="checkbox"
              checked={isImport}
              onChange={(e) => setIsImport(e.target.checked)}
              className="rounded"
            />
          </div>

          {isImport && (
            <div className="pt-2 space-y-2">
              <label className="block text-[11px] font-mono text-zinc-400">GitHub Repository URL</label>
              <Input
                type="url"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link href="/repos">
            <Button variant="outline" size="md" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || !name.trim()}
            className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? 'Creating Repository...' : 'Create Repository'}
          </Button>
        </div>
      </form>
    </div>
  );
}
