'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  Search,
  Star,
  Plus,
  FolderGit2,
  Filter,
  Code2,
} from 'lucide-react';
import { Github } from '../../components/icons';
import type { Repository } from '../../types/repository';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../lib/auth-context';

export default function RepositoriesPage() {
  const { currentUser } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/repos')
      .then((res) => res.json())
      .then((data) => {
        if (data.repositories) setRepos(data.repositories);
      })
      .catch((e) => console.error('Failed to load repositories:', e));
  }, []);

  const handleStar = async (repoId: string) => {
    if (!currentUser) {
      alert('Please sign in to star repositories.');
      return;
    }

    const isStarred = starredIds.has(repoId);
    try {
      const res = await fetch('/api/repos/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, shouldStar: !isStarred }),
      });
      if (res.ok) {
        const data = await res.json();
        setStarredIds((prev) => {
          const next = new Set(prev);
          if (!isStarred) next.add(repoId);
          else next.delete(repoId);
          return next;
        });
        if (typeof data.starsCount === 'number') {
          setRepos((prev) =>
            prev.map((r) => (r.id === repoId ? { ...r, starsCount: data.starsCount } : r))
          );
        }
      }
    } catch (e) {
      console.error('Failed to toggle star:', e);
    }
  };

  // Filter repositories
  const filteredRepos = repos.filter((repo) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      repo.name.toLowerCase().includes(q) ||
      repo.description.toLowerCase().includes(q) ||
      repo.ownerUsername.toLowerCase().includes(q) ||
      repo.topics.some((t) => t.toLowerCase().includes(q));

    const matchesLanguage =
      selectedLanguage === 'all' || repo.primaryLanguage.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });

  const allLanguages = Array.from(new Set(repos.map((r) => r.primaryLanguage))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-blue-400 font-mono">
            <span>●</span>
            <span>Developer Codebases &amp; Open Source</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Developer Repositories
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Explore public repositories, inspect code trees, star projects, and fork building blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/repos/new">
            <Button
              variant="primary"
              size="sm"
              className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>New Repository</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a repository by name, topic, or description..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0e14] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[#0c0e14] px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Language: All</option>
            {allLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Repositories List */}
      <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 shadow-xl overflow-hidden">
        {filteredRepos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookMarked className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No repositories match your search</p>
            <p className="text-xs text-zinc-500">Try modifying your keyword query or clear filters.</p>
          </div>
        ) : (
          filteredRepos.map((repo) => {
            const isStarred = starredIds.has(repo.id);
            return (
              <div
                key={repo.id}
                className="p-6 space-y-3 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/${repo.ownerUsername}`}
                      className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                      {repo.ownerUsername}
                    </Link>
                    <span className="text-zinc-600">/</span>
                    <Link
                      href={`/repos/${repo.ownerUsername}/${repo.name}`}
                      className="text-base font-bold text-white hover:text-blue-400 transition-colors"
                    >
                      {repo.name}
                    </Link>
                    <Badge variant="secondary" size="sm" className="font-mono text-[9px] uppercase">
                      {repo.visibility}
                    </Badge>
                    {repo.associatedKitSlug && (
                      <Link href={`/kits/${repo.associatedKitSlug}`}>
                        <Badge variant="success" size="sm" className="font-mono text-[9px]">
                          ⚡ Marketplace Kit Available
                        </Badge>
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">{repo.description}</p>

                  {/* Topics Pills */}
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {repo.topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSearchQuery(t)}
                          className="rounded-md border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-[10px] font-mono text-blue-300 hover:border-blue-500/40"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Meta stats bar */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-zinc-500">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      {repo.primaryLanguage}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      {repo.starsCount}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <FolderGit2 className="h-3.5 w-3.5 text-zinc-500" />
                      {repo.forksCount}
                    </span>
                    <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Star Button */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStar(repo.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold font-mono transition-colors ${
                      isStarred
                        ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                        : 'border-white/[0.1] bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{isStarred ? 'Starred' : 'Star'}</span>
                    <span className="ml-1 pl-1.5 border-l border-white/[0.1] text-zinc-500">{repo.starsCount}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
