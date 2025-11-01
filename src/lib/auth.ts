/**
 * Admin Authentication Utilities
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a session token
 */
export function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * Check if user is authenticated (simple cookie-based check)
 */
export function isAuthenticated(request: Request): boolean {
  const cookie = request.headers.get('cookie');
  if (!cookie) return false;

  const sessionToken = cookie
    .split(';')
    .find((c) => c.trim().startsWith('admin_session='))
    ?.split('=')[1];

  return !!sessionToken;
}

/**
 * Get admin session from cookies
 */
export function getAdminSession(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  const sessionToken = cookie
    .split(';')
    .find((c) => c.trim().startsWith('admin_session='))
    ?.split('=')[1];

  return sessionToken || null;
}
