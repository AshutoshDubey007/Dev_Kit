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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Prevent parent window from scrolling down on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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

  // Scroll ONLY the inner message list, NOT the whole browser window
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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
    <div className="flex flex-col h-[700px] max-h-[85vh] rounded-2xl border-2 border-[#cc6b35] bg-white shadow-[6px_6px_0px_#cc6b35] overflow-hidden">
      {/* 1. Header with kit & participants info */}
      <div className="flex items-center justify-between border-b-2 border-[#cc6b35] bg-[#f7ece1] px-3 sm:px-6 py-3 sm:py-4 gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-xs sm:text-sm font-pixel font-bold text-zinc-950 tracking-tight truncate max-w-[150px] sm:max-w-none">
              {conversation?.kitTitle || 'Kit Support & Setup Chat'}
            </h2>
            <Badge variant="default" size="sm" className="text-[9px] sm:text-[10px] shrink-0">
              {conversation?.orderId || 'Direct Chat'}
            </Badge>
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-600 mt-0.5 hidden sm:block truncate">
            Buyer: <span className="text-zinc-950 font-semibold">{conversation?.buyerName}</span> • Seller:{' '}
            <span className="text-zinc-950 font-semibold">{conversation?.sellerName}</span>
          </span>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#cc6b35] bg-white px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-pixel font-bold text-[#b8531e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#cc6b35] animate-pulse" />
            <span className="hidden sm:inline">Anti-Leak Protected</span>
          </span>
        </div>
      </div>

      {/* 2. Anti-Leak Policy Banner */}
      <div className="bg-[#faf5ef] border-b border-orange-200 px-3 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-[#964115] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="shrink-0">🔒</span>
          <span className="hidden sm:inline font-medium">
            Contact information (phone numbers, WhatsApp, emails, UPI) is automatically masked to protect both parties.
          </span>
          <span className="sm:hidden truncate font-medium">
            Contacts &amp; UPI are masked by DevKit DLP.
          </span>
        </div>
        <span className="text-[#b8531e] font-pixel font-bold text-[9px] sm:text-[10px] shrink-0">Moderated</span>
      </div>

      {/* 3. Message Thread Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-[#fcfaf7]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 font-pixel text-xs">
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
                  className="mx-auto max-w-lg rounded-xl border-2 border-[#b8531e] bg-[#f7ece1] p-3.5 text-center text-xs text-zinc-900 shadow-[3px_3px_0px_#cc6b35]"
                >
                  <span className="block font-bold text-[#b8531e] font-pixel text-[11px] uppercase tracking-wider mb-1">
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
                <div className="flex items-center gap-2 text-[11px] text-zinc-600 font-pixel">
                  <span className="font-bold text-zinc-900">{msg.senderName}</span>
                  <span className="capitalize text-[10px] bg-orange-100 border border-orange-300 px-1.5 py-0.2 rounded text-[#964115]">
                    {msg.senderRole}
                  </span>
                  <span className="text-zinc-500 text-[10px] font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed border-2 ${
                    isMe
                      ? 'bg-[#b8531e] border-[#78330f] text-white rounded-br-sm shadow-[3px_3px_0px_#e5a982]'
                      : isReadme
                      ? 'bg-white border-[#cc6b35] text-zinc-900 rounded-bl-sm shadow-[3px_3px_0px_#e8c3a8]'
                      : 'bg-white border-orange-200 text-zinc-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {isReadme && (
                    <div className="flex items-center gap-1.5 text-[#b8531e] font-pixel font-bold text-[10px] uppercase mb-2 pb-1.5 border-b border-orange-200">
                      <span>📄 Included README Quickstart Guide</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line font-sans">
                    {msg.filteredContent}
                  </div>

                  {msg.isFlagged && (
                    <div className={`mt-2 pt-2 border-t text-[10px] font-pixel flex items-center gap-1 ${isMe ? 'border-orange-300 text-orange-100' : 'border-red-200 text-red-700'}`}>
                      <span>⚠️ Contact info detected and redacted</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Input Composer */}
      <div className="border-t-2 border-[#cc6b35] bg-white p-3 sm:p-4">
        {hasLeakWarning && (
          <div className="mb-2 p-2 rounded-lg bg-[#f7ece1] border-2 border-[#cc6b35] text-[#964115] text-[11px] flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span>
              Phone numbers, emails, and external links will be automatically masked upon sending.
            </span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 items-end">
          <textarea
            rows={2}
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message to the seller..."
            className="flex-1 rounded-xl border-2 border-orange-300 bg-[#fcfaf7] px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:border-[#b8531e] resize-y"
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
            className="text-xs px-3 sm:px-5 shrink-0"
          >
            <span>Send</span>
            <span className="hidden sm:inline ml-1">↵</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
