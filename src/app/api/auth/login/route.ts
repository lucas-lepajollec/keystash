import { NextRequest, NextResponse } from 'next/server';
import { getConfig, isSetupComplete, saveSession } from '@/lib/db';
import {
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  setSessionCookie,
  SESSION_TTL_SECONDS,
  isLoginRateLimited,
  recordLoginFailure,
  resetLoginAttempts,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!isSetupComplete()) {
    return NextResponse.json({ error: 'Vault is not initialized.' }, { status: 400 });
  }

  if (isLoginRateLimited(request)) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please wait 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const hash = getConfig('master_password_hash');
    if (!hash) {
      return NextResponse.json({ error: 'Vault error.' }, { status: 500 });
    }

    const isValid = await verifyPassword(password, hash);
    if (!isValid) {
      recordLoginFailure(request);
      return NextResponse.json({ error: 'Incorrect master password.' }, { status: 401 });
    }

    // Reset rate limiter on successful authentication
    resetLoginAttempts(request);

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    saveSession(tokenHash, SESSION_TTL_SECONDS);

    const response = NextResponse.json({ success: true });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
