/**
 * DevKit Security & Upload Scanner Engine
 * Defends against:
 * 1. Path traversal attacks (Zip Slip, ../ and ..\\ patterns)
 * 2. Dangerous executable binaries and scripts (.exe, .bat, .sh, .cmd, .ps1, .dll, .so)
 * 3. Secret and token leakage (AWS, GitHub PAT, OpenAI keys, Razorpay secrets, Private RSA keys)
 * 4. File bombs and oversized uploads
 */

export interface SecurityScanResult {
  isSafe: boolean;
  score: number; // 0 - 100, where 100 is fully clean
  violations: SecurityViolation[];
  scannedFilesCount: number;
}

export interface SecurityViolation {
  type: 'path_traversal' | 'forbidden_extension' | 'secret_leak' | 'size_bomb' | 'symlink_attack';
  severity: 'critical' | 'high' | 'medium';
  target: string;
  description: string;
}

// 1. Forbidden executable and binary extensions
const FORBIDDEN_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'bash', 'zsh', 'ps1', 'psm1',
  'dll', 'so', 'dylib', 'bin', 'msi', 'scr', 'vbs', 'pif',
  'com', 'jar', 'apk', 'ipa', 'appimage',
]);

// 2. Secret detection patterns
const SECRET_PATTERNS: { name: string; regex: RegExp; severity: SecurityViolation['severity'] }[] = [
  {
    name: 'AWS Access Key ID',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    severity: 'critical',
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /\b(ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82})\b/g,
    severity: 'critical',
  },
  {
    name: 'OpenAI API Key',
    regex: /\b(sk-[a-zA-Z0-9]{32,64}|sk-proj-[a-zA-Z0-9-_]{40,})\b/g,
    severity: 'critical',
  },
  {
    name: 'Razorpay Secret Key',
    regex: /\b([a-zA-Z0-9]{20,24})\b(?=.*(?:rzp_|key_secret|razorpay_secret))/gi,
    severity: 'high',
  },
  {
    name: 'RSA / SSH Private Key Block',
    regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    severity: 'critical',
  },
  {
    name: 'Hardcoded .env Secret File',
    regex: /^(?:\.env|\.env\.local|\.env\.production)$/i,
    severity: 'high',
  },
];

/**
 * Validates a single file path for Zip Slip / path traversal and forbidden extensions
 */
export function validateArchivePath(filePath: string): SecurityViolation[] {
  const violations: SecurityViolation[] = [];

  // 1. Path traversal check (Zip Slip vulnerability)
  if (
    filePath.includes('../') ||
    filePath.includes('..\\') ||
    filePath.startsWith('/') ||
    filePath.startsWith('\\') ||
    /^[a-zA-Z]:/.test(filePath)
  ) {
    violations.push({
      type: 'path_traversal',
      severity: 'critical',
      target: filePath,
      description: 'Archive entry attempts path traversal outside destination root directory (Zip Slip defense).',
    });
  }

  // 2. Forbidden extension check
  const filename = filePath.split(/[/\\]/).pop() || '';
  const parts = filename.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase();
    if (ext && FORBIDDEN_EXTENSIONS.has(ext)) {
      violations.push({
        type: 'forbidden_extension',
        severity: 'critical',
        target: filePath,
        description: `Dangerous executable/binary extension '.${ext}' is prohibited in DevKit marketplace assets.`,
      });
    }
  }

  // 3. Sensitive configuration file check
  if (filename === '.env' || filename === '.env.production' || filename === '.env.local') {
    violations.push({
      type: 'secret_leak',
      severity: 'high',
      target: filePath,
      description: 'Production .env file detected in archive. Secrets should be committed as .env.example only.',
    });
  }

  return violations;
}

/**
 * Scans file contents for accidental secrets or API key leaks
 */
export function scanFileContentForSecrets(filePath: string, content: string): SecurityViolation[] {
  const violations: SecurityViolation[] = [];

  for (const { name, regex, severity } of SECRET_PATTERNS) {
    // Reset regex state
    regex.lastIndex = 0;
    if (regex.test(content)) {
      violations.push({
        type: 'secret_leak',
        severity,
        target: filePath,
        description: `Potential hardcoded credential or secret detected: ${name}.`,
      });
    }
  }

  return violations;
}

/**
 * Performs a comprehensive security evaluation of a project file tree
 */
export function scanProjectFileTree(
  files: { path: string; content?: string; sizeBytes?: number }[]
): SecurityScanResult {
  const allViolations: SecurityViolation[] = [];
  let totalBytes = 0;

  for (const file of files) {
    totalBytes += file.sizeBytes || (file.content ? file.content.length : 0);

    // Path check
    const pathViolations = validateArchivePath(file.path);
    allViolations.push(...pathViolations);

    // Content secret check if content is provided
    if (file.content) {
      const secretViolations = scanFileContentForSecrets(file.path, file.content);
      allViolations.push(...secretViolations);
    }
  }

  // Size bomb check (Max 150 MB for unpacked source tree)
  const MAX_ALLOWED_BYTES = 150 * 1024 * 1024;
  if (totalBytes > MAX_ALLOWED_BYTES) {
    allViolations.push({
      type: 'size_bomb',
      severity: 'critical',
      target: 'archive_bundle',
      description: `Total uncompressed archive size (${(totalBytes / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed 150 MB threshold.`,
    });
  }

  const criticalCount = allViolations.filter((v) => v.severity === 'critical').length;
  const highCount = allViolations.filter((v) => v.severity === 'high').length;

  let score = 100 - criticalCount * 40 - highCount * 15;
  if (score < 0) score = 0;

  return {
    isSafe: criticalCount === 0 && highCount === 0,
    score,
    violations: allViolations,
    scannedFilesCount: files.length,
  };
}
