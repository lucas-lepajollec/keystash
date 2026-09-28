import { NextRequest, NextResponse } from 'next/server';
import { getAllSecrets, createSecret, isSessionValid, seedDefaultSecrets, getConfig, setConfig } from '@/lib/db';
import { COOKIE_NAME, hashSessionToken } from '@/lib/auth';
import { encryptSecret, decryptSecret, generateMaskedPreview } from '@/lib/crypto';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isSessionValid(hashSessionToken(token));
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let rawSecrets = getAllSecrets();
    if (rawSecrets.length === 0 && !getConfig('vault_seeded')) {
      seedDefaultSecrets(encryptSecret, generateMaskedPreview);
      setConfig('vault_seeded', '1');
      rawSecrets = getAllSecrets();
    }
    const secrets = rawSecrets.map((s) => {
      let plainValue = '';
      try {
        plainValue = decryptSecret(s.encrypted_value);
      } catch {
        plainValue = '[decryption failed]';
      }

      return {
        id: s.id,
        name: s.name,
        category: s.category,
        tags: s.tags,
        notes: s.notes,
        masked_preview: s.masked_preview,
        value: plainValue,
        created_at: s.created_at,
        updated_at: s.updated_at,
      };
    });

    return NextResponse.json({ secrets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch secrets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, secret, category, tags, notes } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!secret || typeof secret !== 'string') {
      return NextResponse.json({ error: 'Secret value is required' }, { status: 400 });
    }

    const encrypted_value = encryptSecret(secret);
    const masked_preview = generateMaskedPreview(secret);

    const parsedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const item = createSecret({
      name,
      category: typeof category === 'string' && category.trim() ? category.trim() : 'General',
      tags: parsedTags,
      notes: typeof notes === 'string' ? notes.trim() : '',
      encrypted_value,
      masked_preview,
    });

    return NextResponse.json({
      secret: {
        id: item.id,
        name: item.name,
        category: item.category,
        tags: item.tags,
        notes: item.notes,
        masked_preview: item.masked_preview,
        value: secret,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create secret' },
      { status: 500 }
    );
  }
}
