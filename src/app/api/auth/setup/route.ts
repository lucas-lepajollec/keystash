import { NextRequest, NextResponse } from 'next/server';
import { isSetupComplete, setConfig, saveSession } from '@/lib/db';
import { hashPassword, generateSessionToken, hashSessionToken, setSessionCookie, SESSION_TTL_SECONDS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (isSetupComplete()) {
    return NextResponse.json({ error: 'Vault is already initialized.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    setConfig('master_password_hash', passwordHash);

    // Create session and set cookie
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    saveSession(tokenHash, SESSION_TTL_SECONDS);

    const response = NextResponse.json({ success: true });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to initialize vault.' }, { status: 500 });
  }
}
