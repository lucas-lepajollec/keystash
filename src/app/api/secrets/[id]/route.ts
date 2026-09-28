import { NextRequest, NextResponse } from 'next/server';
import { getSecretById, updateSecret, deleteSecret, isSessionValid } from '@/lib/db';
import { COOKIE_NAME, hashSessionToken } from '@/lib/auth';
import { encryptSecret, decryptSecret, generateMaskedPreview } from '@/lib/crypto';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isSessionValid(hashSessionToken(token));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = getSecretById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, secret, category, tags, notes } = body;

    const updates: Parameters<typeof updateSecret>[1] = {};

    if (name !== undefined) updates.name = String(name);
    if (category !== undefined) updates.category = String(category);
    if (notes !== undefined) updates.notes = String(notes);

    if (tags !== undefined) {
      updates.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }

    let resolvedValue = '';
    if (secret !== undefined && secret !== '') {
      updates.encrypted_value = encryptSecret(secret);
      updates.masked_preview = generateMaskedPreview(secret);
      resolvedValue = secret;
    } else {
      try {
        resolvedValue = decryptSecret(existing.encrypted_value);
      } catch {
        resolvedValue = '[decryption failed]';
      }
    }

    const updated = updateSecret(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update secret' }, { status: 500 });
    }

    return NextResponse.json({
      secret: {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        tags: updated.tags,
        notes: updated.notes,
        masked_preview: updated.masked_preview,
        value: resolvedValue,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteSecret(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
