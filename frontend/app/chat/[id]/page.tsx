'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChatWindow } from '../../../components/chat/chat-window';
import { MessageSenderRole } from '@backend/models/Message';

export default function ChatConversationPage() {
  const params = useParams();
  const conversationId = params?.id as string;

  // Role simulator for testing perspectives
  const [activeRole, setActiveRole] = useState<MessageSenderRole>('buyer');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <Link href="/" className="hover:text-zinc-300">
            Home
          </Link>
          <span>/</span>
          <Link href="/kits" className="hover:text-zinc-300">
            Kits
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Support Chat</span>
        </div>

        {/* Perspective Switcher for Testing (Buyer vs Seller vs Operator) */}
        <div className="flex items-center gap-2 text-xs bg-zinc-900/80 p-1 rounded-xl border border-white/[0.08]">
          <span className="text-[11px] text-zinc-500 font-mono px-2">Viewing as:</span>
          {(['buyer', 'seller', 'operator'] as MessageSenderRole[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                activeRole === role
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <ChatWindow
        conversationId={conversationId}
        currentUserRole={activeRole}
        currentUserName={
          activeRole === 'buyer'
            ? 'Ashutosh Dubey (Buyer)'
            : activeRole === 'seller'
            ? 'DevKit Verified Core (Seller)'
            : 'Moderation Desk (Operator)'
        }
        currentUserId={
          activeRole === 'buyer'
            ? 'buyer_user_1'
            : activeRole === 'seller'
            ? 'seller_devkit_core'
            : 'operator_1'
        }
      />
    </div>
  );
}
