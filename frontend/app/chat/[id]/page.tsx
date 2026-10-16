'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChatWindow } from '../../../components/chat/chat-window';
import { MessageSenderRole } from '@backend/models/Message';
import { useAuth } from '../../../lib/auth-context';
import { Badge } from '../../../components/ui/badge';
import { UserCheck } from 'lucide-react';

export default function ChatConversationPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const { currentUser } = useAuth();

  // Ensure window stays at top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Determine user role and identity dynamically from active authenticated session
  const userRole: MessageSenderRole =
    currentUser?.role === 'seller'
      ? 'seller'
      : currentUser?.role === 'operator' || currentUser?.role === 'admin'
      ? 'operator'
      : 'buyer';

  const userName =
    currentUser?.name ||
    (userRole === 'seller'
      ? 'Verified Seller'
      : userRole === 'operator'
      ? 'Safety Desk Operator'
      : 'Verified Buyer');

  const userId =
    currentUser?.id ||
    currentUser?.email ||
    (userRole === 'seller'
      ? 'seller_session'
      : userRole === 'operator'
      ? 'operator_session'
      : 'buyer_session');

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

        {/* Authenticated Participant Identity Badge */}
        <div className="flex items-center gap-2 text-xs bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-white/[0.08]">
          <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400 font-mono">Chatting as:</span>
          <span className="text-xs font-semibold text-white">{userName}</span>
          <Badge
            variant={userRole === 'seller' ? 'secondary' : userRole === 'operator' ? 'purple' : 'default'}
            size="sm"
            className="capitalize text-[10px]"
          >
            {userRole}
          </Badge>
        </div>
      </div>

      {/* Main Chat Window */}
      <ChatWindow
        conversationId={conversationId}
        currentUserRole={userRole}
        currentUserName={userName}
        currentUserId={userId}
      />
    </div>
  );
}
