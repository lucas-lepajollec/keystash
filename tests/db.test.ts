import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import {
  initSchema,
  setDbForTesting,
  setConfig,
  getConfig,
  isSetupComplete,
  saveSession,
  isSessionValid,
  deleteSession,
  createSecret,
  getAllSecrets,
  getSecretById,
  updateSecret,
  deleteSecret,
  getCategories,
} from '@/lib/db';

describe('Database Module', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);
    setDbForTesting(db);
  });

  afterEach(() => {
    db.close();
    setDbForTesting(null);
  });

  it('should initialize config and report setup completion', () => {
    expect(isSetupComplete()).toBe(false);
    setConfig('master_password_hash', 'hash123');
    expect(isSetupComplete()).toBe(true);
    expect(getConfig('master_password_hash')).toBe('hash123');
  });

  it('should manage sessions correctly', () => {
    const tokenHash = 'test_token_hash_abc';
    saveSession(tokenHash, 3600); // 1 hour

    expect(isSessionValid(tokenHash)).toBe(true);
    expect(isSessionValid('non_existent')).toBe(false);

    deleteSession(tokenHash);
    expect(isSessionValid(tokenHash)).toBe(false);
  });

  it('should perform CRUD operations on secrets', () => {
    const secret = createSecret({
      name: 'Anthropic Key',
      category: 'AI',
      tags: ['production', 'claude'],
      notes: 'Testing note',
      encrypted_value: 'iv:tag:cipher',
      masked_preview: 'sk-ant-••••••••3456',
    });

    expect(secret.id).toBeDefined();
    expect(secret.name).toBe('Anthropic Key');
    expect(secret.tags).toEqual(['production', 'claude']);

    const all = getAllSecrets();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Anthropic Key');

    const fetched = getSecretById(secret.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Anthropic Key');

    const updated = updateSecret(secret.id, {
      name: 'Anthropic Key Updated',
      notes: 'New note',
    });
    expect(updated?.name).toBe('Anthropic Key Updated');
    expect(updated?.notes).toBe('New note');

    const categories = getCategories();
    expect(categories).toContain('AI');

    const deleted = deleteSecret(secret.id);
    expect(deleted).toBe(true);
    expect(getAllSecrets().length).toBe(0);
  });
});
