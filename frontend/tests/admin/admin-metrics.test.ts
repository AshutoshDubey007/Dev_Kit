import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Production Pipeline Quality: Admin Platform Metrics & Role Transitions', () => {
  describe('Revenue Calculation Invariants', () => {
    function computePlatformGMV(orders: Array<{ amountINR: number; status: string }>): number {
      return orders
        .filter((o) => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amountINR || 0), 0);
    }

    it('only orders with status "paid" contribute to platform revenue', () => {
      const mockOrders = [
        { amountINR: 1499, status: 'paid' },
        { amountINR: 1999, status: 'paid' },
        { amountINR: 4999, status: 'created' }, // pending, should NOT count
        { amountINR: 2499, status: 'failed' },  // failed, should NOT count
      ];

      const totalRevenue = computePlatformGMV(mockOrders);
      assert.equal(totalRevenue, 1499 + 1999);
    });

    it('returns 0 revenue when no orders are paid', () => {
      const mockOrders = [
        { amountINR: 1499, status: 'created' },
        { amountINR: 2999, status: 'failed' },
      ];
      assert.equal(computePlatformGMV(mockOrders), 0);
    });

    it('handles empty order list gracefully without throwing', () => {
      assert.equal(computePlatformGMV([]), 0);
    });
  });

  describe('User Role Assignment Rules', () => {
    const VALID_ROLES = ['buyer', 'seller', 'operator', 'admin'] as const;

    function isValidRoleTransition(fromRole: string, toRole: string): boolean {
      if (!VALID_ROLES.includes(fromRole as any)) return false;
      if (!VALID_ROLES.includes(toRole as any)) return false;
      return true;
    }

    it('allows transitions between recognized platform roles', () => {
      assert.equal(isValidRoleTransition('buyer', 'seller'), true);
      assert.equal(isValidRoleTransition('seller', 'operator'), true);
      assert.equal(isValidRoleTransition('operator', 'admin'), true);
      assert.equal(isValidRoleTransition('admin', 'buyer'), true);
    });

    it('rejects arbitrary or unknown role promotions', () => {
      assert.equal(isValidRoleTransition('buyer', 'root'), false);
      assert.equal(isValidRoleTransition('buyer', 'superadmin'), false);
      assert.equal(isValidRoleTransition('buyer', ''), false);
    });
  });
});
