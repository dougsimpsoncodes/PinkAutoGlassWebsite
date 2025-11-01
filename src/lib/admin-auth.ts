import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'change-this-in-production';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Default password: "admin123" (CHANGE THIS IN PRODUCTION)
const DEFAULT_PASSWORD_HASH = '$2a$10$rqzX8qgKqYZHxE5yHx5z5.8FvYqPxJ5kL7WX8QxY5zX8qgKqYZHxE';

/**
 * Check if the current request has a valid admin session
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie) {
    return false;
  }

  // Simple session validation - just check if cookie exists
  // In production, you might want to validate a JWT or session token
  return sessionCookie.value === SESSION_SECRET;
}

/**
 * Verify admin password
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Create admin session cookie
 */
export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Destroy admin session
 */
export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Generate password hash for environment variable
 * Usage: Call this function with your desired password to get the hash
 */
export async function generatePasswordHash(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
