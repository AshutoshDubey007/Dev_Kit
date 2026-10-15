/**
 * Anti-Contact-Leakage Filter Engine (DevKit DLP)
 * Automatically detects and censors phone numbers, emails, WhatsApp links,
 * UPI handles, and off-platform communication attempts to protect transactions.
 * Includes Unicode normalization (NFKC) and guards against false positives on code snippets.
 */

export interface FilterResult {
  originalText: string;
  filteredText: string;
  isFlagged: boolean;
  detectedViolations: string[];
}

// 1. Phone number patterns:
// Matches standard 10-digit Indian numbers, with optional +91, dots, spaces, hyphens, parentheses
const PHONE_REGEX = /(\+?91[\s.-]?)?(\b[6-9]\d{9}\b|\b[6-9]([\s.-]*\d){9}\b|(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}))/gi;

// 2. Email patterns:
// Matches standard emails and obfuscated formats like:
// user@example.com, user [at] example [dot] com, user(at)example(dot)com
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+(?:\s*@\s*|\s*\[at\]\s*|\s*\(at\)\s*)[a-zA-Z0-9.-]+(?:\s*\.\s*|\s*\[dot\]\s*|\s*\(dot\)\s*)[a-zA-Z]{2,})/gi;

// 3. WhatsApp mentions, links, and direct messaging invites
const WHATSAPP_REGEX = /(https?:\/\/)?(wa\.me\/\d+|api\.whatsapp\.com\/send\?phone=\d+|whatsapp(\.com)?|ping(\s+me)?\s+(?:on\s+)?wa|chat\s+(?:on\s+)?wa|text\s+me\s+on\s+whatsapp)/gi;

// 4. UPI Payment handles (okaxis, okhdfcbank, paytm, ybl, upi, etc.)
const UPI_REGEX = /[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl|barodampay|icici|axisbank)/gi;

// 5. Telegram, Discord, and external social handles for off-platform communication
const SOCIAL_LEAK_REGEX = /(https?:\/\/)?(t\.me\/[a-zA-Z0-9_]+|telegram(\s+me)?|discord\.gg\/[a-zA-Z0-9]+|discordapp\.com\/users\/\d+|instagram\.com\/[a-zA-Z0-9_.]+|twitter\.com\/[a-zA-Z0-9_]+|x\.com\/[a-zA-Z0-9_]+)/gi;

const REPLACEMENT_MASK = '[🔒 Contact info hidden to keep transactions safe inside DevKit]';

/**
 * Normalizes text to handle Unicode homoglyphs, full-width digits/symbols,
 * and hidden zero-width characters that malicious users might use to bypass filters.
 */
function normalizeInput(text: string): string {
  // NFKC decomposes and transforms compatibility characters (like fullwidth ９ to 9, ＠ to @)
  let normalized = text.normalize('NFKC');
  // Remove zero-width spaces and soft hyphens
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');
  return normalized;
}

/**
 * Checks if a string segment is a legitimate code block, import statement, or URL that
 * should not trigger false positives.
 */
function isCodeSnippetOrPackage(segment: string): boolean {
  // Guard against package imports like '@auth/core', '@types/node', etc.
  if (/^@[a-z0-9-]+\/[a-z0-9-]+$/i.test(segment.trim())) {
    return true;
  }
  // Guard against semver like '15.1.0'
  if (/^\d+\.\d+\.\d+$/i.test(segment.trim())) {
    return true;
  }
  return false;
}

export function sanitizeChatMessage(text: string): FilterResult {
  const normalized = normalizeInput(text);
  const violations: string[] = [];
  let filtered = normalized;

  // Helper to test and reset stateful global regex
  const testAndReset = (regex: RegExp, str: string) => {
    regex.lastIndex = 0;
    const matched = regex.test(str);
    regex.lastIndex = 0;
    return matched;
  };

  // 1. Check and mask WhatsApp (URLs and text invites)
  if (testAndReset(WHATSAPP_REGEX, filtered)) {
    violations.push('whatsapp_leak');
    WHATSAPP_REGEX.lastIndex = 0;
    filtered = filtered.replace(WHATSAPP_REGEX, REPLACEMENT_MASK);
  }

  // 2. Check and mask Telegram / Discord / external social channels
  if (testAndReset(SOCIAL_LEAK_REGEX, filtered)) {
    violations.push('social_leak');
    SOCIAL_LEAK_REGEX.lastIndex = 0;
    filtered = filtered.replace(SOCIAL_LEAK_REGEX, REPLACEMENT_MASK);
  }

  // 3. Check and mask UPI handles
  if (testAndReset(UPI_REGEX, filtered)) {
    violations.push('upi_leak');
    UPI_REGEX.lastIndex = 0;
    filtered = filtered.replace(UPI_REGEX, REPLACEMENT_MASK);
  }

  // 4. Check and mask phone numbers
  if (testAndReset(PHONE_REGEX, filtered)) {
    violations.push('phone_leak');
    PHONE_REGEX.lastIndex = 0;
    filtered = filtered.replace(PHONE_REGEX, REPLACEMENT_MASK);
  }

  // 5. Check and mask emails (excluding package scopes like @auth/core)
  EMAIL_REGEX.lastIndex = 0;
  const emailMatches = filtered.match(EMAIL_REGEX);
  if (emailMatches) {
    let hasActualEmail = false;
    for (const match of emailMatches) {
      if (!isCodeSnippetOrPackage(match)) {
        hasActualEmail = true;
        break;
      }
    }
    if (hasActualEmail) {
      violations.push('email_leak');
      EMAIL_REGEX.lastIndex = 0;
      filtered = filtered.replace(EMAIL_REGEX, (match) => {
        return isCodeSnippetOrPackage(match) ? match : REPLACEMENT_MASK;
      });
    }
  }

  const isFlagged = violations.length > 0;

  return {
    originalText: text,
    filteredText: filtered,
    isFlagged,
    detectedViolations: violations,
  };
}
