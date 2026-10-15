import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeChatMessage } from '../../../backend/chat/filter';

describe('Production Pipeline Security: DLP Chat Filtering Engine', () => {
  describe('Phone Number Leak Interception', () => {
    it('should detect and mask standard 10-digit Indian phone numbers', () => {
      const input = 'Call me directly at 9876543210 for a discount';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('phone_leak'));
      assert.ok(result.filteredText.includes('Contact info hidden'));
      assert.ok(!result.filteredText.includes('9876543210'));
    });

    it('should detect numbers with country code (+91)', () => {
      const input = 'WhatsApp me at +91 98765 43210';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('phone_leak') || result.detectedViolations.includes('whatsapp_leak'));
      assert.ok(!result.filteredText.includes('98765 43210'));
    });

    it('should detect hyphenated or dotted phone numbers', () => {
      const input = 'My number is 9876-543-210';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('phone_leak'));
    });
  });

  describe('Email Leak Interception', () => {
    it('should detect standard plain email addresses', () => {
      const input = 'Send the license code to buyer.devkit@example.com';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('email_leak'));
      assert.ok(!result.filteredText.includes('buyer.devkit@example.com'));
      assert.ok(result.filteredText.includes('Contact info hidden'));
    });

    it('should detect obfuscated email representations [at] [dot]', () => {
      const input = 'Reach out via devkit [at] domain [dot] com for direct payment';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('email_leak'));
    });

    it('should NOT flag legitimate npm package scopes or semver strings', () => {
      const input = 'You need to install @auth/core and @types/node version 20.17.0';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, false);
      assert.equal(result.detectedViolations.length, 0);
      assert.equal(result.filteredText, input);
    });
  });

  describe('UPI & Payment Channel Interception', () => {
    const upiHandles = [
      'seller@okaxis',
      'developer@okhdfcbank',
      'merchant@paytm',
      'payments@ybl',
      'freelancer@oksbi',
      'fastcode@upi',
    ];

    upiHandles.forEach((handle) => {
      it(`should detect and mask UPI handle: ${handle}`, () => {
        const input = `Pay me directly at ${handle} to avoid platform fee`;
        const result = sanitizeChatMessage(input);
        assert.equal(result.isFlagged, true);
        assert.ok(result.detectedViolations.includes('upi_leak'));
        assert.ok(!result.filteredText.includes(handle));
      });
    });
  });

  describe('Social & Off-Platform Channel Interception', () => {
    it('should detect WhatsApp wa.me links', () => {
      const input = 'Chat on https://wa.me/919876543210';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('whatsapp_leak'));
    });

    it('should detect Telegram channels and direct handles', () => {
      const input = 'Message me on https://t.me/secret_coder';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('social_leak'));
    });

    it('should detect Discord invite links', () => {
      const input = 'Join our discord at discord.gg/superhacks for source files';
      const result = sanitizeChatMessage(input);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('social_leak'));
    });
  });

  describe('Unicode Homoglyph & Obfuscation Resilience', () => {
    it('should normalize full-width digits and catch phone leaks', () => {
      // Fullwidth 9876543210
      const fullwidthPhone = 'Call me ９８７６５４３２１０';
      const result = sanitizeChatMessage(fullwidthPhone);
      assert.equal(result.isFlagged, true);
      assert.ok(result.detectedViolations.includes('phone_leak'));
    });

    it('should allow benign technical conversation', () => {
      const technicalChat =
        'To install the kit, run `npm install` and then configure your `MONGODB_URI` in `.env.local`.';
      const result = sanitizeChatMessage(technicalChat);
      assert.equal(result.isFlagged, false);
      assert.equal(result.detectedViolations.length, 0);
    });
  });
});
