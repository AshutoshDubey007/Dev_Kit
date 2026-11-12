'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, UserProfileRole } from '../../lib/auth-context';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatPriceINR } from '../../lib/utils';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserProfileRole;
  joined: string;
  sellerListedCount?: number;
}

export default function AdminConsolePage() {
  const { currentUser, loginAsRole, openLoginModal } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenueINR: 0,
    paidOrdersCount: 0,
    totalUsersCount: 0,
    publishedKitsCount: 0,
    activeChatThreads: 0,
    flaggedChatThreads: 0,
    generatedProjectsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, usersRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/users'),
      ]);

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        if (mData.metrics) setMetrics(mData.metrics);
      }

      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.users) setUsers(uData.users);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toggleUserRole = async (userEmail: string, newRole: UserProfileRole) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: userEmail, newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.email === userEmail ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-2xl bg-[#f7ece1] border border-[#cc6b35] text-3xl">
          👑
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Administrator Access Required</h1>
        <p className="text-xs text-zinc-600">
          You are currently signed in as <strong className="text-zinc-950 capitalize">{currentUser?.name} ({currentUser?.role})</strong>. This area is restricted to Platform Administrators.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => loginAsRole('admin')}
            className="text-xs font-semibold bg-[#b8531e] hover:bg-[#964115]"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cc6b35] bg-[#f7ece1] px-3 py-1 text-xs text-[#b8531e] font-mono mb-2">
            <span>👑 Root Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
            Platform Admin Console
          </h1>
          <p className="mt-1 text-xs text-zinc-600">
            Authoritative platform revenue, verified users, marketplace catalog audits, and moderation metrics from MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/operator">
            <Button variant="outline" size="sm" className="text-xs border-[#cc6b35] text-[#b8531e] hover:bg-[#f7ece1]">
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

      {/* Metric Cards - Real MongoDB Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-orange-200 bg-white p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-600">Total Verified Sales</span>
          <span className="text-2xl font-extrabold text-zinc-950 block">
            {formatPriceINR(metrics.totalRevenueINR)}
          </span>
          <span className="text-[10px] text-[#b8531e] font-mono">
            {metrics.paidOrdersCount} verified transactions
          </span>
        </div>
        <div className="rounded-xl border border-orange-200 bg-white p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-600">Registered Accounts</span>
          <span className="text-2xl font-extrabold text-zinc-950 block">
            {users.length} Users
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">Buyers, Sellers, Staff</span>
        </div>
        <div className="rounded-xl border border-orange-200 bg-white p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-600">Published Kits</span>
          <span className="text-2xl font-extrabold text-[#b8531e] block">
            {metrics.publishedKitsCount} Kits
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">Verified in catalog</span>
        </div>
        <div className="rounded-xl border border-orange-200 bg-white p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-600">Active Chat Threads</span>
          <span className="text-2xl font-extrabold text-[#b8531e] block">
            {metrics.activeChatThreads} Threads
          </span>
          <span className="text-[10px] text-[#b8531e] font-mono">
            {metrics.flaggedChatThreads} DLP leaks flagged
          </span>
        </div>
      </div>

      {/* User Role Management Table */}
      <div className="rounded-2xl border border-orange-200 bg-white backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-orange-200 bg-[#faf5ef] flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-zinc-900 uppercase tracking-wider">
            User Role Assignment & Profiles
          </h3>
          <span className="text-xs text-zinc-600 font-mono">{users.length} Accounts Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-zinc-600 font-mono uppercase text-[11px] border-b border-orange-200">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Assigned Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 text-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#faf5ef] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-zinc-950">
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-zinc-600">
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
                      className="capitalize font-mono"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 font-mono">
                    {u.joined}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    {u.role !== 'buyer' && (
                      <button
                        onClick={() => toggleUserRole(u.email, 'buyer')}
                        className="text-[11px] text-zinc-600 hover:text-zinc-950 underline decoration-zinc-700"
                      >
                        Set Buyer
                      </button>
                    )}
                    {u.role !== 'seller' && (
                      <button
                        onClick={() => toggleUserRole(u.email, 'seller')}
                        className="text-[11px] text-[#b8531e] hover:text-[#b8531e] underline decoration-emerald-800"
                      >
                        Set Seller
                      </button>
                    )}
                    {u.role !== 'operator' && (
                      <button
                        onClick={() => toggleUserRole(u.email, 'operator')}
                        className="text-[11px] text-[#b8531e] hover:text-[#b8531e] underline decoration-amber-800"
                      >
                        Set Operator
                      </button>
                    )}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleUserRole(u.email, 'admin')}
                        className="text-[11px] text-[#b8531e] hover:text-[#b8531e] underline decoration-purple-800"
                      >
                        Set Admin
                      </button>
                    )}
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
