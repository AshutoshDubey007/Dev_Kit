'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, UserProfileRole } from '../../lib/auth-context';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserProfileRole;
  joined: string;
  sellerListedCount?: number;
}

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr_1',
    name: 'Ashutosh Dubey',
    email: 'ashutosh@agency.dev',
    role: 'buyer',
    joined: 'Oct 2026',
  },
  {
    id: 'usr_2',
    name: 'DevKit Core Creator',
    email: 'creator@devkit.store',
    role: 'seller',
    joined: 'Sep 2026',
    sellerListedCount: 2,
  },
  {
    id: 'usr_3',
    name: 'Sarah Connor',
    email: 'moderator@devkit.store',
    role: 'operator',
    joined: 'Aug 2026',
  },
  {
    id: 'usr_4',
    name: 'Platform Administrator',
    email: 'admin@devkit.store',
    role: 'admin',
    joined: 'Jul 2026',
  },
];

export default function AdminConsolePage() {
  const { currentUser, loginAsRole, openLoginModal } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);

  const toggleUserRole = (userId: string, newRole: UserProfileRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-2xl bg-purple-950/40 border border-purple-800 text-3xl">
          👑
        </div>
        <h1 className="text-2xl font-bold text-white">Administrator Access Required</h1>
        <p className="text-xs text-zinc-400">
          You are currently signed in as <strong className="text-white capitalize">{currentUser?.name} ({currentUser?.role})</strong>. This area is restricted to Platform Administrators.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => loginAsRole('admin')}
            className="text-xs font-semibold bg-purple-600 hover:bg-purple-700"
          >
            ⚡ Switch to Admin Profile
          </Button>
          <Link href="/">
            <Button variant="outline" size="md" className="text-xs">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-xs text-purple-300 font-mono mb-2">
            <span>👑 Root Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Platform Admin Console
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage users, assign Operator moderation roles, view platform revenue, and configure seller fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/operator">
            <Button variant="outline" size="sm" className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-950/30">
              🛡️ Open Operator Desk →
            </Button>
          </Link>
          <Link href="/seller/new-kit">
            <Button variant="outline" size="sm" className="text-xs">
              👨‍💻 Seller Portal →
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Total Product Sales</span>
          <span className="text-2xl font-extrabold text-white block">₹1,54,300</span>
          <span className="text-[10px] text-emerald-400 font-mono">100% verified payouts</span>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Active Members</span>
          <span className="text-2xl font-extrabold text-white block">{users.length} Users</span>
          <span className="text-[10px] text-zinc-500 font-mono">Buyers, Sellers, Staff</span>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Seller Passes Sold</span>
          <span className="text-2xl font-extrabold text-indigo-400 block">14 Passes</span>
          <span className="text-[10px] text-zinc-400 font-mono">₹99/mo listing pass</span>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Moderated Chats</span>
          <span className="text-2xl font-extrabold text-amber-400 block">38 Threads</span>
          <span className="text-[10px] text-amber-300 font-mono">1 contact leak caught</span>
        </div>
      </div>

      {/* User Role Management Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/[0.08] bg-[#121319] flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-zinc-200 uppercase tracking-wider">
            User Role Assignment & Profiles
          </h3>
          <span className="text-xs text-zinc-500 font-mono">{users.length} Accounts Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0f14] text-zinc-400 font-mono uppercase text-[11px] border-b border-white/[0.06]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Assigned Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-white">
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-zinc-400">
                    {u.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        u.role === 'admin'
                          ? 'purple'
                          : u.role === 'operator'
                          ? 'warning'
                          : u.role === 'seller'
                          ? 'success'
                          : 'secondary'
                      }
                      size="sm"
                      className="font-mono text-[10px] uppercase"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 font-mono">
                    {u.joined}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => toggleUserRole(u.id, 'operator')}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                        u.role === 'operator'
                          ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                          : 'border-white/[0.08] text-zinc-400 hover:text-white'
                      }`}
                    >
                      Make Operator
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleUserRole(u.id, 'seller')}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                        u.role === 'seller'
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                          : 'border-white/[0.08] text-zinc-400 hover:text-white'
                      }`}
                    >
                      Make Seller
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleUserRole(u.id, 'buyer')}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                        u.role === 'buyer'
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                          : 'border-white/[0.08] text-zinc-400 hover:text-white'
                      }`}
                    >
                      Make Buyer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
