'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  CreditCard,
  Bell,
  Key,
  Globe,
  MapPin,
  Building,
  CheckCircle2,
  Copy,
  RefreshCw,
  Save,
  Plus,
  X,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Github } from '../../components/icons';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

type SettingsTab = 'profile' | 'payouts' | 'notifications' | 'api' | 'security';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('Ashutosh Dubey');
  const [username, setUsername] = useState('ashutoshkdubey007');
  const [bio, setBio] = useState('Full-stack software architect & creator building production Next.js 15 platforms, payments, and AI systems.');
  const [company, setCompany] = useState('DevKit Labs');
  const [location, setLocation] = useState('Bengaluru, India');
  const [website, setWebsite] = useState('https://devkit.store');
  const [githubUsername, setGithubUsername] = useState('ashutoshkdubey007');
  const [profileReadme, setProfileReadme] = useState(`### Hi there, I'm Ashutosh 👋\n\nSoftware engineer specializing in high-performance developer tools, payment gateways, and scalable cloud applications.\n\n- 🔭 Working on: **DevKit Marketplace & AI Studio**\n- 🌱 Exploring: **Agentic AI & Next.js 15 Server Actions**\n- ⚡ Tech Stack: **TypeScript, React 19, MongoDB, Razorpay**`);
  
  // Skills tags
  const [skills, setSkills] = useState<string[]>([
    'Next.js 15',
    'React 19',
    'TypeScript',
    'Node.js',
    'MongoDB',
    'Razorpay',
    'Tailwind CSS',
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Payout Details
  const [payoutUpiId, setPayoutUpiId] = useState('ashutosh@okhdfcbank');
  const [payoutAccountName, setPayoutAccountName] = useState('Ashutosh Dubey');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState('••••••••5492');
  const [payoutIfsc, setPayoutIfsc] = useState('HDFC0001234');
  const [payoutFrequency, setPayoutFrequency] = useState('weekly');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    saleAlerts: true,
    securityAlerts: true,
    chatMessages: true,
  });

  // API Key State
  const [apiKey, setApiKey] = useState('devkit_live_9f8a4e2b1c7d6e5a4b3c2d1e0f');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/webhooks/devkit');

  // Load profile data on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const u = currentUser?.email ? currentUser.email.split('@')[0] : 'ashutoshkdubey007';
        setUsername(u);
        const res = await fetch(`/api/user/profile?username=${u}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            if (p.name) setName(p.name);
            if (p.bio) setBio(p.bio);
            if (p.company) setCompany(p.company);
            if (p.location) setLocation(p.location);
            if (p.website) setWebsite(p.website);
            if (p.githubUsername) setGithubUsername(p.githubUsername);
            if (p.skills && p.skills.length > 0) setSkills(p.skills);
            if (p.profileReadme) setProfileReadme(p.profileReadme);
            if (p.payoutUpiId) setPayoutUpiId(p.payoutUpiId);
            if (p.payoutAccountName) setPayoutAccountName(p.payoutAccountName);
            if (p.apiKey) setApiKey(p.apiKey);
            if (p.notifications) setNotifications(p.notifications);
          }
        }
      } catch (e) {
        console.error('Error fetching profile settings:', e);
      }
    }
    loadProfile();
  }, [currentUser]);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          name,
          bio,
          company,
          location,
          website,
          githubUsername,
          skills,
          profileReadme,
          payoutUpiId,
          payoutAccountName,
          payoutIfsc,
          notifications,
          apiKey,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const regenerateApiKey = () => {
    const chars = '0123456789abcdef';
    let newKey = 'devkit_live_';
    for (let i = 0; i < 26; i++) {
      newKey += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(newKey);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Account Settings</span>
            <Badge variant="outline" className="text-zinc-400 border-zinc-700 font-mono text-[11px]">
              @{username}
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your developer profile, marketplace payouts, notification alerts, and API authentication.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${username}`}>
            <Button variant="outline" size="sm" className="gap-2 text-xs border-white/[0.1] text-zinc-300 hover:text-white">
              <span>View Public Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20"
          >
            {isSaving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? 'Saving Changes...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Your settings and profile updates have been successfully saved to MongoDB.</span>
        </div>
      )}

      {/* Main Grid: Sidebar Tabs + Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <aside className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
              activeTab === 'profile'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Public Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
              activeTab === 'payouts'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payouts & Banking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
              activeTab === 'notifications'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
              activeTab === 'api'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>API Keys & Webhooks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
              activeTab === 'security'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Security & Sessions</span>
          </button>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: PUBLIC PROFILE */}
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Public Developer Profile</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This information will be displayed publicly on your DevKit profile and repository pages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300">Display Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ashutosh Dubey"
                    className="border-white/[0.1] bg-[#141822] text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300">Username</label>
                  <Input
                    value={username}
                    disabled
                    className="border-white/[0.08] bg-[#0e1017] text-xs text-zinc-500 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell the developer community about yourself..."
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Company / Organization</span>
                  </label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="border-white/[0.1] bg-[#141822] text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Location</span>
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="border-white/[0.1] bg-[#141822] text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Website URL</span>
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="border-white/[0.1] bg-[#141822] text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5 text-zinc-500" />
                    <span>GitHub Username</span>
                  </label>
                  <Input
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="github_handle"
                    className="border-white/[0.1] bg-[#141822] text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Skills Editor */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <label className="text-xs font-mono text-zinc-300">Technical Skills & Stack</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#141822] px-2.5 py-1 text-xs text-zinc-300"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-500 hover:text-red-400"
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
                    placeholder="Add a technology (e.g. Next.js 15, PyTorch)..."
                    className="border-white/[0.1] bg-[#141822] text-xs text-white flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    variant="outline"
                    size="sm"
                    className="border-white/[0.1] text-xs text-zinc-300 hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Profile README */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Profile README.md</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Supports Markdown & GFM</span>
                </div>
                <textarea
                  value={profileReadme}
                  onChange={(e) => setProfileReadme(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PAYOUTS & BANKING */}
          {activeTab === 'payouts' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Marketplace Payouts & Settlement</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure where your earnings from kits, repositories, and AI prompts are automatically transferred via Razorpay Route.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Merchant Seller Status</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Razorpay Connected Account: <span className="font-mono text-emerald-400">rzp_acc_devkit_live</span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px]">
                  KYC Verified
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300">Direct UPI ID (Instant Payouts)</label>
                  <Input
                    value={payoutUpiId}
                    onChange={(e) => setPayoutUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="border-white/[0.1] bg-[#141822] text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Instant daily settlements directly to your UPI handle without gateway transfer delay.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">Account Holder Name</label>
                    <Input
                      value={payoutAccountName}
                      onChange={(e) => setPayoutAccountName(e.target.value)}
                      placeholder="Full Name as per Bank Account"
                      className="border-white/[0.1] bg-[#141822] text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300">IFSC Code</label>
                    <Input
                      value={payoutIfsc}
                      onChange={(e) => setPayoutIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="border-white/[0.1] bg-[#141822] text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300">Bank Account Number</label>
                  <Input
                    value={payoutAccountNumber}
                    onChange={(e) => setPayoutAccountNumber(e.target.value)}
                    placeholder="Account Number"
                    className="border-white/[0.1] bg-[#141822] text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-mono text-zinc-300">Payout Schedule</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['daily', 'weekly', 'monthly'].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setPayoutFrequency(freq)}
                        className={`p-2.5 rounded-xl border text-xs font-medium capitalize transition-all ${
                          payoutFrequency === freq
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/[0.08] bg-[#141822] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Notification Preferences</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select which notifications and alerts you receive in-app and via email.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-white/[0.08]">
                <div className="flex items-center justify-between pt-3 first:pt-0">
                  <div>
                    <div className="text-xs font-medium text-white">New Sales & Order Completed</div>
                    <div className="text-[11px] text-zinc-400">
                      Get notified whenever a customer buys your starter kit or prompt blueprint.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.saleAlerts}
                    onChange={(e) => setNotifications({ ...notifications, saleAlerts: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="text-xs font-medium text-white">In-App Chat Messages</div>
                    <div className="text-[11px] text-zinc-400">
                      Alerts when buyers or sellers send you inquiries or support messages.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.chatMessages}
                    onChange={(e) => setNotifications({ ...notifications, chatMessages: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="text-xs font-medium text-white">Security & Secret Scanner Alerts</div>
                    <div className="text-[11px] text-zinc-400">
                      Instant alerts if an uploaded repository contains leaked API tokens or suspicious binaries.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.securityAlerts}
                    onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="text-xs font-medium text-white">Platform News & Feature Releases</div>
                    <div className="text-[11px] text-zinc-400">
                      Monthly digest of DevKit AI Studio models, platform features, and trending kits.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailUpdates}
                    onChange={(e) => setNotifications({ ...notifications, emailUpdates: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API & WEBHOOKS */}
          {activeTab === 'api' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Developer API & Webhooks</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Use this token to interact programmatically with your DevKit repositories, prompts, and sales.
                </p>
              </div>

              {/* Personal Access Token */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-300">Personal Access Token (DevKit PAT)</label>
                <div className="flex gap-2">
                  <Input
                    value={apiKey}
                    readOnly
                    className="border-white/[0.1] bg-[#141822] text-xs font-mono text-zinc-300 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyApiKey}
                    className="border-white/[0.1] text-xs text-zinc-300 hover:text-white"
                  >
                    {apiKeyCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={regenerateApiKey}
                    className="border-white/[0.1] text-xs text-zinc-300 hover:text-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Keep this token confidential. Never expose it in client-side repositories or public commits.
                </p>
              </div>

              {/* Webhook Endpoint */}
              <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                <label className="text-xs font-mono text-zinc-300">Webhook Notification URL</label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://..."
                  className="border-white/[0.1] bg-[#141822] text-xs text-white font-mono"
                />
                <p className="text-[10px] text-zinc-500">
                  DevKit will send POST events for <code className="text-emerald-400">order.paid</code>, <code className="text-emerald-400">repo.starred</code>, and <code className="text-emerald-400">prompt.run</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & SESSIONS */}
          {activeTab === 'security' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Security & Active Sessions</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage your OAuth logins, active device sessions, and account protection.
                </p>
              </div>

              {/* Connected OAuth Accounts */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-zinc-300">Connected Authentication Providers</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#141822]">
                    <div className="flex items-center gap-2.5">
                      <Github className="h-4 w-4 text-white" />
                      <div>
                        <div className="text-xs font-medium text-white">GitHub OAuth</div>
                        <div className="text-[10px] text-zinc-400">Connected as @{githubUsername}</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                      Connected
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#141822]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-blue-400">G</span>
                      <div>
                        <div className="text-xs font-medium text-white">Google Account</div>
                        <div className="text-[10px] text-zinc-400">OAuth Active</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                      Connected
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Active Session */}
              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <div className="text-xs font-mono text-zinc-300">Current Session</div>
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#141822] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-white flex items-center gap-2">
                      <span>Windows • Chrome Browser</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      IP: 103.21.x.x (Bengaluru, India) • Active now
                    </div>
                  </div>
                  <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-[10px]">
                    Current Device
                  </Badge>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-red-500/20 space-y-3">
                <div className="text-xs font-mono text-red-400">Danger Zone</div>
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white">Deactivate Account</div>
                    <div className="text-[11px] text-zinc-400">
                      Permanently unpublish your repositories, kits, and prompt listings.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs shrink-0"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
