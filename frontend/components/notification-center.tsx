'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  ShoppingBag,
  MessageSquare,
  Star,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';
import type { NotificationItem } from '../types/notification';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {
        setNotifications([]);
      });
  }, []);

  // Close when clicking outside on desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkSingleRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />;
      case 'chat':
        return <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />;
      case 'star':
        return <Star className="h-3.5 w-3.5 text-amber-400" />;
      case 'security':
        return <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-cyan-400" />;
    }
  };

  const formatRelativeTime = (date: string | Date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
          isOpen
            ? 'border-emerald-500/50 bg-emerald-950/30 text-white shadow-sm shadow-emerald-500/20'
            : 'border-white/[0.08] bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-white/[0.2]'
        }`}
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black ring-2 ring-[#0c0d12] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Dimmed Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Popover Panel */}
      {isOpen && (
        <div
          className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-2xl border border-white/[0.1] bg-[#0c0e14] shadow-2xl shadow-black/90 backdrop-blur-2xl z-50 overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] bg-zinc-950/80 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors py-0.5 px-1.5 rounded hover:bg-white/[0.04]"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mark read</span>
                  </button>
                )}
                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs: All vs Unread */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900/80 border border-white/[0.04] text-[11px]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 px-2.5 rounded-md text-center transition-all ${
                  filter === 'all'
                    ? 'bg-white/[0.1] text-white font-medium shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`flex-1 py-1 px-2.5 rounded-md text-center transition-all ${
                  filter === 'unread'
                    ? 'bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List of Notification Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-1.5">
                <span className="text-sm block">✨</span>
                <p className="text-xs text-zinc-300 font-medium">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  {filter === 'unread'
                    ? 'You have answered all incoming order and support updates.'
                    : 'You will receive notifications here about purchases, messages, and security scans.'}
                </p>
                {filter === 'unread' && notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono underline pt-1"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`group relative rounded-xl transition-all ${
                    !item.read
                      ? 'bg-white/[0.03] hover:bg-white/[0.06]'
                      : 'hover:bg-white/[0.02] opacity-80 hover:opacity-100'
                  }`}
                >
                  <Link
                    href={item.link}
                    onClick={() => {
                      if (!item.read) handleMarkSingleRead(item.id);
                      setIsOpen(false);
                    }}
                    className="block p-3 sm:p-3.5 pr-8"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="mt-0.5 h-7 w-7 rounded-lg bg-[#141822] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-sm">
                        {getIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-semibold text-white truncate max-w-[190px] sm:max-w-[210px]">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Actions / Unread Pip */}
                  <div className="absolute right-2.5 top-3.5 flex items-center gap-1">
                    {!item.read ? (
                      <button
                        type="button"
                        onClick={(e) => handleMarkSingleRead(item.id, e)}
                        className="h-5 w-5 rounded-md hover:bg-white/[0.1] text-zinc-400 hover:text-emerald-400 flex items-center justify-center transition-colors"
                        title="Mark as read"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse group-hover:hidden" />
                        <Check className="h-3 w-3 hidden group-hover:block" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] bg-zinc-950/60 flex items-center justify-between text-[11px] shrink-0">
            <Link
              href="/buyer/verifications"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Order Verifications →
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
