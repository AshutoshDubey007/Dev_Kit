import { Kit } from '../types/kit';
import { KITS } from '../data/kits';

const STORAGE_KEY = 'devkit_custom_kits';

/**
 * Get all custom kits created by sellers from localStorage (Client-only safe)
 */
export function getCustomKits(): Kit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse custom kits from localStorage:', err);
    return [];
  }
}

/**
 * Save a newly published kit to localStorage and dispatch update event
 */
export function saveCustomKit(newKit: Kit): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomKits();
    // Prepend new kit or replace existing if id matches
    const filtered = existing.filter((k) => k.id !== newKit.id && k.slug !== newKit.slug);
    const updated = [newKit, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for real-time reactivity across components
    window.dispatchEvent(new CustomEvent('devkit_kits_updated', { detail: newKit }));
  } catch (err) {
    console.error('Failed to save custom kit to localStorage:', err);
  }
}

/**
 * Delete a custom kit by ID
 */
export function deleteCustomKit(kitId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomKits();
    const updated = existing.filter((k) => k.id !== kitId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('devkit_kits_updated'));
  } catch (err) {
    console.error('Failed to delete custom kit:', err);
  }
}

/**
 * Get all kits combining static verified kits and custom seller published kits
 */
export function getAllKits(): Kit[] {
  const customKits = getCustomKits();
  if (customKits.length === 0) return KITS;

  // Custom kits take precedence and appear first
  const customSlugs = new Set(customKits.map((k) => k.slug));
  const baseKits = KITS.filter((k) => !customSlugs.has(k.slug));
  return [...customKits, ...baseKits];
}

/**
 * Look up a single kit by slug across both custom and static catalogs
 */
export function getKitBySlug(slug: string): Kit | undefined {
  const custom = getCustomKits().find((k) => k.slug === slug);
  if (custom) return custom;
  return KITS.find((k) => k.slug === slug);
}

/**
 * Retrieve all kits belonging to a particular seller (by email or user ID)
 */
export function getSellerKits(emailOrId?: string): Kit[] {
  const customKits = getCustomKits();
  if (!emailOrId) return customKits;
  return customKits.filter(
    (k) =>
      k.sellerEmail?.toLowerCase() === emailOrId.toLowerCase() ||
      k.sellerId === emailOrId
  );
}
