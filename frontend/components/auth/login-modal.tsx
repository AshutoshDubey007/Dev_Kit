'use client';

import React, { useState } from 'react';
import { useAuth, UserProfileRole, DEMO_PROFILES } from '../../lib/auth-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginAsRole, loginWithEmail, currentUser } = useAuth();
  const [tab, setTab] = useState<'quick' | 'custom'>('quick');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserProfileRole>('buyer');

  if (!isLoginModalOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    loginWithEmail(email, name, selectedRole);
  };

  const roleMeta: Record<UserProfileRole, { label: string; icon: string; desc: string; badgeVariant: 'secondary' | 'purple' | 'success' | 'warning' }> = {
    buyer: {
      label: 'Buyer',
      icon: '👤',
      desc: 'Browse verified code, checkout securely, and chat with sellers for setup support.',
      badgeVariant: 'secondary',
    },
    seller: {
      label: 'Seller',
      icon: '👨‍💻',
      desc: 'List up to 3 free integration kits, provide README support, and earn per sale.',
      badgeVariant: 'success',
    },
    operator: {
      label: 'Operator',
      icon: '🛡️',
      desc: 'Access Operator Desk to monitor buyer-seller chats and review flagged contact-leak attempts.',
      badgeVariant: 'warning',
    },
    admin: {
      label: 'Administrator',
      icon: '👑',
      desc: 'Full platform control: user management, operator roles, fee configuration, and revenue logs.',
      badgeVariant: 'purple',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={closeLoginModal} />

      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0c0d12]/95 p-6 shadow-2xl backdrop-blur-2xl z-10 space-y-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Choose Your Profile</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sign in or switch roles to test different platform permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            className="text-zinc-500 hover:text-white font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-white/[0.08] text-xs">
          <button
            type="button"
            onClick={() => setTab('quick')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              tab === 'quick' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⚡ 1-Click Role Switch
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              tab === 'custom' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ✍️ Custom Login
          </button>
        </div>

        {tab === 'quick' ? (
          /* Quick Demo Profile Grid */
          <div className="space-y-2.5">
            {(Object.keys(DEMO_PROFILES) as UserProfileRole[]).map((role) => {
              const profile = DEMO_PROFILES[role];
              const meta = roleMeta[role];
              const isCurrent = currentUser?.role === role;

              return (
                <div
                  key={role}
                  onClick={() => loginAsRole(role)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrent
                      ? 'border-indigo-500/50 bg-indigo-950/20 shadow-md'
                      : 'border-white/[0.07] bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 border border-white/[0.08]">
                      {meta.icon}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors">
                          {profile.name}
                        </span>
                        <Badge variant={meta.badgeVariant} size="sm" className="text-[10px] uppercase font-mono">
                          {meta.label}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {profile.email}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-zinc-500 group-hover:text-indigo-400 font-mono transition-transform group-hover:translate-x-0.5">
                    {isCurrent ? '✓ Active' : 'Select →'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Credentials Form */
          <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Assign Profile Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['buyer', 'seller', 'operator', 'admin'] as UserProfileRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`p-2.5 rounded-lg border text-left transition-all capitalize ${
                      selectedRole === r
                        ? 'border-indigo-500 bg-indigo-600/20 text-white font-semibold'
                        : 'border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{roleMeta[r].icon} {roleMeta[r].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs font-semibold mt-2 shadow-lg shadow-indigo-600/20"
            >
              Sign In as {roleMeta[selectedRole].label} →
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
