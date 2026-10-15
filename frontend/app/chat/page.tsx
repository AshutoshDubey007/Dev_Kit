'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Code2,
  Terminal,
  Send,
  User,
  Info,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { MessageSenderRole, Message } from '@backend/models/Message';
import { Conversation } from '@backend/models/Conversation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../lib/auth-context';

export default function ChatHubPage() {
  const { currentUser } = useAuth();
  const [activeRole, setActiveRole] = useState<MessageSenderRole>('buyer');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv_demo');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasLeakWarning, setHasLeakWarning] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.conversationId === selectedConvId) || conversations[0];

  // Prevent page scroll down on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Fetch all user conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/chat/conversations');
        if (res.ok) {
          const data = await res.json();
          if (data.conversations && data.conversations.length > 0) {
            setConversations(data.conversations);
            if (!selectedConvId) {
              setSelectedConvId(data.conversations[0].conversationId);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch conversations:', e);
      }
    }
    fetchConversations();
  }, []);

  // Fetch messages for active conversation
  const fetchActiveMessages = async () => {
    if (!selectedConvId) return;
    try {
      const res = await fetch(`/api/chat/${selectedConvId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to load chat messages:', e);
    }
  };

  useEffect(() => {
    fetchActiveMessages();
    const interval = setInterval(fetchActiveMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  // Scroll ONLY the inner message list, NOT the whole browser window
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Client-side DLP check
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    // Check for phone, email, WhatsApp, or UPI leaks
    const phoneOrEmail =
      /(\+?91[\s.-]?)?\b[6-9]\d{9}\b|@|whatsapp|wa\.me|t\.me|\.com|\.in/i.test(val);
    setHasLeakWarning(phoneOrEmail);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending || !selectedConvId) return;

    setIsSending(true);

    const senderName =
      activeRole === 'buyer'
        ? 'Ashutosh Dubey (Buyer)'
        : activeRole === 'seller'
        ? 'DevKit Core Team (Seller)'
        : 'Moderation Desk (Operator)';

    const senderId =
      activeRole === 'buyer'
        ? 'buyer_ashutosh'
        : activeRole === 'seller'
        ? 'seller_devkit_core'
        : 'operator_system';

    try {
      const res = await fetch(`/api/chat/${selectedConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          senderName,
          senderRole: activeRole,
          content: inputMessage.trim(),
        }),
      });

      if (res.ok) {
        setInputMessage('');
        setHasLeakWarning(false);
        await fetchActiveMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Filtered conversations list
  const filteredConversations = conversations.filter(
    (c) =>
      c.kitTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1500px] mx-auto space-y-4 pb-12">
      {/* 3-PANEL CHAT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] max-h-[82vh]">
        {/* PANEL 1: CONVERSATIONS LIST (3 COLS) */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 shadow-xl backdrop-blur-xl flex flex-col overflow-hidden">
          {/* Search Header */}
          <div className="p-3.5 border-b border-white/[0.08] space-y-2.5 bg-[#101116]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Conversations
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
                {conversations.length} Active
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, kits, buyers..."
                className="pl-8 text-xs bg-[#141822] border-white/[0.1] text-white h-8"
              />
            </div>
          </div>

          {/* List of Threads */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05] p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                No matching conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.conversationId === selectedConvId;
                return (
                  <button
                    key={c.conversationId}
                    type="button"
                    onClick={() => setSelectedConvId(c.conversationId)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-white/[0.06] border border-white/[0.12] shadow-sm'
                        : 'hover:bg-white/[0.03] text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                        {c.kitTitle}
                      </span>
                      {c.status === 'flagged' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/30">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(c.lastMessageAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-400 line-clamp-1">
                      {c.lastMessageSnippet}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                      <span>{c.orderId}</span>
                      <span className="text-zinc-400">
                        {activeRole === 'seller' ? c.buyerName : c.sellerName}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: ACTIVE CHAT & COMPOSER (6 COLS) */}
        <div className="lg:col-span-6 rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 shadow-xl backdrop-blur-xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#101116] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-white tracking-tight">
                  {activeConversation?.kitTitle || 'Direct Support'}
                </h2>
                <Badge variant="outline" className="font-mono text-[10px] border-zinc-700 text-zinc-400">
                  {activeConversation?.orderId}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Buyer: <span className="text-zinc-200">{activeConversation?.buyerName}</span> • Seller:{' '}
                <span className="text-zinc-200">{activeConversation?.sellerName}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DLP Protected</span>
              </span>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg border border-white/[0.08] bg-[#141822]"
                title="Toggle details panel"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Anti-Leak Safety Banner */}
          <div className="bg-amber-950/20 border-b border-amber-900/30 px-5 py-2 text-[11px] text-amber-300/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>
                Phone numbers, WhatsApp, emails, and UPI handles are automatically masked.
              </span>
            </div>
            {activeRole === 'operator' && (
              <Link
                href="/operator"
                className="text-purple-400 hover:text-purple-300 font-mono text-[10px] underline shrink-0"
              >
                Operator Desk →
              </Link>
            )}
          </div>

          {/* Messages Thread */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
                No messages yet. Send a message below to start chatting.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === activeRole;
                const isOperator = msg.senderRole === 'operator';
                const isReadme = msg.metadata?.isAutomatedReadme;

                if (isOperator) {
                  return (
                    <div
                      key={msg.messageId}
                      className="mx-auto max-w-lg rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 text-center text-xs text-purple-200 shadow-md"
                    >
                      <span className="block font-semibold text-purple-300 font-mono text-[10px] uppercase tracking-wider mb-1">
                        🛡️ Moderator Notice
                      </span>
                      <p className="leading-relaxed">{msg.filteredContent}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.messageId}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span className="font-semibold text-zinc-300">{msg.senderName}</span>
                      <span className="capitalize text-[9px] bg-zinc-800 px-1.5 py-0.2 rounded text-zinc-400">
                        {msg.senderRole}
                      </span>
                      <span className="text-zinc-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-xl rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-sm shadow-md'
                          : isReadme
                          ? 'bg-zinc-900 border border-indigo-500/30 text-zinc-200 rounded-bl-sm shadow-xl'
                          : 'bg-zinc-900 border border-white/[0.08] text-zinc-200 rounded-bl-sm shadow-md'
                      }`}
                    >
                      {isReadme && (
                        <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-semibold text-[10px] uppercase mb-2 pb-1.5 border-b border-indigo-500/20">
                          <Code2 className="h-3.5 w-3.5" />
                          <span>Included Author Setup Guide</span>
                        </div>
                      )}

                      <div className="whitespace-pre-line font-sans">{msg.filteredContent}</div>

                      {msg.isFlagged && (
                        <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-300 font-mono flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
                          <span>Contact information automatically redacted by DevKit DLP</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-white/[0.08] bg-[#101116] p-4 space-y-2">
            {hasLeakWarning && (
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>
                  DevKit DLP Warning: Phone numbers, emails, WhatsApp handles, and payment links will be masked upon sending.
                </span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
              <textarea
                rows={2}
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Type your message, code question, or integration query... (Enter to send, Shift+Enter for new line)"
                className="flex-1 rounded-xl border border-white/[0.1] bg-[#141822] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              <Button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </Button>
            </form>
          </div>
        </div>

        {/* PANEL 3: ORDER & KIT DETAILS (3 COLS) */}
        {isDetailsOpen && (
          <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 shadow-xl backdrop-blur-xl flex flex-col overflow-y-auto p-4 space-y-5">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Order & Asset Context
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Verified transaction details associated with this chat thread.
              </p>
            </div>

            {/* Asset Card */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#141822] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">
                    {activeConversation?.kitTitle || 'Developer Asset'}
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    ID: {activeConversation?.kitId}
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                  Verified
                </Badge>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Payment Gateway:</span>
                <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                  Razorpay Route
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Order Reference:</span>
                <span className="font-mono text-zinc-300 text-[11px]">
                  {activeConversation?.orderId}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">License Type:</span>
                <span className="text-zinc-300 text-[11px]">Commercial Dev</span>
              </div>
            </div>

            {/* Direct Action Links */}
            <div className="space-y-2">
              <Link
                href={`/kits/${activeConversation?.kitSlug || 'nextjs-razorpay-pro'}`}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/[0.08] bg-[#141822] text-xs text-zinc-200 hover:text-white hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                  <span>View Marketplace Listing</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              </Link>

              <Link
                href={`/repos/devkit-core/${activeConversation?.kitSlug || 'nextjs-razorpay-pro'}`}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/[0.08] bg-[#141822] text-xs text-zinc-200 hover:text-white hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Explore Repository Code</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              </Link>

              <Link
                href={`/download/${activeConversation?.orderId || 'ORD-8491-RAZORPAY'}`}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/[0.08] bg-[#141822] text-xs text-zinc-200 hover:text-white hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 text-purple-400" />
                  <span>Secure Download Token</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              </Link>
            </div>

            {/* Quickstart Terminal Command */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-zinc-500" />
                <span>Quick Setup Command</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/[0.06] font-mono text-[10px] text-zinc-300 space-y-1">
                <div><span className="text-emerald-400">$</span> npm install</div>
                <div><span className="text-emerald-400">$</span> cp .env.example .env.local</div>
                <div><span className="text-emerald-400">$</span> npm run dev</div>
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="p-3 rounded-xl border border-white/[0.06] bg-zinc-950/60 text-[10px] text-zinc-400 leading-relaxed">
              <strong className="text-white block mb-0.5">🛡️ DevKit Buyer Protection:</strong>
              Transactions are covered by 14-day defect resolution guarantee when kept inside the platform.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
