'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookMarked,
  ShoppingBag,
  Sparkles,
  Star,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Users,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Code2,
  FolderGit2,
} from 'lucide-react';
import { Github } from '../../components/icons';
import { useAuth } from '../../lib/auth-context';
import type { DeveloperProfile, ActivityEvent } from '../../types/profile';
import type { Repository } from '../../types/repository';
import type { PromptItem } from '../../types/prompt';
import { getAllKits } from '../../lib/kits-store';
import { Kit } from '../../types/kit';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatPriceINR } from '../../lib/utils';

function getDeveloperActivity(username: string): ActivityEvent[] {
  return [
    {
      id: 'act-1',
      username,
      type: 'repo_created',
      title: 'Created repository nextjs-razorpay-pro',
      description: 'Production integration with webhook idempotency and test suites.',
      link: '/repos/devkit-core/nextjs-razorpay-pro',
      date: '2 hours ago',
    },
    {
      id: 'act-2',
      username,
      type: 'kit_published',
      title: 'Published HealthEase Medical Kit',
      description: 'HIPAA-compliant patient appointment booking starter kit.',
      link: '/kits/healthease',
      date: 'Yesterday',
    },
    {
      id: 'act-3',
      username,
      type: 'prompt_published',
      title: 'Released prompt Next.js 15 Complete SaaS Architect',
      description: 'AI blueprint generating multi-tenant SaaS architectures.',
      link: '/prompts/nextjs-15-complete-saas-architect',
      date: '3 days ago',
    },
    {
      id: 'act-4',
      username,
      type: 'star',
      title: 'Starred ai-rag-vector-pipeline',
      description: 'Vector embeddings and Pinecone pipeline.',
      link: '/repos/ai-lab/ai-rag-vector-pipeline',
      date: '1 week ago',
    },
  ];
}

export default function DeveloperProfilePage() {
  const params = useParams();
  const rawUsername = (params?.username as string) || '';
  const username = decodeURIComponent(rawUsername).replace('@', '');

  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'products' | 'prompts' | 'activity'>('overview');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (!username) return;

    fetch(`/api/user/profile?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setFollowersCount(data.profile.followersCount || 0);
        }
      })
      .catch((e) => console.error('Failed to load profile:', e));

    fetch(`/api/repos?owner=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.repositories) setRepos(data.repositories);
      })
      .catch((e) => console.error('Failed to load repos:', e));

    fetch(`/api/prompts?author=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.prompts) setPrompts(data.prompts);
      })
      .catch((e) => console.error('Failed to load prompts:', e));

    const allKits = getAllKits();
    setKits(allKits.filter((k) => k.sellerEmail?.toLowerCase().includes(username.toLowerCase()) || k.id.includes(username)));
  }, [username]);

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-zinc-400">Loading developer profile...</p>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.email?.toLowerCase().startsWith(username.toLowerCase());

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
    setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  const activity = getDeveloperActivity(username);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* ─── Profile Header & Navigation Shell ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left: Developer Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e14]/90 p-6 backdrop-blur-xl space-y-5 shadow-xl">
            {/* Avatar & Identicon */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-28 w-28 rounded-2xl border-2 border-white/[0.1] object-cover shadow-2xl bg-zinc-900"
              />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-[#0c0e14]" />
            </div>

            {/* Names & Bio */}
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-white tracking-tight">{profile.name}</h1>
              <span className="text-xs text-zinc-400 font-mono block">@{profile.username}</span>
              <p className="text-xs text-zinc-300 leading-relaxed pt-2">{profile.bio}</p>
            </div>

            {/* Action Buttons */}
            {isOwnProfile ? (
              <Button variant="outline" size="sm" className="w-full text-xs gap-2">
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                size="sm"
                onClick={handleToggleFollow}
                className={`w-full text-xs ${
                  isFollowing ? 'text-zinc-300' : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}

            {/* Follower Stats */}
            <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono pt-1 border-t border-white/[0.06]">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-zinc-500" />
                <span className="font-bold text-white">{followersCount}</span>
                <span>followers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-white">{profile.followingCount}</span>
                <span>following</span>
              </div>
            </div>

            {/* Meta Information */}
            <div className="space-y-2.5 text-xs text-zinc-400 font-mono pt-1">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5 text-zinc-500" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300 truncate">
                    {profile.website.replace('https://', '')}
                  </a>
                </div>
              )}
              {profile.githubUsername && (
                <div className="flex items-center gap-2">
                  <Github className="h-3.5 w-3.5 text-zinc-500" />
                  <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    github/{profile.githubUsername}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Skills & Tech Stack */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">Core Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-white/[0.08] bg-zinc-950 px-2 py-0.5 text-[10px] font-mono text-zinc-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content Tabs (Overview, Repositories, Products, Prompts, Activity) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'overview' ? 'bg-white/[0.08] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('repositories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'repositories' ? 'bg-white/[0.08] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookMarked className="h-4 w-4" />
              <span>Repositories</span>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.2 text-[10px] font-mono">{repos.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'products' ? 'bg-white/[0.08] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Products &amp; Kits</span>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.2 text-[10px] font-mono">{kits.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'prompts' ? 'bg-white/[0.08] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Prompts</span>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.2 text-[10px] font-mono">{prompts.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'activity' ? 'bg-white/[0.08] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Activity</span>
            </button>
          </div>

          {/* ─── TAB: OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile README Box */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono border-b border-white/[0.06] pb-2">
                  <span>README.md</span>
                  <span className="text-[10px] text-zinc-500">public profile</span>
                </div>
                <div className="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                  {profile.profileReadme}
                </div>
              </div>

              {/* Pinned Repositories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Popular Repositories</h3>
                  <button type="button" onClick={() => setActiveTab('repositories')} className="text-xs text-emerald-400 hover:underline">
                    View all ({repos.length}) →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.slice(0, 4).map((repo) => (
                    <div
                      key={repo.id}
                      className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/70 p-4 space-y-3 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/repos/${repo.ownerUsername}/${repo.name}`}
                          className="text-xs font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                        >
                          <BookMarked className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{repo.name}</span>
                        </Link>
                        <Badge variant="secondary" size="sm" className="font-mono text-[9px]">
                          {repo.visibility}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{repo.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono pt-1">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          <span>{repo.primaryLanguage}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <Star className="h-3 w-3 text-amber-400" />
                          <span>{repo.starsCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <FolderGit2 className="h-3 w-3 text-zinc-500" />
                          <span>{repo.forksCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contribution Activity Map (Visual Matrix) */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {profile.contributionsCount} contributions in the last year
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Verified Commits &amp; Audits</span>
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
                  {Array.from({ length: 48 * 7 }).map((_, i) => {
                    const level = i % 11 === 0 ? 3 : i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
                    const colors = [
                      'bg-white/[0.03]',
                      'bg-emerald-950 border border-emerald-900',
                      'bg-emerald-700/80',
                      'bg-emerald-400',
                    ];
                    return <div key={i} className={`h-2.5 w-2.5 rounded-sm ${colors[level]}`} />;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: REPOSITORIES ─── */}
          {activeTab === 'repositories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Public Repositories ({repos.length})</h3>
                {isOwnProfile && (
                  <Link href="/repos/new">
                    <Button variant="primary" size="sm" className="text-xs bg-emerald-500 text-black font-semibold">
                      + New Repository
                    </Button>
                  </Link>
                )}
              </div>
              <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80">
                {repos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">No public repositories published yet.</div>
                ) : (
                  repos.map((repo) => (
                    <div key={repo.id} className="p-5 space-y-2 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/repos/${repo.ownerUsername}/${repo.name}`}
                          className="text-sm font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
                        >
                          <BookMarked className="h-4 w-4 text-emerald-400" />
                          <span>{repo.name}</span>
                        </Link>
                        <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                          {repo.visibility}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 max-w-2xl">{repo.description}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-500">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          {repo.primaryLanguage}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="h-3.5 w-3.5" />
                          {repo.starsCount}
                        </span>
                        <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: PRODUCTS ─── */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Marketplace Code Kits &amp; Templates</h3>
                {isOwnProfile && (
                  <Link href="/seller/new-kit">
                    <Button variant="primary" size="sm" className="text-xs bg-emerald-500 text-black font-semibold">
                      + List Code Kit
                    </Button>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kits.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-xs text-zinc-500 rounded-2xl border border-white/[0.08]">
                    No marketplace kits listed by this author yet.
                  </div>
                ) : (
                  kits.map((kit) => (
                    <div key={kit.id} className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-emerald-400">{kit.category}</span>
                        <span className="text-sm font-bold text-white font-mono">{formatPriceINR(kit.priceINR)}</span>
                      </div>
                      <Link href={`/kits/${kit.slug}`} className="text-sm font-bold text-white hover:text-emerald-400 block truncate">
                        {kit.title}
                      </Link>
                      <p className="text-xs text-zinc-400 line-clamp-2">{kit.tagline}</p>
                      <Link href={`/kits/${kit.slug}`} className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-mono pt-1">
                        <span>Inspect Kit</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: PROMPTS ─── */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">AI Prompts &amp; Generation Blueprints</h3>
                <Link href="/studio">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Open in AI Studio</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prompts.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-xs text-zinc-500 rounded-2xl border border-white/[0.08]">
                    No AI prompt templates published yet.
                  </div>
                ) : (
                  prompts.map((prompt) => (
                    <div key={prompt.id} className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <Badge variant="purple" size="sm" className="font-mono text-[9px] uppercase">
                          {prompt.category}
                        </Badge>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {prompt.priceINR === 0 ? 'FREE' : `₹${prompt.priceINR}`}
                        </span>
                      </div>
                      <Link href={`/prompts/${prompt.slug}`} className="text-sm font-bold text-white hover:text-purple-400 block truncate">
                        {prompt.title}
                      </Link>
                      <p className="text-xs text-zinc-400 line-clamp-2">{prompt.description}</p>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500">
                        <span>v{prompt.version}</span>
                        <span>{prompt.salesCount} runs</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: ACTIVITY ─── */}
          {activeTab === 'activity' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Public Contributions &amp; Events</h3>
              <div className="space-y-4">
                {activity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs border-b border-white/[0.04] pb-3 last:border-0">
                    <div className="mt-0.5 h-6 w-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-emerald-400">
                      ●
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <Link href={act.link} className="font-semibold text-white hover:text-emerald-400 transition-colors">
                        {act.title}
                      </Link>
                      <p className="text-zinc-400 text-[11px]">{act.description}</p>
                      <span className="text-[10px] text-zinc-500 font-mono block">{act.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
