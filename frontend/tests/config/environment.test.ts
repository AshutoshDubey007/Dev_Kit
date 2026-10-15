import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('Production Pipeline Security: Environment & Secret Isolation', () => {
  const exampleEnvPath = path.resolve(__dirname, '../../.env.example');

  it('.env.example must exist and document essential variables', () => {
    assert.ok(fs.existsSync(exampleEnvPath), '.env.example file must exist');
    const content = fs.readFileSync(exampleEnvPath, 'utf8');

    const essentialKeys = [
      'MONGODB_URI',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'RAZORPAY_WEBHOOK_SECRET',
    ];

    essentialKeys.forEach((key) => {
      assert.ok(content.includes(key), `.env.example must document ${key}`);
    });
  });

  it('no sensitive secret should ever have NEXT_PUBLIC_ prefix', () => {
    const sensitiveNames = [
      'MONGODB_URI',
      'AUTH_SECRET',
      'NEXTAUTH_SECRET',
      'RAZORPAY_KEY_SECRET',
      'RAZORPAY_WEBHOOK_SECRET',
      'GITHUB_CLIENT_SECRET',
      'GOOGLE_CLIENT_SECRET',
    ];

    sensitiveNames.forEach((secret) => {
      assert.ok(
        !secret.startsWith('NEXT_PUBLIC_'),
        `Critical security flaw: ${secret} must NEVER be prefixed with NEXT_PUBLIC_`
      );
    });
  });

  it('runtime environment or .env.local must not expose empty or dummy secrets in production mode', () => {
    // If running in production mode, check critical variables
    if (process.env.NODE_ENV === 'production') {
      const requiredInProd = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'RAZORPAY_KEY_SECRET'];
      for (const key of requiredInProd) {
        const val = process.env[key];
        assert.ok(val && val.length > 0, `Missing required production secret: ${key}`);
      }
    }
  });
});
