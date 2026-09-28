import { NextRequest, NextResponse } from 'next/server';
import { isSetupComplete, isSessionValid } from '@/lib/db';
import { COOKIE_NAME, hashSessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const configured = isSetupComplete();
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let authenticated = false;

  if (configured && token) {
    const tokenHash = hashSessionToken(token);
    authenticated = isSessionValid(tokenHash);
  }

  return NextResponse.json({
    configured,
    authenticated,
  });
}
