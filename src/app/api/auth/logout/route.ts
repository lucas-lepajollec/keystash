import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db';
import { COOKIE_NAME, hashSessionToken, clearSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashSessionToken(token);
    deleteSession(tokenHash);
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
