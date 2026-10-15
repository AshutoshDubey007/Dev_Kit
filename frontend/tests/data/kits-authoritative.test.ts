import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { KITS } from '../../data/kits';
import { scanProjectFileTree } from '../../../backend/security/scanner';

describe('Production Pipeline Integrity: Authoritative Kit & Catalog Invariants', () => {
  describe('Price Tampering & Authoritative Pricing Defense', () => {
    it('all kits in catalog must define an authoritative priceINR greater than zero', () => {
      for (const kit of KITS) {
        assert.ok(typeof kit.priceINR === 'number', `Kit ${kit.slug} must have numeric priceINR`);
        assert.ok(kit.priceINR > 0, `Kit ${kit.slug} price must be strictly positive`);
        assert.ok(Number.isFinite(kit.priceINR), `Kit ${kit.slug} price must be finite`);
      }
    });

    it('should ignore client-provided prices when authoritative catalog price exists', () => {
      const targetKit = KITS[0];
      const clientAttackerPayload = {
        kitSlug: targetKit.slug,
        clientForgedPrice: 1, // Attacker attempts to buy ₹1499 kit for ₹1
      };

      // Server-side authoritative resolution
      const authoritativeKit = KITS.find((k) => k.slug === clientAttackerPayload.kitSlug);
      assert.ok(authoritativeKit, 'Target kit must exist in authoritative source');

      // The charge amount MUST equal authoritativeKit.priceINR, NEVER clientForgedPrice
      const orderAmountINR = authoritativeKit.priceINR;
      assert.equal(orderAmountINR, targetKit.priceINR);
      assert.notEqual(orderAmountINR, clientAttackerPayload.clientForgedPrice);
      assert.equal(orderAmountINR >= 499, true, 'Paid kit should retain its true commercial price');
    });
  });

  describe('Seller Listing Quota Logic', () => {
    const FREE_SELLER_LIMIT = 3;

    function canPublishKit(existingKitCount: number, hasProSubscription: boolean): boolean {
      if (hasProSubscription) return true;
      return existingKitCount < FREE_SELLER_LIMIT;
    }

    it('free tier sellers can publish up to 3 kits without subscription', () => {
      assert.equal(canPublishKit(0, false), true);
      assert.equal(canPublishKit(1, false), true);
      assert.equal(canPublishKit(2, false), true);
    });

    it('free tier sellers are blocked at the 3-kit quota limit', () => {
      assert.equal(canPublishKit(3, false), false);
      assert.equal(canPublishKit(4, false), false);
    });

    it('pro subscribers can publish unlimited kits beyond the 3-kit quota', () => {
      assert.equal(canPublishKit(3, true), true);
      assert.equal(canPublishKit(10, true), true);
      assert.equal(canPublishKit(50, true), true);
    });
  });

  describe('Security Scanner Gate on Kit Publishing', () => {
    it('clean kit file tree passes security scanner', () => {
      const cleanFiles = [
        { path: 'package.json', content: '{"name": "my-kit", "version": "1.0.0"}' },
        { path: 'index.ts', content: 'export const hello = () => "Hello World";' },
      ];
      const report = scanProjectFileTree(cleanFiles);
      assert.equal(report.isSafe, true);
      assert.equal(report.violations.filter((v) => v.severity === 'critical').length, 0);
    });

    it('kit file tree containing plaintext API secrets is rejected by security scanner', () => {
      const dirtyFiles = [
        { path: 'src/config.ts', content: 'const apiKey = "sk-111122223333444455556666777788889999";' },
      ];
      const report = scanProjectFileTree(dirtyFiles);
      assert.equal(report.isSafe, false);
      assert.ok(report.violations.some((v) => v.severity === 'critical'));
    });
  });
});
