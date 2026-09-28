import Database from 'better-sqlite3';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDataDir } from './crypto';

export interface SecretItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  notes: string;
  encrypted_value: string;
  masked_preview: string;
  created_at: number;
  updated_at: number;
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = getDataDir();
  const dbPath = path.join(dataDir, 'keystash.db');

  dbInstance = new Database(dbPath);

  // Enable WAL mode for high performance concurrent reads and writes
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);

  return dbInstance;
}

export function setDbForTesting(db: Database.Database | null): void {
  dbInstance = db;
}

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS secrets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      tags TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      encrypted_value TEXT NOT NULL,
      masked_preview TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_secrets_category ON secrets(category);
    CREATE INDEX IF NOT EXISTS idx_secrets_name ON secrets(name);
  `);
}

// Config helpers
export function getConfig(key: string): string | null {
  const db = getDb();
  const stmt = db.prepare('SELECT value FROM config WHERE key = ?');
  const row = stmt.get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setConfig(key: string, value: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO config (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  stmt.run(key, value, Date.now());
}

export function isSetupComplete(): boolean {
  return getConfig('master_password_hash') !== null;
}

// Session helpers
export function saveSession(tokenHash: string, ttlSeconds: number): void {
  const db = getDb();
  const now = Date.now();
  const expiresAt = now + ttlSeconds * 1000;

  // Clean expired sessions
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);

  const stmt = db.prepare(`
    INSERT INTO sessions (token_hash, expires_at, created_at)
    VALUES (?, ?, ?)
  `);
  stmt.run(tokenHash, expiresAt, now);
}

export function isSessionValid(tokenHash: string): boolean {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare('SELECT expires_at FROM sessions WHERE token_hash = ? AND expires_at > ?');
  const row = stmt.get(tokenHash, now);
  return Boolean(row);
}

export function deleteSession(tokenHash: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

// Secret helpers
export function getAllSecrets(): SecretItem[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM secrets ORDER BY updated_at DESC');
  const rows = stmt.all() as Array<{
    id: string;
    name: string;
    category: string;
    tags: string;
    notes: string;
    encrypted_value: string;
    masked_preview: string;
    created_at: number;
    updated_at: number;
  }>;

  return rows.map((r) => ({
    ...r,
    tags: JSON.parse(r.tags || '[]'),
  }));
}

export function getSecretById(id: string): SecretItem | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM secrets WHERE id = ?');
  const row = stmt.get(id) as {
    id: string;
    name: string;
    category: string;
    tags: string;
    notes: string;
    encrypted_value: string;
    masked_preview: string;
    created_at: number;
    updated_at: number;
  } | undefined;

  if (!row) return null;

  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
  };
}

export function createSecret(data: {
  name: string;
  category: string;
  tags: string[];
  notes?: string;
  encrypted_value: string;
  masked_preview: string;
}): SecretItem {
  const db = getDb();
  const id = randomUUID();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO secrets (id, name, category, tags, notes, encrypted_value, masked_preview, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.name.trim(),
    data.category.trim() || 'General',
    JSON.stringify(data.tags || []),
    data.notes?.trim() || '',
    data.encrypted_value,
    data.masked_preview,
    now,
    now
  );

  return {
    id,
    name: data.name.trim(),
    category: data.category.trim() || 'General',
    tags: data.tags || [],
    notes: data.notes?.trim() || '',
    encrypted_value: data.encrypted_value,
    masked_preview: data.masked_preview,
    created_at: now,
    updated_at: now,
  };
}

export function updateSecret(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    tags: string[];
    notes: string;
    encrypted_value: string;
    masked_preview: string;
  }>
): SecretItem | null {
  const db = getDb();
  const existing = getSecretById(id);
  if (!existing) return null;

  const now = Date.now();
  const updated: SecretItem = {
    ...existing,
    name: data.name !== undefined ? data.name.trim() : existing.name,
    category: data.category !== undefined ? data.category.trim() : existing.category,
    tags: data.tags !== undefined ? data.tags : existing.tags,
    notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
    encrypted_value: data.encrypted_value !== undefined ? data.encrypted_value : existing.encrypted_value,
    masked_preview: data.masked_preview !== undefined ? data.masked_preview : existing.masked_preview,
    updated_at: now,
  };

  const stmt = db.prepare(`
    UPDATE secrets
    SET name = ?, category = ?, tags = ?, notes = ?, encrypted_value = ?, masked_preview = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.name,
    updated.category,
    JSON.stringify(updated.tags),
    updated.notes,
    updated.encrypted_value,
    updated.masked_preview,
    now,
    id
  );

  return updated;
}

export function deleteSecret(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM secrets WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

export function getCategories(): string[] {
  const db = getDb();
  const stmt = db.prepare('SELECT DISTINCT category FROM secrets ORDER BY category ASC');
  const rows = stmt.all() as Array<{ category: string }>;
  return rows.map((r) => r.category);
}

export function seedDefaultSecrets(encryptFn: (val: string) => string, maskFn: (val: string) => string): void {
  const defaults = [
    {
      name: 'Anthropic',
      category: 'AI',
      tags: ['production', 'claude-3-7'],
      notes: 'API key with Claude 3.7 Sonnet access',
      secret: 'sk-ant-api03-kJ89mQxL2491ZabCDefGhIJkLmnOPQRstuvWXyz0123456789',
    },
    {
      name: 'OpenAI',
      category: 'AI',
      tags: ['gpt-4o', 'embeddings'],
      notes: 'Project API key for agent workflows',
      secret: 'sk-proj-aB91cD82eF73gH64iJ55kL46mN37oP28qR19sT00uV99wX88yZ77',
    },
    {
      name: 'GitHub',
      category: 'Development',
      tags: ['pat', 'workflow'],
      notes: 'Personal access token for CLI & CI pipelines',
      secret: 'ghp_4kL89mNoPqRsTuVwXyZ0123456789AbCdEfGh',
    },
    {
      name: 'Forgejo',
      category: 'Development',
      tags: ['self-hosted', 'git'],
      notes: 'Self-hosted git server access token',
      secret: 'fgo_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    },
    {
      name: 'Cloudflare',
      category: 'Infrastructure',
      tags: ['dns', 'zones'],
      notes: 'Global API token with DNS Edit Zone permissions',
      secret: 'clf_d9e8f7a6b5c4d3e2f1a0987654321fedcba09876',
    },
    {
      name: 'Resend',
      category: 'Development',
      tags: ['email', 'transactional'],
      notes: 'Production email delivery API key',
      secret: 're_12345678_abcdefghijklmnopqrstuvwxyz',
    },
    {
      name: 'Vercel',
      category: 'Infrastructure',
      tags: ['deployments', 'cli'],
      notes: 'Token for automated preview deployments',
      secret: 'vcl_live_token_99x88w77v66u55t44s33r22q11p',
    },
    {
      name: 'TMDB',
      category: 'Media',
      tags: ['metadata', 'read-only'],
      notes: 'The Movie Database API read access v4 token',
      secret: 'tmdb_auth_v4_eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMTkyMGVl',
    },
  ];

  for (const item of defaults) {
    createSecret({
      name: item.name,
      category: item.category,
      tags: item.tags,
      notes: item.notes,
      encrypted_value: encryptFn(item.secret),
      masked_preview: maskFn(item.secret),
    });
  }
}
