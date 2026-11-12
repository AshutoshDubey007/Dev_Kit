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
  ArrowLeft,
  X,
} from 'lucide-react';
import { MessageSenderRole, Message } from '@backend/models/Message';
import { Conversation } from '@backend/models/Conversation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../lib/auth-context';

export default function ChatHubPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasLeakWarning, setHasLeakWarning] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'conversations' | 'chat' | 'details'>('chat');
  const [orderVerification, setOrderVerification] = useState<any>(null);
  const [linkedTicket, setLinkedTicket] = useState<any>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.conversationId === selectedConvId) || conversations[0];

  // Derive effective role from session and active conversation
  const isSellerOfConversation = Boolean(
    activeConversation &&
    currentUser?.email &&
    activeConversation.sellerEmail &&
    activeConversation.sellerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const effectiveRole: MessageSenderRole =
    currentUser?.role === 'operator' || currentUser?.role === 'admin'
      ? 'operator'
      : currentUser?.role === 'seller' || isSellerOfConversation
      ? 'seller'
      : 'buyer';

  // Fetch verification details for active conversation order
  useEffect(() => {
    async function loadVerification() {
      if (!activeConversation?.orderId) {
        setOrderVerification(null);
        setLinkedTicket(null);
        return;
      }
      try {
        const res = await fetch(`/api/verifications?orderId=${encodeURIComponent(activeConversation.orderId)}`);
        const data = await res.json();
        if (data.verification) {
          setOrderVerification(data.verification);
          if (data.verification.supportCaseId) {
            const tRes = await fetch(`/api/support/tickets/${data.verification.supportCaseId}`);
            const tData = await tRes.json();
            if (tData.ticket) {
              setLinkedTicket(tData.ticket);
            }
          } else {
            setLinkedTicket(null);
          }
        } else {
          setOrderVerification(null);
          setLinkedTicket(null);
        }
      } catch (err) {
        console.warn('Could not load order verification in chat:', err);
      }
    }
    loadVerification();
  }, [activeConversation?.orderId]);

  // Prevent page scroll down on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Fetch all user conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const query =
          currentUser?.role === 'operator' || currentUser?.role === 'admin'
            ? '?all=true'
            : currentUser?.email
            ? `?email=${encodeURIComponent(currentUser.email)}`
            : '';
        const res = await fetch(`/api/chat/conversations${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversations && data.conversations.length > 0) {
            setConversations(data.conversations);
            setSelectedConvId((prev) => {
              if (prev && data.conversations.some((c: any) => c.conversationId === prev)) return prev;
              return data.conversations[0].conversationId;
            });
          } else {
            setConversations([]);
            setSelectedConvId('');
          }
        }
      } catch (e) {
        console.error('Failed to fetch conversations:', e);
      }
    }
    fetchConversations();
  }, [currentUser?.email, currentUser?.role]);

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
      currentUser?.name ||
      (effectiveRole === 'buyer'
        ? 'Verified Buyer'
        : effectiveRole === 'seller'
        ? 'Kit Seller'
        : 'Safety Desk Operator');

    const senderId =
      currentUser?.id ||
      currentUser?.email ||
      (effectiveRole === 'buyer'
        ? 'buyer_user'
        : effectiveRole === 'seller'
        ? 'seller_user'
        : 'operator_system');

    try {
      const res = await fetch(`/api/chat/${selectedConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          senderName,
          senderRole: effectiveRole,
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
    <div className="max-w-[1500px] mx-auto space-y-3 sm:space-y-4 pb-12">
      {/* Mobile View Switcher (Visible only on < lg screens to eliminate clutter) */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-white border border-orange-200 text-xs font-medium backdrop-blur-xl shadow-lg">
        <button
          type="button"
          onClick={() => setMobileTab('conversations')}
          className={`flex-1 py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'conversations'
              ? 'bg-[#faf5ef] text-zinc-950 shadow-sm font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5 text-[#b8531e]" />
          <span>Chats ({conversations.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'chat'
              ? 'bg-[#f7ece1] border border-[#cc6b35] text-[#964115] shadow-sm font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Send className="h-3.5 w-3.5 text-[#b8531e]" />
          <span className="truncate max-w-[90px]">{activeConversation?.kitTitle ? 'Thread' : 'Chat'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('details')}
          className={`flex-1 py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'details'
              ? 'bg-[#faf5ef] text-zinc-950 shadow-sm font-semibold'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Info className="h-3.5 w-3.5 text-[#b8531e]" />
          <span>Order Info</span>
        </button>
      </div>

      {/* 3-PANEL CHAT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[750px] lg:max-h-[82vh]">
        {/* PANEL 1: CONVERSATIONS LIST (3 COLS) */}
        <div
          className={`rounded-2xl border border-orange-200 bg-white shadow-xl backdrop-blur-xl flex flex-col overflow-hidden lg:col-span-3 lg:h-full ${
            mobileTab === 'conversations' ? 'flex h-[calc(100vh-210px)] min-h-[500px]' : 'hidden lg:flex'
          }`}
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-orange-200 space-y-2.5 bg-[#faf5ef]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
                Conversations
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-orange-200 text-zinc-600">
                {conversations.length} Active
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-600" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, kits, buyers..."
                className="pl-8 text-xs bg-[#faf5ef] border-orange-200 text-zinc-950 h-8"
              />
            </div>
          </div>

          {/* List of Threads */}
          <div className="flex-1 overflow-y-auto divide-y divide-orange-100 p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-600">
                No matching conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.conversationId === selectedConvId;
                return (
                  <button
                    key={c.conversationId}
                    type="button"
                    onClick={() => {
                      setSelectedConvId(c.conversationId);
                      setMobileTab('chat');
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#faf5ef] border border-orange-200 shadow-sm'
                        : 'hover:bg-[#faf5ef] text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-zinc-950 truncate max-w-[170px]">
                        {c.kitTitle}
                      </span>
                      {c.status === 'flagged' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-500/30">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {new Date(c.lastMessageAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-600 line-clamp-1">
                      {c.lastMessageSnippet}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono pt-1">
                      <span>{c.orderId}</span>
                      <span className="text-zinc-600">
                        {effectiveRole === 'seller' ? c.buyerName : c.sellerName}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: ACTIVE CHAT & COMPOSER (6 COLS) */}
        <div
          className={`rounded-2xl border border-orange-200 bg-white shadow-xl backdrop-blur-xl flex flex-col overflow-hidden ${
            isDetailsOpen ? 'lg:col-span-6' : 'lg:col-span-9'
          } lg:h-full ${
            mobileTab === 'chat' ? 'flex h-[calc(100vh-210px)] min-h-[550px]' : 'hidden lg:flex'
          }`}
        >
          {/* Chat Header */}
          <div className="px-3 sm:px-5 py-3 border-b border-orange-200 bg-[#faf5ef] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile Back Button to Conversations List */}
              <button
                type="button"
                onClick={() => setMobileTab('conversations')}
                className="lg:hidden p-1.5 -ml-1 text-zinc-600 hover:text-zinc-950 hover:bg-[#faf5ef] rounded-lg shrink-0"
                title="View all conversations"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-xs font-bold text-zinc-950 tracking-tight truncate max-w-[130px] sm:max-w-[220px] lg:max-w-none">
                    {activeConversation?.kitTitle || 'Direct Support'}
                  </h2>
                  {activeConversation?.orderId && (
                    <Badge variant="outline" className="font-mono text-[9px] sm:text-[10px] border-orange-200 text-zinc-600 shrink-0">
                      {activeConversation.orderId}
                    </Badge>
                  )}
                  <Badge
                    variant={effectiveRole === 'seller' ? 'secondary' : effectiveRole === 'operator' ? 'purple' : 'default'}
                    className="font-mono text-[9px] sm:text-[10px] capitalize hidden sm:inline-flex shrink-0"
                  >
                    {effectiveRole} mode
                  </Badge>
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-600 mt-0.5 truncate hidden sm:block">
                  {activeConversation ? (
                    <>
                      Buyer: <span className="text-zinc-900">{activeConversation.buyerName}</span> • Seller:{' '}
                      <span className="text-zinc-900">{activeConversation.sellerName}</span>
                    </>
                  ) : (
                    'No conversation active. Orders automatically initialize support channels.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#cc6b35] bg-[#f7ece1] px-2 py-1 text-[10px] font-mono text-[#b8531e]" title="DevKit DLP Active">
                <span className="h-1.5 w-1.5 rounded-full bg-[#cc6b35] animate-pulse" />
                <span className="hidden sm:inline">DLP Protected</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setMobileTab('details');
                  } else {
                    setIsDetailsOpen(!isDetailsOpen);
                  }
                }}
                className="text-zinc-600 hover:text-zinc-950 p-1.5 rounded-lg border border-orange-200 bg-[#faf5ef] flex items-center gap-1 text-xs"
                title="Toggle details panel"
              >
                <Info className="h-3.5 w-3.5 text-zinc-800" />
                <span className="lg:hidden text-[10px] font-medium text-zinc-800">Details</span>
              </button>
            </div>
          </div>

          {/* Anti-Leak Safety Banner */}
          <div className="bg-[#f7ece1] border-b border-[#cc6b35] px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-[#b8531e] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Shield className="h-3.5 w-3.5 text-[#b8531e] shrink-0" />
              <span className="hidden sm:inline">
                Phone numbers, WhatsApp, emails, and UPI handles are automatically masked.
              </span>
              <span className="sm:hidden truncate">
                Contacts &amp; UPI are automatically masked by DLP.
              </span>
            </div>
            {effectiveRole === 'operator' && (
              <Link
                href="/operator"
                className="text-[#b8531e] hover:text-[#b8531e] font-mono text-[10px] underline shrink-0"
              >
                Operator Desk →
              </Link>
            )}
          </div>

          {/* Messages Thread */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-xs">
                No messages yet. Send a message below to start chatting.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe =
                  msg.senderRole === effectiveRole ||
                  msg.senderId === currentUser?.id ||
                  msg.senderId === currentUser?.email;
                const isOperator = msg.senderRole === 'operator';
                const isReadme = msg.metadata?.isAutomatedReadme;

                if (isOperator) {
                  return (
                    <div
                      key={msg.messageId}
                      className="mx-auto max-w-lg rounded-xl border border-[#cc6b35] bg-[#f7ece1] p-3.5 text-center text-xs text-[#964115] shadow-md"
                    >
                      <span className="block font-semibold text-[#b8531e] font-mono text-[10px] uppercase tracking-wider mb-1">
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
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
                      <span className="font-semibold text-zinc-800">{msg.senderName}</span>
                      <span className="capitalize text-[9px] bg-orange-100 px-1.5 py-0.2 rounded text-zinc-600">
                        {msg.senderRole}
                      </span>
                      <span className="text-zinc-600">
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
                          ? 'bg-[#faf5ef] border border-[#cc6b35] text-zinc-900 rounded-bl-sm shadow-xl'
                          : 'bg-[#faf5ef] border border-orange-200 text-zinc-900 rounded-bl-sm shadow-md'
                      }`}
                    >
                      {isReadme && (
                        <div className="flex items-center gap-1.5 text-[#b8531e] font-mono font-semibold text-[10px] uppercase mb-2 pb-1.5 border-b border-[#cc6b35]">
                          <Code2 className="h-3.5 w-3.5" />
                          <span>Included Author Setup Guide</span>
                        </div>
                      )}

                      <div className="whitespace-pre-line font-sans">{msg.filteredContent}</div>

                      {msg.isFlagged && (
                        <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-700 font-mono flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-red-700 shrink-0" />
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
          <div className="border-t border-orange-200 bg-[#faf5ef] p-4 space-y-2">
            {hasLeakWarning && (
              <div className="p-2 rounded-lg bg-[#f7ece1] border border-[#cc6b35] text-[#b8531e] text-[11px] flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-[#b8531e] shrink-0" />
                <span>
                  DevKit DLP Warning: Phone numbers, emails, WhatsApp handles, and payment links will be masked upon sending.
                </span>
              </div>
            )}

            {activeConversation?.status === 'closed' ? (
              <div className="p-4 rounded-xl bg-white border border-orange-200 text-center space-y-1.5">
                <span className="text-xs font-semibold text-zinc-800 block">
                  🔒 This verification chat thread is closed.
                </span>
                <p className="text-[11px] text-zinc-600 max-w-md mx-auto">
                  {activeConversation?.closureReason || 'The 7-day verification period or resolution process has concluded.'}
                </p>
                <div className="pt-1">
                  <Link href="/buyer/verifications" className="text-xs text-[#b8531e] hover:text-[#b8531e] underline font-mono">
                    View Product Verification Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                <textarea
                  rows={2}
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message or code question..."
                  className="flex-1 rounded-xl border border-orange-200 bg-[#faf5ef] p-2.5 sm:p-3 text-xs text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#cc6b35] resize-y font-sans"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />

                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending || !selectedConvId}
                  className="h-10 px-3 sm:px-4 bg-[#b8531e] hover:bg-[#b8531e] text-white text-xs gap-1.5 shadow-md shadow-[#e8c3a8] shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* PANEL 3: ORDER & KIT DETAILS (3 COLS) */}
        <div
          className={`rounded-2xl border border-orange-200 bg-white shadow-xl backdrop-blur-xl flex flex-col overflow-y-auto p-4 space-y-4 sm:space-y-5 lg:col-span-3 lg:h-full ${
            mobileTab === 'details' ? 'flex h-[calc(100vh-210px)] min-h-[500px]' : 'hidden'
          } ${isDetailsOpen ? 'lg:flex' : 'lg:hidden'}`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-orange-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileTab('chat')}
                className="lg:hidden p-1 -ml-1 text-zinc-600 hover:text-zinc-950 hover:bg-[#faf5ef] rounded-lg flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium">Chat</span>
              </button>
              <div>
                <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono block">
                  Order &amp; Asset Context
                </span>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Verified details for this chat thread.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setMobileTab('chat');
                } else {
                  setIsDetailsOpen(false);
                }
              }}
              className="text-zinc-600 hover:text-zinc-950 p-1 rounded-lg hover:bg-[#faf5ef]"
              title="Close details"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 7-Day Verification & Support Status Card */}
            {orderVerification && (
              <div className="p-3.5 rounded-xl border border-[#cc6b35] bg-[#f7ece1] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#b8531e] flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-[#b8531e]" />
                    <span>7-Day Product Verification</span>
                  </span>
                  {orderVerification.verificationStatus === 'verified_success' ? (
                    <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-[10px]">
                      ✓ Verified
                    </Badge>
                  ) : orderVerification.verificationStatus === 'issue_reported' ? (
                    <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-[10px]">
                      ⚠️ Issue Active
                    </Badge>
                  ) : orderVerification.verificationStatus === 'expired' ? (
                    <Badge className="bg-orange-100 text-zinc-600 border-orange-200 text-[10px]">
                      Concluded
                    </Badge>
                  ) : (
                    <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-[10px]">
                      Active Window
                    </Badge>
                  )}
                </div>

                <div className="text-[11px] text-zinc-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="text-zinc-900 font-mono text-[10px]">
                      {new Date(orderVerification.verificationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                  {linkedTicket && (
                    <div className="flex justify-between items-center pt-1 border-t border-[#cc6b35]">
                      <span>Support Ticket:</span>
                      <span className="text-[#b8531e] font-mono text-[10px]">
                        {linkedTicket.ticketId} ({linkedTicket.status})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <Link href="/buyer/verifications" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full text-[11px] h-7 border-[#cc6b35] text-[#b8531e] hover:bg-[#f7ece1]">
                      Manage Verification & Issues →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Asset Card */}
            <div className="p-3.5 rounded-xl border border-orange-200 bg-[#faf5ef] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-950">
                    {activeConversation?.kitTitle || 'Developer Asset'}
                  </h3>
                  <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                    ID: {activeConversation?.kitId}
                  </div>
                </div>
                <Badge className="bg-[#f7ece1] text-[#b8531e] border-[#cc6b35] text-[10px]">
                  Verified
                </Badge>
              </div>

              <div className="pt-2 border-t border-orange-200 flex items-center justify-between text-xs">
                <span className="text-zinc-600 text-[11px]">Payment Gateway:</span>
                <span className="font-mono text-[#b8531e] font-semibold text-[11px]">
                  Razorpay Route
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 text-[11px]">Order Reference:</span>
                <span className="font-mono text-zinc-800 text-[11px]">
                  {activeConversation?.orderId}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 text-[11px]">License Type:</span>
                <span className="text-zinc-800 text-[11px]">Commercial Dev</span>
              </div>
            </div>

            {/* Direct Action Links */}
            <div className="space-y-2">
              <Link
                href={`/kits/${activeConversation?.kitSlug || orderVerification?.productSlug || 'nextjs-razorpay-pro'}`}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-orange-200 bg-[#faf5ef] text-xs text-zinc-900 hover:text-zinc-950 hover:border-[#cc6b35] transition-all"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-[#b8531e]" />
                  <span>View Marketplace Listing</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              </Link>

              <Link
                href={`/kits/${activeConversation?.kitSlug || orderVerification?.productSlug || 'nextjs-razorpay-pro'}#code-preview`}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-orange-200 bg-[#faf5ef] text-xs text-zinc-900 hover:text-zinc-950 hover:border-[#cc6b35] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-[#b8531e]" />
                  <span>Explore Architecture &amp; Code</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              </Link>

              {orderVerification?.downloadToken ? (
                <a
                  href={`/api/download/${orderVerification.downloadToken}`}
                  download
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#cc6b35] bg-[#f7ece1] text-xs text-[#964115] hover:text-zinc-950 hover:border-[#cc6b35] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-3.5 w-3.5 text-[#b8531e]" />
                    <span>Download Package (.ZIP)</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </a>
              ) : (
                <Link
                  href="/buyer/verifications"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-orange-200 bg-[#faf5ef] text-xs text-zinc-900 hover:text-zinc-950 hover:border-[#cc6b35] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-3.5 w-3.5 text-[#b8531e]" />
                    <span>Secure Download Token</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </Link>
              )}
            </div>

            {/* Quickstart Terminal Command */}
            <div className="space-y-1.5 pt-2 border-t border-orange-200">
              <div className="text-[11px] font-mono text-zinc-600 flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-zinc-600" />
                <span>Quick Setup Command</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-orange-200 font-mono text-[10px] text-zinc-800 space-y-1">
                <div><span className="text-[#b8531e]">$</span> npm install</div>
                <div><span className="text-[#b8531e]">$</span> cp .env.example .env.local</div>
                <div><span className="text-[#b8531e]">$</span> npm run dev</div>
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="p-3 rounded-xl border border-orange-200 bg-white text-[10px] text-zinc-600 leading-relaxed">
              <strong className="text-zinc-950 block mb-0.5">🛡️ DevKit Buyer Protection:</strong>
              Transactions are covered by 14-day defect resolution guarantee when kept inside the platform.
            </div>
          </div>
      </div>
    </div>
  );
}
