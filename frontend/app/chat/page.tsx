'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChatWindow } from '../../components/chat/chat-window';
import { MessageSenderRole } from '@backend/models/Message';

export default function ChatHubPage() {
  const [activeRole, setActiveRole] = useState<MessageSenderRole>('buyer');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner & POV Switcher */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 p-5 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Live In-App Support Chat
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Buyer-Seller Interactive Chat Room
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Switch perspectives below to test what the Buyer, Seller, and Safety Operator see in real time.
            </p>
          </div>

          {/* Perspective Selector */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[11px] text-zinc-500 font-mono mb-1.5">
              Select Point of View (POV):
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-white/[0.1]">
              <button
                type="button"
                onClick={() => setActiveRole('buyer')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === 'buyer'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>👤 Buyer POV</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('seller')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === 'seller'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>👨‍💻 Seller POV</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('operator')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === 'operator'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🛡️ Operator Desk</span>
              </button>
            </div>
          </div>
        </div>

        {/* POV Context Helper Card */}
        <div className="text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div>
            <strong className="text-white capitalize">Current View: {activeRole}</strong>
            <span className="text-zinc-400 ml-2">
              {activeRole === 'buyer'
                ? '— You are Ashutosh Dubey. Asking questions about your Razorpay purchase.'
                : activeRole === 'seller'
                ? '— You are the DevKit Verified author. Answering customer integration questions.'
                : '— You are the Safety Operator. Inspecting the thread for contact leakage and posting official warnings.'}
            </span>
          </div>
          {activeRole === 'operator' && (
            <Link
              href="/operator"
              className="text-purple-400 hover:text-purple-300 font-mono text-[11px] underline ml-2"
            >
              Open Full Operator Desk →
            </Link>
          )}
        </div>
      </div>

      {/* Main Interactive Chat Window */}
      <ChatWindow
        conversationId="conv_demo"
        currentUserRole={activeRole}
        currentUserName={
          activeRole === 'buyer'
            ? 'Ashutosh Dubey (Buyer)'
            : activeRole === 'seller'
            ? 'DevKit Core Team (Seller)'
            : 'Moderation Desk (Operator)'
        }
        currentUserId={
          activeRole === 'buyer'
            ? 'buyer_ashutosh'
            : activeRole === 'seller'
            ? 'seller_devkit_core'
            : 'operator_system'
        }
      />
    </div>
  );
}
