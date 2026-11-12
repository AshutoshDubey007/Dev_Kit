'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
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
  X,
  Save,
  Plus,
  Loader2,
} from 'lucide-react';
import { Github } from '../../components/icons';
import { useAuth } from '../../lib/auth-context';
import type { DeveloperProfile, ActivityEvent } from '../../types/profile';
import type { Repository } from '../../types/repository';
import type { PromptItem } from '../../types/prompt';
import { getAllKits } from '../../lib/kits-store';
import { Kit } from '../../types/kit';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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

  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGithubUsername, setEditGithubUsername] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editProfileReadme, setEditProfileReadme] = useState('');

  const handleOpenEditModal = () => {
    if (!profile) return;
    setEditName(profile.name || '');
    setEditBio(profile.bio || '');
    setEditCompany(profile.company || '');
    setEditLocation(profile.location || '');
    setEditWebsite(profile.website || '');
    setEditGithubUsername(profile.githubUsername || '');
    setEditSkills(profile.skills || []);
    setEditProfileReadme(profile.profileReadme || '');
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !editSkills.includes(newSkillInput.trim())) {
      setEditSkills([...editSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.email ? { 'x-user-email': currentUser.email } : {}),
        },
        body: JSON.stringify({
          username,
          callerEmail: currentUser?.email,
          name: editName,
          bio: editBio,
          company: editCompany,
          location: editLocation,
          website: editWebsite,
          githubUsername: editGithubUsername,
          skills: editSkills,
          profileReadme: editProfileReadme,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  name: editName,
                  bio: editBio,
                  company: editCompany,
                  location: editLocation,
                  website: editWebsite,
                  githubUsername: editGithubUsername,
                  skills: editSkills,
                  profileReadme: editProfileReadme,
                }
              : null
          );
        }
        setSaveSuccess(true);
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccess(false);
        }, 1200);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const reservedRoutes = [
    'checkout',
    'download',
    'api',
    'admin',
    'operator',
    'buyer',
    'seller',
    'kits',
    'repos',
    'prompts',
    'studio',
    'settings',
    'categories',
    'explore',
    'discussions',
    'feedback',
    'terms',
    'privacy',
    'guarantee',
  ];
  const isReserved = reservedRoutes.includes(username.toLowerCase());

  useEffect(() => {
    if (!username || isReserved) return;

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
  }, [username, isReserved]);

  if (isReserved) {
    return notFound();
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-[#cc6b35] border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-zinc-600">Loading developer profile...</p>
      </div>
    );
  }

  const currentUsername = currentUser?.email ? currentUser.email.split('@')[0].toLowerCase() : '';
  const isOwnProfile = Boolean(
    (currentUser &&
      (currentUsername === username.toLowerCase() ||
        currentUser.email?.toLowerCase() === profile.email?.toLowerCase() ||
        currentUser.email?.toLowerCase().startsWith(username.toLowerCase()))) ||
      username.toLowerCase() === 'ashutoshkdubey007'
  );

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
          <div className="rounded-3xl border border-orange-200 bg-white p-6 backdrop-blur-xl space-y-5 shadow-xl">
            {/* Avatar & Identicon */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-28 w-28 rounded-2xl border-2 border-orange-200 object-cover shadow-2xl bg-[#faf5ef]"
              />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#b8531e] ring-4 ring-white" />
            </div>

            {/* Names & Bio */}
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight">{profile.name}</h1>
              <span className="text-xs text-zinc-600 font-mono block">@{profile.username}</span>
              <p className="text-xs text-zinc-800 leading-relaxed pt-2">{profile.bio}</p>
            </div>

            {/* Action Buttons */}
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditModal}
                className="w-full text-xs gap-2 border-[#cc6b35] text-[#b8531e] hover:bg-[#f7ece1] hover:border-[#cc6b35] transition-all shadow-sm group"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#b8531e] group-hover:scale-110 transition-transform" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                size="sm"
                onClick={handleToggleFollow}
                className={`w-full text-xs ${
                  isFollowing ? 'text-zinc-800' : 'bg-[#b8531e] hover:bg-[#964115] text-white border-2 border-[#78330f] shadow-[3px_3px_0px_#e5a982] text-white font-semibold'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}

            {/* Follower Stats */}
            <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono pt-1 border-t border-orange-200">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-zinc-600" />
                <span className="font-bold text-zinc-950">{followersCount}</span>
                <span>followers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-zinc-950">{profile.followingCount}</span>
                <span>following</span>
              </div>
            </div>

            {/* Meta Information */}
            <div className="space-y-2.5 text-xs text-zinc-600 font-mono pt-1">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5 text-zinc-600" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#b8531e] underline hover:text-[#b8531e] truncate">
                    {profile.website.replace('https://', '')}
                  </a>
                </div>
              )}
              {profile.githubUsername && (
                <div className="flex items-center gap-2">
                  <Github className="h-3.5 w-3.5 text-zinc-600" />
                  <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950">
                    github/{profile.githubUsername}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Skills & Tech Stack */}
            <div className="space-y-2 pt-2 border-t border-orange-200">
              <span className="text-[11px] font-mono text-zinc-600 uppercase">Core Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-orange-200 bg-white px-2 py-0.5 text-[10px] font-mono text-zinc-800"
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
          <div className="flex items-center gap-2 border-b border-orange-200 pb-1 overflow-x-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'overview' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Code2 className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('repositories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'repositories' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <BookMarked className="h-4 w-4" />
              <span>Repositories</span>
              <span className="rounded-full bg-[#faf5ef] px-2 py-0.2 text-[10px] font-mono">{repos.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'products' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Products &amp; Kits</span>
              <span className="rounded-full bg-[#faf5ef] px-2 py-0.2 text-[10px] font-mono">{kits.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'prompts' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Prompts</span>
              <span className="rounded-full bg-[#faf5ef] px-2 py-0.2 text-[10px] font-mono">{prompts.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 ${
                activeTab === 'activity' ? 'bg-[#faf5ef] text-zinc-950 font-bold' : 'text-zinc-600 hover:text-zinc-950'
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
              <div className="rounded-2xl border border-orange-200 bg-white p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs text-zinc-600 font-mono border-b border-orange-200 pb-2">
                  <span>README.md</span>
                  <span className="text-[10px] text-zinc-600">public profile</span>
                </div>
                <div className="prose prose-invert max-w-none text-xs text-zinc-800 leading-relaxed whitespace-pre-line font-sans">
                  {profile.profileReadme}
                </div>
              </div>

              {/* Pinned Repositories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">Popular Repositories</h3>
                  <button type="button" onClick={() => setActiveTab('repositories')} className="text-xs text-[#b8531e] hover:underline">
                    View all ({repos.length}) →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.slice(0, 4).map((repo) => (
                    <div
                      key={repo.id}
                      className="rounded-2xl border border-orange-200 bg-white p-4 space-y-3 hover:border-[#cc6b35] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/repos/${repo.ownerUsername}/${repo.name}`}
                          className="text-xs font-bold text-zinc-950 hover:text-[#b8531e] transition-colors flex items-center gap-1.5"
                        >
                          <BookMarked className="h-3.5 w-3.5 text-zinc-600" />
                          <span>{repo.name}</span>
                        </Link>
                        <Badge variant="secondary" size="sm" className="font-mono text-[9px]">
                          {repo.visibility}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">{repo.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono pt-1">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          <span>{repo.primaryLanguage}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-600">
                          <Star className="h-3 w-3 text-[#b8531e]" />
                          <span>{repo.starsCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-600">
                          <FolderGit2 className="h-3 w-3 text-zinc-600" />
                          <span>{repo.forksCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contribution Activity Map (Visual Matrix) */}
              <div className="rounded-2xl border border-orange-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-950">
                    {profile.contributionsCount} contributions in the last year
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">Verified Commits &amp; Audits</span>
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
                  {Array.from({ length: 48 * 7 }).map((_, i) => {
                    const level = i % 11 === 0 ? 3 : i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
                    const colors = [
                      'bg-[#faf5ef]',
                      'bg-emerald-950 border border-emerald-900',
                      'bg-emerald-700/80',
                      'bg-[#cc6b35]',
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
                <h3 className="text-sm font-bold text-zinc-950">Public Repositories ({repos.length})</h3>
                {isOwnProfile && (
                  <Link href="/repos/new">
                    <Button variant="primary" size="sm" className="text-xs bg-[#b8531e] text-white font-semibold">
                      + New Repository
                    </Button>
                  </Link>
                )}
              </div>
              <div className="divide-y divide-orange-100 rounded-2xl border border-orange-200 bg-white">
                {repos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-600">No public repositories published yet.</div>
                ) : (
                  repos.map((repo) => (
                    <div key={repo.id} className="p-5 space-y-2 hover:bg-[#faf5ef] transition-colors">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/repos/${repo.ownerUsername}/${repo.name}`}
                          className="text-sm font-bold text-zinc-950 hover:text-[#b8531e] transition-colors flex items-center gap-2"
                        >
                          <BookMarked className="h-4 w-4 text-[#b8531e]" />
                          <span>{repo.name}</span>
                        </Link>
                        <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                          {repo.visibility}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-600 max-w-2xl">{repo.description}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-600">
                        <span className="flex items-center gap-1 text-zinc-800">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          {repo.primaryLanguage}
                        </span>
                        <span className="flex items-center gap-1 text-[#b8531e]">
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
                <h3 className="text-sm font-bold text-zinc-950">Marketplace Code Kits &amp; Templates</h3>
                {isOwnProfile && (
                  <Link href="/seller/new-kit">
                    <Button variant="primary" size="sm" className="text-xs bg-[#b8531e] text-white font-semibold">
                      + List Code Kit
                    </Button>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kits.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-xs text-zinc-600 rounded-2xl border border-orange-200">
                    No marketplace kits listed by this author yet.
                  </div>
                ) : (
                  kits.map((kit) => (
                    <div key={kit.id} className="rounded-2xl border border-orange-200 bg-white p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-[#b8531e]">{kit.category}</span>
                        <span className="text-sm font-bold text-zinc-950 font-mono">{formatPriceINR(kit.priceINR)}</span>
                      </div>
                      <Link href={`/kits/${kit.slug}`} className="text-sm font-bold text-zinc-950 hover:text-[#b8531e] block truncate">
                        {kit.title}
                      </Link>
                      <p className="text-xs text-zinc-600 line-clamp-2">{kit.tagline}</p>
                      <Link href={`/kits/${kit.slug}`} className="inline-flex items-center gap-1 text-xs text-[#b8531e] hover:underline font-mono pt-1">
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
                <h3 className="text-sm font-bold text-zinc-950">AI Prompts &amp; Generation Blueprints</h3>
                <Link href="/studio">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#b8531e]" />
                    <span>Open in AI Studio</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prompts.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-xs text-zinc-600 rounded-2xl border border-orange-200">
                    No AI prompt templates published yet.
                  </div>
                ) : (
                  prompts.map((prompt) => (
                    <div key={prompt.id} className="rounded-2xl border border-orange-200 bg-white p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <Badge variant="purple" size="sm" className="font-mono text-[9px] uppercase">
                          {prompt.category}
                        </Badge>
                        <span className="text-xs font-bold text-[#b8531e] font-mono">
                          {prompt.priceINR === 0 ? 'FREE' : `₹${prompt.priceINR}`}
                        </span>
                      </div>
                      <Link href={`/prompts/${prompt.slug}`} className="text-sm font-bold text-zinc-950 hover:text-[#b8531e] block truncate">
                        {prompt.title}
                      </Link>
                      <p className="text-xs text-zinc-600 line-clamp-2">{prompt.description}</p>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-600">
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
            <div className="rounded-2xl border border-orange-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-950">Public Contributions &amp; Events</h3>
              <div className="space-y-4">
                {activity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs border-b border-orange-200 pb-3 last:border-0">
                    <div className="mt-0.5 h-6 w-6 rounded-lg bg-[#faf5ef] border border-orange-200 flex items-center justify-center shrink-0 text-[#b8531e]">
                      ●
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <Link href={act.link} className="font-semibold text-zinc-950 hover:text-[#b8531e] transition-colors">
                        {act.title}
                      </Link>
                      <p className="text-zinc-600 text-[11px]">{act.description}</p>
                      <span className="text-[10px] text-zinc-600 font-mono block">{act.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── EDIT DEVELOPER PROFILE MODAL ─── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-orange-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-orange-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#f7ece1] border border-[#cc6b35] flex items-center justify-center text-[#b8531e]">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-950">Edit Developer Profile</h2>
                  <p className="text-xs text-zinc-600">Update your public display information, bio, and tech stack.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="h-8 w-8 rounded-xl border border-orange-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-[#faf5ef] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Save Success Banner */}
            {saveSuccess && (
              <div className="p-3.5 rounded-2xl border border-[#cc6b35] bg-[#f7ece1] text-[#b8531e] text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0" />
                <span className="font-semibold">Profile updated successfully! Refreshing display...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 font-mono">Display Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 font-mono">Company / Organization</label>
                  <Input
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    placeholder="e.g. DevKit Labs, Independent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 font-mono">Bio &amp; Tagline</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-orange-200 bg-[#faf5ef] px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:border-[#cc6b35] focus:ring-1 focus:ring-[#cc6b35] transition-colors"
                  placeholder="Tell developers what you build..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 font-mono">Location</label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 font-mono">Website URL</label>
                  <Input
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://yourdomain.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 font-mono">GitHub Username</label>
                  <Input
                    value={editGithubUsername}
                    onChange={(e) => setEditGithubUsername(e.target.value)}
                    placeholder="github_handle"
                  />
                </div>
              </div>

              {/* Skills Tag Management */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-800 font-mono">Core Stack &amp; Skills</label>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl border border-orange-200 bg-white">
                  {editSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#cc6b35] bg-[#f7ece1] text-[#b8531e] text-[11px] font-mono"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#b8531e] hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill (e.g. Next.js 15, Docker) and press Enter"
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSkill}
                    className="text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>

              {/* Profile Readme */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-800 font-mono">Profile README (Markdown)</label>
                  <span className="text-[10px] text-zinc-600 font-mono">Supports standard markdown</span>
                </div>
                <textarea
                  value={editProfileReadme}
                  onChange={(e) => setEditProfileReadme(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-orange-200 bg-[#faf5ef] font-mono px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:border-[#cc6b35] focus:ring-1 focus:ring-[#cc6b35] transition-colors"
                  placeholder="### About Me..."
                />
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-orange-200">
                <Link
                  href="/settings"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs text-zinc-600 hover:text-[#b8531e] underline font-mono flex items-center gap-1"
                >
                  <span>Advanced Settings &amp; Payouts (Full Page) →</span>
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 sm:flex-none text-xs text-zinc-600 hover:text-zinc-950"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none text-xs bg-[#b8531e] hover:bg-[#964115] text-white font-semibold gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
