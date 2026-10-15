import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateArchivePath,
  scanFileContentForSecrets,
  scanProjectFileTree,
} from '../../../backend/security/scanner';

describe('Production Pipeline Security: Scanner Engine', () => {
  describe('Path Traversal & Zip Slip Prevention', () => {
    it('should flag relative path traversal attempts with ../', () => {
      const violations = validateArchivePath('../../etc/passwd');
      assert.ok(violations.length > 0);
      assert.equal(violations[0].type, 'path_traversal');
      assert.equal(violations[0].severity, 'critical');
    });

    it('should flag Windows-style path traversal with ..\\', () => {
      const violations = validateArchivePath('..\\..\\Windows\\System32\\cmd.exe');
      assert.ok(violations.length >= 1);
      const hasTraversal = violations.some((v) => v.type === 'path_traversal');
      assert.ok(hasTraversal, 'Must detect Windows path traversal');
    });

    it('should flag absolute root paths', () => {
      const unixViolations = validateArchivePath('/root/.ssh/id_rsa');
      assert.ok(unixViolations.some((v) => v.type === 'path_traversal'));

      const winViolations = validateArchivePath('C:\\secret\\keys.txt');
      assert.ok(winViolations.some((v) => v.type === 'path_traversal'));
    });

    it('should allow legitimate relative project paths', () => {
      const violations = validateArchivePath('src/components/button.tsx');
      assert.equal(violations.length, 0);
    });
  });

  describe('Dangerous File Extensions', () => {
    const dangerousFiles = [
      'bin/run.exe',
      'scripts/deploy.sh',
      'scripts/run.bat',
      'scripts/setup.cmd',
      'tools/installer.ps1',
      'native/libaddon.dll',
      'native/libaddon.so',
      'native/libaddon.dylib',
    ];

    dangerousFiles.forEach((file) => {
      it(`should flag dangerous file extension: ${file}`, () => {
        const violations = validateArchivePath(file);
        assert.ok(violations.some((v) => v.type === 'forbidden_extension'));
      });
    });

    it('should allow benign code files', () => {
      const safeFiles = [
        'src/index.ts',
        'pages/index.tsx',
        'styles/main.css',
        'package.json',
        'README.md',
        'public/logo.png',
        'assets/banner.webp',
      ];
      safeFiles.forEach((file) => {
        const violations = validateArchivePath(file);
        assert.equal(violations.length, 0, `Expected ${file} to be safe`);
      });
    });
  });

  describe('Secret & Credential Leak Detection', () => {
    it('should detect AWS Access Keys in source files', () => {
      const mockCode = `const awsKey = "AKIA1234567890ABCDEF";`;
      const violations = scanFileContentForSecrets('config.js', mockCode);
      assert.ok(violations.some((v) => v.type === 'secret_leak'));
    });

    it('should detect GitHub Personal Access Tokens', () => {
      const mockCode = `const token = "ghp_111122223333444455556666777788889999";`;
      const violations = scanFileContentForSecrets('auth.ts', mockCode);
      assert.ok(violations.some((v) => v.type === 'secret_leak'));
    });

    it('should detect OpenAI Secret Keys', () => {
      const mockCode = `const key = "sk-111122223333444455556666777788889999";`;
      const violations = scanFileContentForSecrets('ai.ts', mockCode);
      assert.ok(violations.some((v) => v.type === 'secret_leak'));
    });

    it('should detect RSA Private Key blocks', () => {
      const mockKey = `-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----`;
      const violations = scanFileContentForSecrets('server.key', mockKey);
      assert.ok(violations.some((v) => v.type === 'secret_leak'));
    });

    it('should flag forbidden committed .env files', () => {
      const violations = validateArchivePath('.env.production');
      assert.ok(violations.some((v) => v.type === 'secret_leak'));
    });
  });

  describe('scanProjectFileTree End-to-End Evaluation', () => {
    it('should mark clean project tree as safe with score 100', () => {
      const cleanFiles = [
        { path: 'package.json', content: '{"name": "test-kit"}' },
        { path: 'src/index.ts', content: 'export const hello = "world";' },
        { path: 'README.md', content: '# Clean Kit Documentation' },
      ];
      const result = scanProjectFileTree(cleanFiles);
      assert.equal(result.isSafe, true);
      assert.equal(result.score, 100);
      assert.equal(result.violations.length, 0);
      assert.equal(result.scannedFilesCount, 3);
    });

    it('should mark compromised archive with score 0 and isSafe false', () => {
      const maliciousFiles = [
        { path: '../../etc/shadow', content: 'root:x:0:0:root:/root:/bin/bash' },
        { path: 'bin/trojan.exe', content: 'MZ......' },
        { path: 'credentials.ts', content: 'const key = "AKIA1234567890ABCDEF";' },
      ];
      const result = scanProjectFileTree(maliciousFiles);
      assert.equal(result.isSafe, false);
      assert.equal(result.score, 0);
      assert.ok(result.violations.length >= 3);
    });

    it('should detect uncompressed size bombs (> 150MB)', () => {
      const bigArchive = [
        { path: 'huge-data.bin', sizeBytes: 160 * 1024 * 1024 },
      ];
      const result = scanProjectFileTree(bigArchive);
      assert.equal(result.isSafe, false);
      assert.ok(result.violations.some((v) => v.type === 'size_bomb'));
    });
  });
});
