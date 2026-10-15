import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Feature Quality: Support Tickets, Transitions & Automated Chat Lifecycle', () => {
  interface MockTicket {
    ticketId: string;
    verificationId: string;
    orderId: string;
    buyerEmail: string;
    sellerEmail: string;
    title: string;
    description: string;
    environment: Record<string, string>;
    status:
      | 'open'
      | 'awaiting_seller'
      | 'awaiting_buyer'
      | 'resolution_proposed'
      | 'resolved'
      | 'closed'
      | 'reopened';
    proposedResolution?: { notes: string; proposedAt: Date };
    resolvedAt?: Date;
    lastActivityAt: Date;
    lastReminderAt?: Date;
    createdAt: Date;
  }

  interface MockVerification {
    verificationId: string;
    orderId: string;
    buyerEmail: string;
    sellerEmail: string;
    purchaseVerifiedAt: Date;
    verificationDeadline: Date;
    verificationStatus: 'pending' | 'verified_success' | 'issue_reported' | 'expired';
    chatConversationId: string;
    supportCaseId?: string;
  }

  interface MockConversation {
    conversationId: string;
    status: 'active' | 'closed';
    closureReason?: string | null;
  }

  let ticketsStore: Map<string, MockTicket>;
  let verificationsStore: Map<string, MockVerification>;
  let conversationsStore: Map<string, MockConversation>;
  let notificationsStore: Array<{ userId: string; title: string; message: string }>;

  beforeEach(() => {
    ticketsStore = new Map();
    verificationsStore = new Map();
    conversationsStore = new Map();
    notificationsStore = [];
  });

  function createSupportTicket(
    input: {
      verificationId: string;
      buyerEmail: string;
      title: string;
      description: string;
      environment?: Record<string, string>;
    },
    currentTime: Date
  ): { success: boolean; error?: string; ticket?: MockTicket } {
    const verif = verificationsStore.get(input.verificationId);
    if (!verif) return { success: false, error: 'Verification window not found' };

    // Authorization
    if (verif.buyerEmail.toLowerCase() !== input.buyerEmail.toLowerCase()) {
      return { success: false, error: 'Unauthorized: Cannot create ticket against another user order' };
    }

    // Deadline check
    if (currentTime.getTime() > verif.verificationDeadline.getTime() && verif.verificationStatus === 'expired') {
      return { success: false, error: '7-day product verification deadline has expired' };
    }

    // Input validation
    if (!input.title || input.title.trim().length < 5) {
      return { success: false, error: 'Title must be at least 5 characters' };
    }
    if (!input.description || input.description.trim().length < 10) {
      return { success: false, error: 'Description must be at least 10 characters' };
    }

    const ticketId = `TCK-${Date.now()}`;
    const ticket: MockTicket = {
      ticketId,
      verificationId: verif.verificationId,
      orderId: verif.orderId,
      buyerEmail: verif.buyerEmail,
      sellerEmail: verif.sellerEmail,
      title: input.title.trim(),
      description: input.description.trim(),
      environment: input.environment || { os: 'Windows 11', runtime: 'Node 20' },
      status: 'open',
      lastActivityAt: currentTime,
      createdAt: currentTime,
    };

    ticketsStore.set(ticketId, ticket);

    // Update verification
    verif.verificationStatus = 'issue_reported';
    verif.supportCaseId = ticketId;

    // Ensure chat conversation is active
    if (conversationsStore.has(verif.chatConversationId)) {
      const conv = conversationsStore.get(verif.chatConversationId)!;
      conv.status = 'active';
      conv.closureReason = null;
    }

    notificationsStore.push({
      userId: verif.sellerEmail,
      title: `Issue Reported: ${input.title}`,
      message: `Buyer filed ticket ${ticketId}`,
    });

    return { success: true, ticket };
  }

  function proposeResolution(
    ticketId: string,
    sellerEmail: string,
    notes: string,
    currentTime: Date
  ): { success: boolean; error?: string; ticket?: MockTicket } {
    const ticket = ticketsStore.get(ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    if (ticket.sellerEmail.toLowerCase() !== sellerEmail.toLowerCase()) {
      return { success: false, error: 'Unauthorized seller' };
    }

    ticket.status = 'resolution_proposed';
    ticket.proposedResolution = { notes, proposedAt: currentTime };
    ticket.lastActivityAt = currentTime;

    notificationsStore.push({
      userId: ticket.buyerEmail,
      title: 'Resolution Proposed',
      message: notes,
    });

    return { success: true, ticket };
  }

  function confirmResolution(
    ticketId: string,
    buyerEmail: string,
    currentTime: Date
  ): { success: boolean; error?: string; ticket?: MockTicket } {
    const ticket = ticketsStore.get(ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    if (ticket.buyerEmail.toLowerCase() !== buyerEmail.toLowerCase()) {
      return { success: false, error: 'Unauthorized buyer' };
    }

    ticket.status = 'resolved';
    ticket.resolvedAt = currentTime;
    ticket.lastActivityAt = currentTime;

    // Check if other tickets remain
    const otherOpen = Array.from(ticketsStore.values()).filter(
      (t) => t.verificationId === ticket.verificationId && t.status !== 'resolved' && t.status !== 'closed'
    );

    if (otherOpen.length === 0) {
      const verif = verificationsStore.get(ticket.verificationId);
      if (verif) {
        verif.verificationStatus = 'verified_success';
      }
    }

    return { success: true, ticket };
  }

  function reopenTicket(
    ticketId: string,
    buyerEmail: string,
    reason: string,
    currentTime: Date
  ): { success: boolean; error?: string; ticket?: MockTicket } {
    const ticket = ticketsStore.get(ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };

    if (ticket.buyerEmail.toLowerCase() !== buyerEmail.toLowerCase()) {
      return { success: false, error: 'Unauthorized buyer' };
    }

    ticket.status = 'reopened';
    ticket.lastActivityAt = currentTime;

    const verif = verificationsStore.get(ticket.verificationId);
    if (verif) {
      verif.verificationStatus = 'issue_reported';
      if (conversationsStore.has(verif.chatConversationId)) {
        conversationsStore.get(verif.chatConversationId)!.status = 'active';
      }
    }

    return { success: true, ticket };
  }

  // Cron cycle implementation for test
  function runCronCycle(currentTime: Date): { expiredCount: number; closedChats: number; remindersCount: number } {
    let expiredCount = 0;
    let closedChats = 0;
    let remindersCount = 0;

    // 1. Process 7-day expirations
    for (const verif of Array.from(verificationsStore.values())) {
      if (verif.verificationStatus === 'pending' && currentTime.getTime() >= verif.verificationDeadline.getTime()) {
        const openTickets = Array.from(ticketsStore.values()).filter(
          (t) => t.verificationId === verif.verificationId && ['open', 'awaiting_seller', 'awaiting_buyer', 'resolution_proposed', 'reopened'].includes(t.status)
        );

        if (openTickets.length === 0) {
          verif.verificationStatus = 'expired';
          expiredCount++;
          if (conversationsStore.has(verif.chatConversationId)) {
            const conv = conversationsStore.get(verif.chatConversationId)!;
            conv.status = 'closed';
            conv.closureReason = '7-day product verification period concluded without issue reports';
            closedChats++;
          }
        }
      }
    }

    // 2. Inactivity reminders
    for (const ticket of Array.from(ticketsStore.values())) {
      if (['open', 'awaiting_seller', 'awaiting_buyer', 'resolution_proposed'].includes(ticket.status)) {
        const baseline = ticket.lastReminderAt || ticket.lastActivityAt;
        const diffHours = (currentTime.getTime() - baseline.getTime()) / (1000 * 60 * 60);

        const need24 = !ticket.lastReminderAt && diffHours >= 24;
        const need48 = ticket.lastReminderAt && diffHours >= 48;

        if (need24 || need48) {
          ticket.lastReminderAt = currentTime;
          remindersCount++;
          const target = ['awaiting_buyer', 'resolution_proposed'].includes(ticket.status) ? ticket.buyerEmail : ticket.sellerEmail;
          notificationsStore.push({
            userId: target,
            title: `Reminder: Action needed on ticket ${ticket.ticketId}`,
            message: `No response for ${need24 ? '24' : '48'} hours`,
          });
        }
      }
    }

    return { expiredCount, closedChats, remindersCount };
  }

  describe('Report an Issue & Support Ticket Creation', () => {
    it('should create persistent ticket, link to existing chat, and set verification status to issue_reported', () => {
      const startDate = new Date('2026-10-16T12:00:00.000Z');
      const verif: MockVerification = {
        verificationId: 'VERIF-T1',
        orderId: 'ORD-T1',
        buyerEmail: 'ashutosh@agency.dev',
        sellerEmail: 'support@devkit.store',
        purchaseVerifiedAt: startDate,
        verificationDeadline: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        verificationStatus: 'pending',
        chatConversationId: 'conv_t1',
      };
      verificationsStore.set(verif.verificationId, verif);
      conversationsStore.set('conv_t1', { conversationId: 'conv_t1', status: 'active' });

      // File issue on Day 3
      const day3 = new Date('2026-10-19T10:00:00.000Z');
      const res = createSupportTicket(
        {
          verificationId: 'VERIF-T1',
          buyerEmail: 'ashutosh@agency.dev',
          title: 'Next.js 15 route params promise error',
          description: 'Awaiting params in route handler causes build failure with Next.js 15.1.0',
          environment: { os: 'Ubuntu 24.04', runtime: 'Node v20.12.0' },
        },
        day3
      );

      assert.equal(res.success, true);
      assert.equal(res.ticket?.status, 'open');
      assert.equal(verif.verificationStatus, 'issue_reported');
      assert.equal(verif.supportCaseId, res.ticket?.ticketId);

      // Verify notification sent to seller
      const sellerNotif = notificationsStore.find((n) => n.userId === 'support@devkit.store');
      assert.ok(sellerNotif);
      assert.match(sellerNotif.title, /Issue Reported/);
    });

    it('should reject unauthorized users filing tickets against someone else order', () => {
      const startDate = new Date('2026-10-16T12:00:00.000Z');
      const verif: MockVerification = {
        verificationId: 'VERIF-T2',
        orderId: 'ORD-T2',
        buyerEmail: 'realowner@devkit.store',
        sellerEmail: 'support@devkit.store',
        purchaseVerifiedAt: startDate,
        verificationDeadline: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        verificationStatus: 'pending',
        chatConversationId: 'conv_t2',
      };
      verificationsStore.set(verif.verificationId, verif);

      const res = createSupportTicket(
        {
          verificationId: 'VERIF-T2',
          buyerEmail: 'attacker@random.com',
          title: 'Malicious ticket attempt',
          description: 'Trying to disrupt seller ratings',
        },
        startDate
      );

      assert.equal(res.success, false);
      assert.match(res.error || '', /Unauthorized/);
      assert.equal(verif.verificationStatus, 'pending');
    });
  });

  describe('Ticket State Machine Transitions', () => {
    it('should cleanly transition through proposal, resolution, and reopening', () => {
      const clock = new Date('2026-10-16T12:00:00.000Z');
      const verif: MockVerification = {
        verificationId: 'VERIF-SM',
        orderId: 'ORD-SM',
        buyerEmail: 'buyer@agency.dev',
        sellerEmail: 'seller@devkit.store',
        purchaseVerifiedAt: clock,
        verificationDeadline: new Date(clock.getTime() + 7 * 24 * 60 * 60 * 1000),
        verificationStatus: 'pending',
        chatConversationId: 'conv_sm',
      };
      verificationsStore.set(verif.verificationId, verif);
      conversationsStore.set('conv_sm', { conversationId: 'conv_sm', status: 'active' });

      // 1. Create ticket
      const ticketRes = createSupportTicket(
        {
          verificationId: 'VERIF-SM',
          buyerEmail: 'buyer@agency.dev',
          title: 'Webhook signature failure',
          description: 'Webhook fails on payload verification',
        },
        clock
      );
      assert.equal(ticketRes.success, true);
      const ticketId = ticketRes.ticket!.ticketId;

      // 2. Seller proposes resolution
      const propTime = new Date('2026-10-17T15:00:00.000Z');
      const propRes = proposeResolution(ticketId, 'seller@devkit.store', 'Update .env RAZORPAY_WEBHOOK_SECRET', propTime);
      assert.equal(propRes.success, true);
      assert.equal(propRes.ticket?.status, 'resolution_proposed');

      // 3. Buyer confirms resolution
      const confirmTime = new Date('2026-10-18T09:00:00.000Z');
      const confirmRes = confirmResolution(ticketId, 'buyer@agency.dev', confirmTime);
      assert.equal(confirmRes.success, true);
      assert.equal(confirmRes.ticket?.status, 'resolved');
      assert.equal(verif.verificationStatus, 'verified_success');

      // 4. Buyer reopens ticket
      const reopenTime = new Date('2026-10-18T18:00:00.000Z');
      const reopenRes = reopenTicket(ticketId, 'buyer@agency.dev', 'Error recurred on production build', reopenTime);
      assert.equal(reopenRes.success, true);
      assert.equal(reopenRes.ticket?.status, 'reopened');
      assert.equal(verif.verificationStatus, 'issue_reported');
    });
  });

  describe('Automated Chat Lifecycle & Cron Engine (Clock Simulation)', () => {
    it('should close verification-only conversation after 7 days when NO issue is filed', () => {
      const purchaseTime = new Date('2026-10-01T10:00:00.000Z');
      const verif: MockVerification = {
        verificationId: 'VERIF-EXPIRE',
        orderId: 'ORD-EXPIRE',
        buyerEmail: 'buyer@agency.dev',
        sellerEmail: 'seller@devkit.store',
        purchaseVerifiedAt: purchaseTime,
        verificationDeadline: new Date(purchaseTime.getTime() + 7 * 24 * 60 * 60 * 1000), // Oct 8, 10:00 UTC
        verificationStatus: 'pending',
        chatConversationId: 'conv_expire',
      };
      verificationsStore.set(verif.verificationId, verif);
      conversationsStore.set('conv_expire', { conversationId: 'conv_expire', status: 'active' });

      // Run cron on Day 6: Window must still be active
      const day6 = new Date('2026-10-07T10:00:00.000Z');
      const r6 = runCronCycle(day6);
      assert.equal(r6.expiredCount, 0);
      assert.equal(conversationsStore.get('conv_expire')?.status, 'active');

      // Run cron on Day 8 (+7 days + 1 day past deadline): Window expires & conversation closes
      const day8 = new Date('2026-10-09T10:00:00.000Z');
      const r8 = runCronCycle(day8);
      assert.equal(r8.expiredCount, 1);
      assert.equal(r8.closedChats, 1);
      assert.equal(verif.verificationStatus, 'expired');
      assert.equal(conversationsStore.get('conv_expire')?.status, 'closed');
    });

    it('should PRESERVE conversation and ticket beyond day 7 if a ticket was filed before deadline', () => {
      const purchaseTime = new Date('2026-10-01T10:00:00.000Z');
      const verif: MockVerification = {
        verificationId: 'VERIF-KEEP-OPEN',
        orderId: 'ORD-KEEP-OPEN',
        buyerEmail: 'buyer@agency.dev',
        sellerEmail: 'seller@devkit.store',
        purchaseVerifiedAt: purchaseTime,
        verificationDeadline: new Date(purchaseTime.getTime() + 7 * 24 * 60 * 60 * 1000), // Oct 8, 10:00 UTC
        verificationStatus: 'pending',
        chatConversationId: 'conv_keep_open',
      };
      verificationsStore.set(verif.verificationId, verif);
      conversationsStore.set('conv_keep_open', { conversationId: 'conv_keep_open', status: 'active' });

      // File issue on Day 4
      const day4 = new Date('2026-10-05T12:00:00.000Z');
      createSupportTicket(
        {
          verificationId: 'VERIF-KEEP-OPEN',
          buyerEmail: 'buyer@agency.dev',
          title: 'Database connection pooling issue',
          description: 'Connections exhaust after 10 concurrent requests',
        },
        day4
      );

      // Now run cron on Day 10 (well past the 7-day window)
      const day10 = new Date('2026-10-11T10:00:00.000Z');
      const r10 = runCronCycle(day10);

      // Must NOT expire or close! Ticket keeps conversation open
      assert.equal(r10.closedChats, 0);
      assert.equal(verif.verificationStatus, 'issue_reported');
      assert.equal(conversationsStore.get('conv_keep_open')?.status, 'active');
    });

    it('should dispatch follow-up reminders at 24h and 48h intervals for pending tickets', () => {
      const baseTime = new Date('2026-10-16T10:00:00.000Z');
      const ticket: MockTicket = {
        ticketId: 'TCK-REMINDER-1',
        verificationId: 'VERIF-REM',
        orderId: 'ORD-REM',
        buyerEmail: 'buyer@test.com',
        sellerEmail: 'seller@test.com',
        title: 'Pending seller assistance',
        description: 'Waiting for seller to answer config question',
        environment: {},
        status: 'open', // awaiting seller
        lastActivityAt: baseTime,
        createdAt: baseTime,
      };
      ticketsStore.set(ticket.ticketId, ticket);

      // +10 hours: No reminder yet
      const t10 = new Date('2026-10-16T20:00:00.000Z');
      const r1 = runCronCycle(t10);
      assert.equal(r1.remindersCount, 0);

      // +25 hours: First reminder dispatched (24h threshold)
      const t25 = new Date('2026-10-17T11:00:00.000Z');
      const r2 = runCronCycle(t25);
      assert.equal(r2.remindersCount, 1);
      assert.ok(ticket.lastReminderAt);

      // +35 hours (10 hours after 1st reminder): No second reminder yet
      const t35 = new Date('2026-10-17T21:00:00.000Z');
      const r3 = runCronCycle(t35);
      assert.equal(r3.remindersCount, 0);

      // +75 hours (50 hours after 1st reminder): Second reminder dispatched (48h threshold)
      const t75 = new Date('2026-10-19T13:00:00.000Z');
      const r4 = runCronCycle(t75);
      assert.equal(r4.remindersCount, 1);
    });
  });
});
