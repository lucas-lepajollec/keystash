import { createHash, randomBytes } from 'node:crypto';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const COOKIE_NAME = 'keystash_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 5;

interface RateLimitBucket {
  attempts: number;
  resetAt: number;
}

const loginBuckets = new Map<string, RateLimitBucket>();

export async function hashPassword(password: string): Promise<string> {
  return argon2Hash(password, {
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(candidate: string, hash: string): Promise<boolean> {
  try {
    return await argon2Verify(hash, candidate);
  } catch {
    return false;
  }
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export function isLoginRateLimited(request: NextRequest): boolean {
  const ip = getClientIp(request);
  const now = Date.now();
  const bucket = loginBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    loginBuckets.set(ip, { attempts: 0, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }

  return bucket.attempts >= LOGIN_MAX_ATTEMPTS;
}

export function recordLoginFailure(request: NextRequest): void {
  const ip = getClientIp(request);
  const now = Date.now();
  const bucket = loginBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    loginBuckets.set(ip, { attempts: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }

  bucket.attempts += 1;
}

export function resetLoginAttempts(request: NextRequest): void {
  const ip = getClientIp(request);
  loginBuckets.delete(ip);
}

export function setSessionCookie(response: NextResponse, token: string): void {
  const isHttps = process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true';

  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax', // Supports LAN IP and cross-navigation
    secure: isHttps,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0,
  });
}
