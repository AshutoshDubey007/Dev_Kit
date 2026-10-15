import { Kit } from '../types/kit';
import { KITS } from '../data/kits';

const CACHE_KEY = 'devkit_custom_kits';

/**
 * Fetch all kits from MongoDB via API
 */
export async function fetchKitsFromApi(params?: {
  category?: string;
  search?: string;
  seller?: string;
  sortBy?: string;
}): Promise<Kit[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.seller) query.set('seller', params.seller);
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`/api/kits?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.kits)) {
        return data.kits;
      }
    }
  } catch (err) {
    console.error('Error fetching kits from API:', err);
  }
  return getAllKits();
}

/**
 * Fetch a single kit by slug from MongoDB via API
 */
export async function fetchKitBySlugFromApi(slug: string): Promise<Kit | null> {
  try {
    const res = await fetch(`/api/kits/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.kit) return data.kit;
    }
  } catch (err) {
    console.error(`Error fetching kit ${slug} from API:`, err);
  }
  return getKitBySlug(slug) || null;
}

/**
 * Publish a new kit to MongoDB via API
 */
export async function publishKitToBackend(newKit: Kit & { filesToScan?: any[] }): Promise<{ success: boolean; kit?: Kit; error?: string }> {
  try {
    const res = await fetch('/api/kits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKit),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to publish kit' };
    }

    // Cache locally for immediate reactivity
    saveCustomKit(data.kit || newKit);
    return { success: true, kit: data.kit || newKit };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error publishing kit' };
  }
}

/**
 * Delete a kit from MongoDB via API
 */
export async function deleteKitFromBackend(kitSlug: string, sellerEmail: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/kits/${kitSlug}?sellerEmail=${encodeURIComponent(sellerEmail)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      deleteCustomKit(kitSlug);
      return true;
    }
  } catch (err) {
    console.error('Error deleting kit from backend:', err);
  }
  return false;
}

/**
 * Get all cached custom kits from localStorage
 */
export function getCustomKits(): Kit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse cached kits:', err);
    return [];
  }
}

/**
 * Save kit to local cache
 */
export function saveCustomKit(newKit: Kit): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomKits();
    const filtered = existing.filter((k) => k.id !== newKit.id && k.slug !== newKit.slug);
    const updated = [newKit, ...filtered];
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('devkit_kits_updated', { detail: newKit }));
  } catch (err) {
    console.error('Failed to cache custom kit:', err);
  }
}

/**
 * Delete kit from local cache
 */
export function deleteCustomKit(kitIdOrSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomKits();
    const updated = existing.filter((k) => k.id !== kitIdOrSlug && k.slug !== kitIdOrSlug);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('devkit_kits_updated'));
  } catch (err) {
    console.error('Failed to remove cached kit:', err);
  }
}

/**
 * Synchronous kit catalog combining static and cached kits
 */
export function getAllKits(): Kit[] {
  const customKits = getCustomKits();
  if (customKits.length === 0) return KITS;

  const customSlugs = new Set(customKits.map((k) => k.slug));
  const baseKits = KITS.filter((k) => !customSlugs.has(k.slug));
  return [...customKits, ...baseKits];
}

/**
 * Look up a single kit by slug
 */
export function getKitBySlug(slug: string): Kit | undefined {
  const custom = getCustomKits().find((k) => k.slug === slug);
  if (custom) return custom;
  return KITS.find((k) => k.slug === slug);
}

/**
 * Retrieve kits belonging to a seller
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
