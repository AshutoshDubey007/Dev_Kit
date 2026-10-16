/**
 * DevKit Production Input Validation & Security Utilities
 * 
 * Protects against NoSQL injection, SSRF, XSS, and payload bloat.
 */

/**
 * Validates and sanitizes a string input with bounds and safe character checks.
 */
export function validateString(
  value: unknown,
  options: {
    fieldName: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  }
): { valid: boolean; value: string; error?: string } {
  const { fieldName, minLength = 0, maxLength = 10000, pattern, required = true } = options;

  if (value === undefined || value === null || typeof value !== 'string') {
    if (required) {
      return { valid: false, value: '', error: `${fieldName} is required and must be a string.` };
    }
    return { valid: true, value: '' };
  }

  const trimmed = value.trim();

  if (required && trimmed.length < minLength) {
    return { valid: false, value: trimmed, error: `${fieldName} must be at least ${minLength} characters.` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, value: trimmed, error: `${fieldName} exceeds maximum permitted length of ${maxLength} characters.` };
  }

  if (pattern && !pattern.test(trimmed)) {
    return { valid: false, value: trimmed, error: `${fieldName} contains invalid format or disallowed characters.` };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validates an email address according to RFC 5322 standard with length limits.
 */
export function validateEmail(email: unknown): { valid: boolean; email: string; error?: string } {
  const res = validateString(email, {
    fieldName: 'Email',
    minLength: 5,
    maxLength: 254,
    required: true,
  });

  if (!res.valid) return { valid: false, email: '', error: res.error };

  // Standard safe email pattern without catastrophic backtracking
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(res.value)) {
    return { valid: false, email: res.value, error: 'Please enter a valid email address.' };
  }

  return { valid: true, email: res.value.toLowerCase() };
}

/**
 * Prevents SSRF attacks by strictly verifying that a repository URL belongs
 * exclusively to public GitHub (https://github.com/owner/repo) and does not point to
 * internal networks (127.0.0.1, 169.254.169.254, localhost, file://).
 */
export function validateGitHubUrl(urlInput: unknown): {
  valid: boolean;
  owner?: string;
  repo?: string;
  error?: string;
} {
  const res = validateString(urlInput, {
    fieldName: 'Repository URL',
    minLength: 15,
    maxLength: 200,
    required: true,
  });

  if (!res.valid) return { valid: false, error: res.error };

  try {
    const parsed = new URL(res.value);

    // Protocol must be HTTPS
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Repository URL must use https:// protocol.' };
    }

    // Host must be strictly github.com
    if (parsed.hostname.toLowerCase() !== 'github.com') {
      return { valid: false, error: 'Only public repositories hosted on github.com are permitted.' };
    }

    // Path segments validation: /owner/repo
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2) {
      return { valid: false, error: 'Invalid GitHub repository path. Format must be https://github.com/owner/repo' };
    }

    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/, '');

    // Strict GitHub identifier rules (alphanumeric, hyphens, underscores, dots)
    const identRegex = /^[a-zA-Z0-9-_.]+$/;
    if (!identRegex.test(owner) || !identRegex.test(repo)) {
      return { valid: false, error: 'Repository owner or name contains invalid characters.' };
    }

    // Disallow path traversal or internal metadata keywords
    if (owner === '..' || repo === '..' || owner.includes('%') || repo.includes('%')) {
      return { valid: false, error: 'Malformed repository path detected.' };
    }

    return { valid: true, owner, repo };
  } catch {
    return { valid: false, error: 'Malformed URL provided.' };
  }
}

/**
 * Sanitizes object keys to prevent MongoDB NoSQL operator injection ($where, $gt, etc.).
 */
export function sanitizeNoSqlInput<T>(input: T): T {
  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeNoSqlInput) as unknown as T;
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(input)) {
    // Strip keys starting with $ or containing . (MongoDB operator injection vectors)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleanObj[key] = sanitizeNoSqlInput(val);
  }

  return cleanObj as T;
}
