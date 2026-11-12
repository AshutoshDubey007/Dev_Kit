'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookMarked,
  Star,
  FolderGit2,
  Eye,
  GitBranch,
  FileCode,
  Folder,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  CircleDot,
  GitPullRequest,
  MessageSquare,
  Settings,
  ExternalLink,
} from 'lucide-react';
import type { Repository } from '../../../../types/repository';
import { useAuth } from '../../../../lib/auth-context';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  message: string;
  time: string;
  content?: string;
}

export default function RepositoryDetailPage() {
  const params = useParams();
  const owner = (params?.owner as string) || '';
  const name = (params?.name as string) || '';

  const { currentUser } = useAuth();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'issues' | 'pulls' | 'discussions'>('code');
  const [isStarred, setIsStarred] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [copiedFile, setCopiedFile] = useState(false);

  useEffect(() => {
    if (owner && name) {
      fetch(`/api/repos/${owner}/${name}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.repository) setRepo(data.repository);
        })
        .catch((e) => console.error('Failed to load repo:', e));
    }
  }, [owner, name]);

  const handleStar = async () => {
    if (!currentUser) {
      alert('Please sign in to star this repository.');
      return;
    }
    if (!repo) return;

    try {
      const res = await fetch('/api/repos/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId: repo.id, shouldStar: !isStarred }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsStarred(!isStarred);
        if (typeof data.starsCount === 'number') {
          setRepo((prev) => (prev ? { ...prev, starsCount: data.starsCount } : null));
        }
      }
    } catch (e) {
      console.error('Failed to toggle star:', e);
    }
  };

  const handleCopyClone = () => {
    const cloneUrl = `https://devkit.store/${owner}/${name}.git`;
    navigator.clipboard.writeText(cloneUrl);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleCopyFileContent = (content?: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // Mock repository file structure
  const files: FileNode[] = [
    {
      name: 'app',
      type: 'folder',
      message: 'feat: App Router Route Handlers and layouts',
      time: '3 hours ago',
    },
    {
      name: 'components',
      type: 'folder',
      message: 'feat: responsive UI components and verification badges',
      time: '1 day ago',
    },
    {
      name: 'lib',
      type: 'folder',
      message: 'fix: HMAC signature calculation and MongoDB connection pool',
      time: 'Yesterday',
    },
    {
      name: 'README.md',
      type: 'file',
      size: '2.4 KB',
      message: 'docs: step-by-step installation instructions',
      time: '2 hours ago',
      content: repo?.readme || `# ${name}\n\nProduction Next.js 15 repository on DevKit.`,
    },
    {
      name: 'package.json',
      type: 'file',
      size: '1.2 KB',
      message: 'chore: bump dependencies to Next.js 15.1 and React 19',
      time: '4 days ago',
      content: JSON.stringify(
        {
          name: name,
          version: '1.0.0',
          private: true,
          scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
          dependencies: { next: '^15.1.0', react: '^19.0.0', 'react-dom': '^19.0.0', typescript: '^5.6.3' },
        },
        null,
        2
      ),
    },
    {
      name: 'tsconfig.json',
      type: 'file',
      size: '640 B',
      message: 'chore: TypeScript 5.6 strict compiler configuration',
      time: '5 days ago',
      content: JSON.stringify(
        {
          compilerOptions: { target: 'ES2022', lib: ['dom', 'dom.iterable', 'esnext'], strict: true, moduleResolution: 'bundler' },
        },
        null,
        2
      ),
    },
  ];

  if (!repo) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-[#cc6b35] border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-zinc-600">Loading repository...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6">
      {/* ─── Top Header: Breadcrumbs & Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-200 pb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
            <BookMarked className="h-5 w-5 text-zinc-600 shrink-0" />
            <Link href={`/${repo.ownerUsername}`} className="font-semibold text-[#b8531e] hover:underline">
              {repo.ownerUsername}
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="font-extrabold text-zinc-950">{repo.name}</span>
            <Badge variant="secondary" size="sm" className="font-mono text-[9px] uppercase ml-1">
              {repo.visibility}
            </Badge>
          </div>
          <p className="text-xs text-zinc-600 max-w-2xl">{repo.description}</p>
        </div>

        {/* Action Counters (Watch, Fork, Star) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-[#faf5ef] px-3 py-1.5 text-xs text-zinc-800 hover:bg-orange-100 transition-colors font-mono"
          >
            <Eye className="h-3.5 w-3.5 text-zinc-600" />
            <span>Watch</span>
            <span className="ml-1 pl-1.5 border-l border-orange-200 text-zinc-600">{repo.watchersCount}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-[#faf5ef] px-3 py-1.5 text-xs text-zinc-800 hover:bg-orange-100 transition-colors font-mono"
          >
            <FolderGit2 className="h-3.5 w-3.5 text-zinc-600" />
            <span>Fork</span>
            <span className="ml-1 pl-1.5 border-l border-orange-200 text-zinc-600">{repo.forksCount}</span>
          </button>

          <button
            type="button"
            onClick={handleStar}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold font-mono transition-colors ${
              isStarred
                ? 'border-[#cc6b35] bg-[#f7ece1] text-[#b8531e]'
                : 'border-orange-200 bg-[#faf5ef] text-zinc-800 hover:text-zinc-950 hover:bg-orange-100'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isStarred ? 'Starred' : 'Star'}</span>
            <span className="ml-1 pl-1.5 border-l border-orange-200 text-zinc-600">{repo.starsCount}</span>
          </button>
        </div>
      </div>

      {/* ─── Contextual Navigation Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-orange-200 text-xs font-medium pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('code');
            setSelectedFile(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'code' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>Code</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'issues' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <CircleDot className="h-4 w-4" />
          <span>Issues</span>
          <span className="rounded-full bg-[#faf5ef] px-2 py-0.2 text-[10px] font-mono">{repo.issuesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pulls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'pulls' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <GitPullRequest className="h-4 w-4" />
          <span>Pull Requests</span>
          <span className="rounded-full bg-[#faf5ef] px-2 py-0.2 text-[10px] font-mono">{repo.pullRequestsCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discussions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'discussions' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Discussions</span>
        </button>
      </div>

      {/* ─── TAB: CODE BROWSER ─── */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main 3 Columns: Branch Bar + Files Table + README */}
          <div className="lg:col-span-3 space-y-4">
            {/* Branch Selector + Clone Code Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs text-zinc-800 font-mono">
                  <GitBranch className="h-3.5 w-3.5 text-zinc-600" />
                  <span>{repo.defaultBranch}</span>
                </div>
                <span className="text-xs text-zinc-600 font-mono">
                  1 branch • 1 release
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyClone}
                  className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-[#faf5ef] px-3 py-1.5 text-xs font-mono text-zinc-800 hover:text-zinc-950 hover:bg-orange-100 transition-colors"
                >
                  {copiedClone ? <Check className="h-3.5 w-3.5 text-[#b8531e]" /> : <Terminal className="h-3.5 w-3.5" />}
                  <span>{copiedClone ? 'Copied Clone URL!' : 'Clone'}</span>
                </button>
              </div>
            </div>

            {/* If a file is selected: Code Viewer */}
            {selectedFile ? (
              <div className="rounded-2xl border border-orange-200 bg-white overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-orange-200 bg-white text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-800">
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-[#b8531e] hover:underline"
                    >
                      {repo.name}
                    </button>
                    <span>/</span>
                    <span className="font-bold text-zinc-950">{selectedFile.name}</span>
                    <span className="text-zinc-600 text-[10px]">({selectedFile.size || 'text'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyFileContent(selectedFile.content)}
                      className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-950"
                    >
                      {copiedFile ? <Check className="h-3 w-3 text-[#b8531e]" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedFile ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-[11px] text-zinc-600 hover:text-zinc-800"
                    >
                      Close ✕
                    </button>
                  </div>
                </div>

                <pre className="p-4 text-xs font-mono text-zinc-900 overflow-x-auto leading-relaxed bg-white">
                  <code>{selectedFile.content || '// Empty file'}</code>
                </pre>
              </div>
            ) : (
              /* Files Table */
              <div className="rounded-2xl border border-orange-200 bg-white overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-orange-200 bg-white text-xs font-mono text-zinc-600">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-950">{repo.ownerUsername}</span>
                    <span className="text-zinc-600">/</span>
                    <span>latest commit on {repo.defaultBranch}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600">History: 24 commits</span>
                </div>

                <div className="divide-y divide-orange-100 text-xs font-mono">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      onClick={() => {
                        if (file.type === 'file') setSelectedFile(file);
                      }}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-[#faf5ef] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-[180px]">
                        {file.type === 'folder' ? (
                          <Folder className="h-4 w-4 text-[#b8531e] fill-blue-400/20 shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-zinc-600 shrink-0" />
                        )}
                        <span className="text-zinc-900 group-hover:text-[#b8531e] transition-colors truncate">
                          {file.name}
                        </span>
                      </div>

                      <span className="text-zinc-600 text-[11px] truncate flex-1 px-4 hidden sm:block">
                        {file.message}
                      </span>

                      <span className="text-zinc-600 text-[10px] shrink-0">{file.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* README Rendering Box */}
            <div className="rounded-2xl border border-orange-200 bg-white p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-orange-200 pb-3 text-xs font-mono text-zinc-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-600" />
                  <span className="font-bold text-zinc-950">README.md</span>
                </div>
                <span className="text-[10px] text-zinc-600">Rendered markdown</span>
              </div>

              <div className="prose prose-invert max-w-none text-xs text-zinc-800 leading-relaxed whitespace-pre-line font-sans">
                {repo.readme}
              </div>
            </div>
          </div>

          {/* Right Sidebar: About, Languages, Topics, Marketplace Link */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-orange-200 bg-white p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono mb-2">About</h3>
                <p className="text-xs text-zinc-800 leading-relaxed">{repo.description}</p>
              </div>

              {/* Marketplace Link Badge if associated */}
              {repo.associatedKitSlug && (
                <div className="rounded-xl border border-[#cc6b35] bg-[#f7ece1] p-3 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#b8531e] font-bold block">
                    ⚡ Production Code Kit
                  </span>
                  <p className="text-[11px] text-zinc-800">
                    A commercially licensed, verified package with instant download is available for this repo.
                  </p>
                  <Link href={`/kits/${repo.associatedKitSlug}`}>
                    <Button variant="primary" size="sm" className="w-full text-xs bg-[#b8531e] text-white font-semibold">
                      Buy &amp; Download Kit
                    </Button>
                  </Link>
                </div>
              )}

              {/* Topics */}
              <div className="space-y-1.5 pt-2 border-t border-orange-200">
                <h4 className="text-[11px] font-mono text-zinc-600 uppercase">Topics</h4>
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-md border border-orange-200 bg-white px-2 py-0.5 text-[10px] font-mono text-[#b8531e]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages Breakdown */}
              <div className="space-y-2 pt-2 border-t border-orange-200">
                <h4 className="text-[11px] font-mono text-zinc-600 uppercase">Languages</h4>
                <div className="w-full bg-[#faf5ef] rounded-full h-2 flex overflow-hidden">
                  <div className="bg-[#b8531e] h-full w-[85%]" />
                  <div className="bg-[#b8531e] h-full w-[12%]" />
                  <div className="bg-amber-500 h-full w-[3%]" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-600 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#b8531e]" />
                    <span>TypeScript 85%</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#b8531e]" />
                    <span>CSS 12%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: ISSUES ─── */}
      {activeTab === 'issues' && (
        <div className="rounded-2xl border border-orange-200 bg-white p-8 text-center space-y-3">
          <CircleDot className="h-8 w-8 text-[#b8531e] mx-auto" />
          <h3 className="text-base font-bold text-zinc-950">Repository Issues &amp; Bug Tracking</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            Report issues, request integrations, or track milestones for {repo.name}.
          </p>
          <Button variant="outline" size="sm" className="text-xs">
            + New Issue
          </Button>
        </div>
      )}

      {/* ─── TAB: PULL REQUESTS ─── */}
      {activeTab === 'pulls' && (
        <div className="rounded-2xl border border-orange-200 bg-white p-8 text-center space-y-3">
          <GitPullRequest className="h-8 w-8 text-[#b8531e] mx-auto" />
          <h3 className="text-base font-bold text-zinc-950">Pull Requests &amp; Code Review</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            Inspect incoming branches, compare file diffs, and review contributions.
          </p>
        </div>
      )}

      {/* ─── TAB: DISCUSSIONS ─── */}
      {activeTab === 'discussions' && (
        <div className="rounded-2xl border border-orange-200 bg-white p-8 text-center space-y-3">
          <MessageSquare className="h-8 w-8 text-[#b8531e] mx-auto" />
          <h3 className="text-base font-bold text-zinc-950">Repository Discussions &amp; Q&amp;A</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            Ask technical implementation questions and share building advice with the author.
          </p>
        </div>
      )}
    </div>
  );
}
