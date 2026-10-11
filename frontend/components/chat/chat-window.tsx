'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageSenderRole } from '@backend/models/Message';
import { Conversation } from '@backend/models/Conversation';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ChatWindowProps {
  conversationId: string;
  initialConversation?: Conversation;
  currentUserRole: MessageSenderRole; // 'buyer' | 'seller' | 'operator'
  currentUserName: string;
  currentUserId: string;
}

export function ChatWindow({
  conversationId,
  initialConversation,
  currentUserRole,
  currentUserName,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | undefined>(initialConversation);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasLeakWarning, setHasLeakWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.conversation) {
          setConversation(data.conversation);
        }
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Poll updates
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Client-side instant preview check for contact leaks
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    // Quick regex checks for warning label
    const phoneOrEmail = /(\+?91[\s.-]?)?\b[6-9]\d{9}\b|@|whatsapp|wa\.me/i.test(val);
    setHasLeakWarning(phoneOrEmail);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
          content: inputMessage.trim(),
        }),
      });

      if (res.ok) {
        setInputMessage('');
        setHasLeakWarning(false);
        await fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] max-h-[85vh] rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* 1. Header with kit & participants info */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#121319] px-6 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              {conversation?.kitTitle || 'Kit Support & Setup Chat'}
            </h2>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {conversation?.orderId || 'Direct Chat'}
            </Badge>
          </div>
          <span className="text-xs text-zinc-400 mt-0.5">
            Buyer: <span className="text-zinc-200">{conversation?.buyerName}</span> • Seller:{' '}
            <span className="text-zinc-200">{conversation?.sellerName}</span>
          </span>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Anti-Leak Protected</span>
          </span>
        </div>
      </div>

      {/* 2. Anti-Leak Policy Banner */}
      <div className="bg-amber-950/20 border-b border-amber-900/40 px-6 py-2 text-[11px] text-amber-300/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>🔒</span>
          <span>
            Contact information (phone numbers, WhatsApp, emails, UPI) is automatically masked to protect both parties.
          </span>
        </div>
        <span className="text-zinc-500 font-mono text-[10px]">Operator Moderated</span>
      </div>

      {/* 3. Message Thread Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
            Connecting to seller...
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === currentUserRole;
            const isOperator = msg.senderRole === 'operator';
            const isReadme = msg.metadata?.isAutomatedReadme;

            if (isOperator) {
              return (
                <div
                  key={msg.messageId}
                  className="mx-auto max-w-lg rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 text-center text-xs text-purple-200 shadow-md"
                >
                  <span className="block font-semibold text-purple-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    🛡️ Official Moderator Notice
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
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span className="font-semibold text-zinc-300">{msg.senderName}</span>
                  <span className="capitalize text-[10px] bg-zinc-800 px-1.5 py-0.2 rounded text-zinc-400">
                    {msg.senderRole}
                  </span>
                  <span className="text-zinc-500 text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-md'
                      : isReadme
                      ? 'bg-zinc-900 border border-indigo-500/30 text-zinc-200 rounded-bl-sm shadow-xl'
                      : 'bg-zinc-900 border border-white/[0.06] text-zinc-200 rounded-bl-sm shadow-md'
                  }`}
                >
                  {isReadme && (
                    <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-semibold text-[10px] uppercase mb-2 pb-1.5 border-b border-indigo-500/20">
                      <span>📄 Included README Quickstart Guide</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line font-sans">
                    {msg.filteredContent}
                  </div>

                  {msg.isFlagged && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-300 font-mono flex items-center gap-1">
                      <span>⚠️ Contact info detected and redacted</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Input Composer */}
      <div className="border-t border-white/[0.08] bg-[#101116] p-4">
        {hasLeakWarning && (
          <div className="mb-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Phone numbers, emails, and external links will be automatically masked upon sending.
            </span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <textarea
            rows={2}
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your question or message to the seller..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSending}
            disabled={!inputMessage.trim()}
            className="text-xs h-10 px-5 shadow-md shadow-indigo-600/20"
          >
            Send ↵
          </Button>
        </form>
      </div>
    </div>
  );
}
