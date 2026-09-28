import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
} from '@/lib/auth';

describe('Auth Module', () => {
  it('should hash and verify passwords using Argon2id', async () => {
    const password = 'my-ultra-secure-homelab-password';
    const hash = await hashPassword(password);

    expect(hash).toContain('$argon2id$');

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isWrongValid = await verifyPassword('wrong-password', hash);
    expect(isWrongValid).toBe(false);
  });

  it('should generate random session tokens and compute consistent sha256 hashes', () => {
    const token = generateSessionToken();
    expect(token.length).toBeGreaterThanOrEqual(32);

    const hash1 = hashSessionToken(token);
    const hash2 = hashSessionToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // sha256 hex
  });
});
