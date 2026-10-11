/**
 * Anti-Contact-Leakage Filter Engine
 * Automatically detects and censors phone numbers, emails, WhatsApp links,
 * UPI handles, and off-platform communication attempts to protect transactions.
 */

export interface FilterResult {
  originalText: string;
  filteredText: string;
  isFlagged: boolean;
  detectedViolations: string[];
}

// 1. Phone number patterns (handles Indian +91, 10-digit, spaced, dotted, dashed, parenthesized)
const PHONE_REGEX = /(\+?91[\s.-]?)?(\b[6-9]\d{9}\b|\b[6-9](\s*\d){9}\b|(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}))/gi;

// 2. Email patterns (including obfuscated variations like name[at]domain[dot]com)
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+(@|\[at\]|\(at\))[a-zA-Z0-9.-]+(\.|\s?\[dot\]\s?)[a-zA-Z]{2,})/gi;

// 3. WhatsApp mentions and direct wa.me links
const WHATSAPP_REGEX = /(wa\.me\/\d+|whatsapp(\s+me)?|ping(\s+me)?\s+on\s+wa|chat\s+on\s+wa)/gi;

// 4. UPI Payment handles (okaxis, okhdfcbank, paytm, ybl, upi, etc.)
const UPI_REGEX = /[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl)/gi;

// 5. Telegram & External socials
const TELEGRAM_REGEX = /(t\.me\/[a-zA-Z0-9_]+|telegram(\s+me)?|discord\.gg\/[a-zA-Z0-9]+)/gi;

const REPLACEMENT_MASK = '[🔒 Contact info hidden to keep transactions safe inside DevKit]';

export function sanitizeChatMessage(text: string): FilterResult {
  const violations: string[] = [];
  let filtered = text;

  // Check and mask phone numbers
  if (PHONE_REGEX.test(filtered)) {
    violations.push('phone_leak');
    filtered = filtered.replace(PHONE_REGEX, REPLACEMENT_MASK);
  }

  // Check and mask emails
  if (EMAIL_REGEX.test(filtered)) {
    violations.push('email_leak');
    filtered = filtered.replace(EMAIL_REGEX, REPLACEMENT_MASK);
  }

  // Check and mask WhatsApp
  if (WHATSAPP_REGEX.test(filtered)) {
    violations.push('whatsapp_leak');
    filtered = filtered.replace(WHATSAPP_REGEX, REPLACEMENT_MASK);
  }

  // Check and mask UPI
  if (UPI_REGEX.test(filtered)) {
    violations.push('upi_leak');
    filtered = filtered.replace(UPI_REGEX, REPLACEMENT_MASK);
  }

  // Check and mask Telegram
  if (TELEGRAM_REGEX.test(filtered)) {
    violations.push('telegram_leak');
    filtered = filtered.replace(TELEGRAM_REGEX, REPLACEMENT_MASK);
  }

  const isFlagged = violations.length > 0;

  return {
    originalText: text,
    filteredText: filtered,
    isFlagged,
    detectedViolations: violations,
  };
}
