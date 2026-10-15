'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, ShoppingBag, MessageSquare, Star, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import type { NotificationItem } from '../types/notification';
import { SEED_NOTIFICATIONS } from '../data/notifications';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {
        // Fallback to seed notifications
        setNotifications(SEED_NOTIFICATIONS);
      });
  }, []);

  // Close when clicking outside
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

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />;
      case 'chat':
        return <MessageSquare className="h-3.5 w-3.5 text-blue-400" />;
      case 'star':
        return <Star className="h-3.5 w-3.5 text-amber-400" />;
      case 'security':
        return <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-zinc-400" />;
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
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black ring-2 ring-[#0c0d12]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/[0.1] bg-[#0c0e14] shadow-2xl shadow-black/90 backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Check className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No notifications yet.</div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 hover:bg-white/[0.04] transition-colors ${
                    !item.read ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-white/[0.06] bg-zinc-950/40 text-center">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Notification Settings →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
