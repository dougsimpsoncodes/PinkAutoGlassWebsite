/**
 * Simple in-memory rate limiter for serverless API routes.
 *
 * Limits: 5 requests per IP per 60-second window (default).
 * Stale entries are lazily cleaned up on each check.
 *
 * Note: In-memory state resets on cold starts. For Vercel serverless,
 * each instance maintains its own map — this provides soft protection,
 * not a hard guarantee. For stricter limits, use Upstash Redis.
 */

const store = new Map<string, { count: number; resetTime: number }>();

// Cleanup stale entries every 100 checks to prevent memory leak
let checkCount = 0;
const CLEANUP_INTERVAL = 100;

function cleanup() {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
  checkCount++;
  if (checkCount % CLEANUP_INTERVAL === 0) {
    cleanup();
  }

  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetTime) {
    store.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetIn: record.resetTime - now };
}
