import { describe, it, expect, beforeEach } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  encryptSecret,
  decryptSecret,
  generateMaskedPreview,
  setMasterKeyForTesting,
} from '@/lib/crypto';

describe('Crypto Module', () => {
  const testKey = randomBytes(32);

  beforeEach(() => {
    setMasterKeyForTesting(testKey);
  });

  it('should encrypt and decrypt a secret string correctly with AES-256-GCM', () => {
    const original = 'sk-ant-api03-test-1234567890abcdefghijklmnopqrstuvwxyz';
    const encrypted = encryptSecret(original, testKey);

    expect(encrypted).toContain(':');
    const parts = encrypted.split(':');
    expect(parts.length).toBe(3); // iv:tag:ciphertext

    const decrypted = decryptSecret(encrypted, testKey);
    expect(decrypted).toBe(original);
  });

  it('should fail decryption if ciphertext or tag is tampered with', () => {
    const original = 'super-secret-token';
    const encrypted = encryptSecret(original, testKey);
    const [iv, tag, cipher] = encrypted.split(':');

    // Tamper with tag (preserve 32 hex chars length)
    const tamperedTag = tag.slice(0, -2) + (tag.slice(-2) === '00' ? 'ff' : '00');
    expect(() => decryptSecret(`${iv}:${tamperedTag}:${cipher}`, testKey)).toThrow();

    // Tamper with ciphertext
    const tamperedCipher = cipher.slice(0, -2) + (cipher.slice(-2) === '00' ? 'ff' : '00');
    expect(() => decryptSecret(`${iv}:${tag}:${tamperedCipher}`, testKey)).toThrow();
  });

  it('should fail decryption with an incorrect key', () => {
    const original = 'api-key-value';
    const encrypted = encryptSecret(original, testKey);
    const wrongKey = randomBytes(32);

    expect(() => decryptSecret(encrypted, wrongKey)).toThrow();
  });

  it('should generate recognizable masked previews', () => {
    expect(generateMaskedPreview('sk-ant-1234567890abcdef')).toBe('sk-ant-••••••••cdef');
    expect(generateMaskedPreview('ghp_1234567890abcdefghij')).toBe('ghp_••••••••ghij');
    expect(generateMaskedPreview('short')).toBe('••••••••');
    expect(generateMaskedPreview('my-custom-api-token-12345')).toBe('my-••••••••2345');
  });
});
