import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { KITS } from '../../data/kits';
import { CATEGORIES } from '../../data/categories';

describe('Production Pipeline Quality: Marketplace Catalog Integrity', () => {
  it('marketplace must contain catalog items', () => {
    assert.ok(Array.isArray(KITS), 'KITS must be an array');
    assert.ok(KITS.length > 0, 'Catalog should have at least 1 kit');
  });

  it('all kits must possess unique IDs and unique slugs', () => {
    const idSet = new Set<string>();
    const slugSet = new Set<string>();

    for (const kit of KITS) {
      assert.ok(!idSet.has(kit.id), `Duplicate kit ID found: ${kit.id}`);
      assert.ok(!slugSet.has(kit.slug), `Duplicate kit slug found: ${kit.slug}`);
      idSet.add(kit.id);
      slugSet.add(kit.slug);
    }
  });

  it('all kit prices must be valid positive finite numbers', () => {
    for (const kit of KITS) {
      assert.ok(typeof kit.priceINR === 'number', `Kit ${kit.id} priceINR must be a number`);
      assert.ok(kit.priceINR >= 0, `Kit ${kit.id} priceINR must be non-negative`);
      assert.ok(Number.isFinite(kit.priceINR), `Kit ${kit.id} priceINR must be finite`);

      if (kit.priceUSD !== undefined) {
        assert.ok(typeof kit.priceUSD === 'number', `Kit ${kit.id} priceUSD must be a number`);
        assert.ok(kit.priceUSD >= 0, `Kit ${kit.id} priceUSD must be non-negative`);
      }
    }
  });

  it('all kit categories must reference valid registered categories', () => {
    const validCategorySlugs = new Set(CATEGORIES.map((c) => c.slug));

    for (const kit of KITS) {
      assert.ok(
        validCategorySlugs.has(kit.category),
        `Kit ${kit.id} references unregistered category: ${kit.category}`
      );
    }
  });

  it('all kits must have complete required metadata fields', () => {
    for (const kit of KITS) {
      assert.ok(kit.title && kit.title.trim().length > 0, `Kit ${kit.id} missing title`);
      assert.ok(kit.tagline && kit.tagline.trim().length > 0, `Kit ${kit.id} missing tagline`);
      assert.ok(kit.description && kit.description.trim().length > 0, `Kit ${kit.id} missing description`);
      assert.ok(Array.isArray(kit.features) && kit.features.length > 0, `Kit ${kit.id} missing features`);
      assert.ok(Array.isArray(kit.techStack) && kit.techStack.length > 0, `Kit ${kit.id} missing techStack`);
      assert.ok(kit.verification, `Kit ${kit.id} missing verification metadata`);
      assert.ok(kit.verification.testSuitePassRate >= 0 && kit.verification.testSuitePassRate <= 100);
    }
  });

  it('all registered categories must have unique slugs and names', () => {
    const catSlugSet = new Set<string>();
    for (const cat of CATEGORIES) {
      assert.ok(!catSlugSet.has(cat.slug), `Duplicate category slug found: ${cat.slug}`);
      catSlugSet.add(cat.slug);
      assert.ok(cat.name && cat.name.trim().length > 0, 'Category missing name');
      assert.ok(cat.description && cat.description.trim().length > 0, 'Category missing description');
    }
  });
});
