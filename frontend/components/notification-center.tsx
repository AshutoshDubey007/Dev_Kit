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
        return <ShoppingBag className="h-3.5 w-3.5 text-[#b8531e]" />;
      case 'chat':
        return <MessageSquare className="h-3.5 w-3.5 text-[#cc6b35]" />;
      case 'star':
        return <Star className="h-3.5 w-3.5 text-[#cc6b35]" />;
      case 'security':
        return <ShieldCheck className="h-3.5 w-3.5 text-[#964115]" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-[#b8531e]" />;
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
        className={`relative flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all shadow-[2px_2px_0px_#e8c3a8] ${
          isOpen
            ? 'border-[#b8531e] bg-[#f7ece1] text-[#964115]'
            : 'border-orange-300 bg-white text-[#b8531e] hover:border-[#cc6b35] hover:bg-orange-50'
        }`}
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#b8531e] text-[9px] font-bold font-pixel text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Dimmed Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Popover Panel */}
      {isOpen && (
        <div
          className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-2xl border-2 border-[#cc6b35] bg-white shadow-[6px_6px_0px_#cc6b35] z-50 overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b-2 border-orange-100 bg-[#faf5ef] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-pixel">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="rounded bg-[#b8531e] px-2 py-0.5 text-[10px] font-pixel font-bold text-white">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-pixel text-[#b8531e] hover:underline flex items-center gap-1 transition-colors py-0.5 px-1.5 rounded hover:bg-orange-100"
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
                  className="sm:hidden p-1 text-[#b8531e] hover:text-zinc-950 rounded-lg hover:bg-orange-100"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs: All vs Unread */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white border-2 border-orange-200 text-[11px] font-pixel">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 px-2.5 rounded-md text-center transition-all ${
                  filter === 'all'
                    ? 'bg-[#b8531e] text-white font-bold'
                    : 'text-zinc-700 hover:text-[#b8531e]'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`flex-1 py-1 px-2.5 rounded-md text-center transition-all ${
                  filter === 'unread'
                    ? 'bg-[#b8531e] text-white font-bold'
                    : 'text-zinc-700 hover:text-[#b8531e]'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List of Notification Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-orange-100 p-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-1.5">
                <span className="text-sm block">✨</span>
                <p className="text-xs font-pixel text-zinc-900 font-bold">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-zinc-600 max-w-xs mx-auto">
                  {filter === 'unread'
                    ? 'You have answered all incoming order and support updates.'
                    : 'You will receive notifications here about purchases, messages, and security scans.'}
                </p>
                {filter === 'unread' && notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className="text-[11px] text-[#b8531e] hover:underline font-pixel pt-1 font-bold"
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
                      ? 'bg-[#faf5ef] hover:bg-orange-100/70'
                      : 'hover:bg-orange-50/50 opacity-85 hover:opacity-100'
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
                      <div className="mt-0.5 h-7 w-7 rounded-lg bg-white border-2 border-orange-200 flex items-center justify-center shrink-0">
                        {getIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-pixel font-bold text-zinc-950 truncate max-w-[190px] sm:max-w-[210px]">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-700 line-clamp-2 leading-relaxed">
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
                        className="h-5 w-5 rounded-md hover:bg-orange-200 text-[#b8531e] flex items-center justify-center transition-colors"
                        title="Mark as read"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#cc6b35] animate-pulse group-hover:hidden" />
                        <Check className="h-3 w-3 hidden group-hover:block" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t-2 border-orange-100 bg-[#faf5ef] flex items-center justify-between text-[11px] font-pixel shrink-0">
            <Link
              href="/buyer/verifications"
              onClick={() => setIsOpen(false)}
              className="text-zinc-700 hover:text-[#b8531e] font-bold transition-colors"
            >
              Order Verifications →
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-[#b8531e] font-bold hover:underline transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
