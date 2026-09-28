import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

let cachedMasterKey: Buffer | null = null;

export function getDataDir(): string {
  const dir = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.KEYSTASH_DATA_DIR || 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getMasterKey(): Buffer {
  if (cachedMasterKey) {
    return cachedMasterKey;
  }

  // 1. Check environment variable override
  const envKey = process.env.KEYSTASH_MASTER_KEY || process.env.APP_ENCRYPTION_KEY;
  if (envKey) {
    if (envKey.length === 64) {
      cachedMasterKey = Buffer.from(envKey, 'hex');
      return cachedMasterKey;
    }
    if (envKey.length === 32) {
      cachedMasterKey = Buffer.from(envKey, 'utf8');
      return cachedMasterKey;
    }
  }

  // 2. Read or generate from persistent data volume
  const dataDir = getDataDir();
  const keyPath = path.join(dataDir, 'master.key');

  if (fs.existsSync(keyPath)) {
    const hex = fs.readFileSync(keyPath, 'utf8').trim();
    cachedMasterKey = Buffer.from(hex, 'hex');
    return cachedMasterKey;
  }

  // Generate a cryptographically secure 256-bit random key
  const newKey = randomBytes(KEY_LENGTH);
  fs.writeFileSync(keyPath, newKey.toString('hex') + '\n', { mode: 0o600 });
  try {
    fs.chmodSync(keyPath, 0o600);
  } catch {
    // Ignore on filesystems that do not support POSIX chmod
  }

  cachedMasterKey = newKey;
  return cachedMasterKey;
}

export function setMasterKeyForTesting(key: Buffer | null): void {
  cachedMasterKey = key;
}

/**
 * Encrypts a string using AES-256-GCM.
 * Output format: `ivHex:tagHex:ciphertextHex`
 */
export function encryptSecret(plainText: string, masterKey = getMasterKey()): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, masterKey, iv);

  let ciphertext = cipher.update(plainText, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 */
export function decryptSecret(payload: string, masterKey = getMasterKey()): string {
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format.');
  }

  const [ivHex, tagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
    throw new Error('Invalid IV or auth tag length.');
  }

  const decipher = createDecipheriv(ALGORITHM, masterKey, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generates a clean, masked representation of a secret.
 */
export function generateMaskedPreview(secret: string): string {
  if (!secret) return '••••••••';
  const len = secret.length;

  if (len <= 8) {
    return '••••••••';
  }

  // Common token prefixes
  const commonPrefixes = [
    'sk-ant-',
    'sk-proj-',
    'sk-',
    'ghp_',
    'gho_',
    'glpat-',
    'xoxb-',
    'xoxp-',
    'npm_',
    'hf_',
    'dop_v1_',
    'v1.0-',
    'fj_',
  ];

  for (const prefix of commonPrefixes) {
    if (secret.startsWith(prefix) && len > prefix.length + 6) {
      const suffix = secret.slice(-4);
      return `${prefix}••••••••${suffix}`;
    }
  }

  // Generic formatting: keep first 3 chars, mask middle, keep last 4 chars
  const prefix = secret.slice(0, 3);
  const suffix = secret.slice(-4);
  return `${prefix}••••••••${suffix}`;
}
