/**
 * Invisible Form Security (No User Friction)
 * - Form integrity tokens with single-use guard
 * - Duplicate/abuse detection (Supabase-based, ~10-20ms)
 * - Progressive challenge triggers (CAPTCHA only when needed)
 */

import { createHash, createHmac, randomBytes } from 'crypto';

// Secrets for HMAC signing (rotate periodically via kid)
const FORM_SECRET = process.env.FORM_INTEGRITY_SECRET || 'change-me-in-production';
const FINGERPRINT_SALT = process.env.FINGERPRINT_SALT || 'change-me-too';
const SALT_VERSION = process.env.SALT_VERSION || 'v1'; // For rotation without breaking old fingerprints
const TOKEN_TTL = 30 * 60 * 1000; // 30 minutes

// Feature flags
const MONITOR_ONLY_MODE = process.env.SECURITY_MONITOR_ONLY === 'true';

/**
 * Generate form integrity token (server-side)
 * Bound to route, UA, payload hash, and includes single-use jti
 */
export function generateFormToken(params: {
  route: string;
  userAgent?: string;
  payloadFields?: Record<string, any>; // Key form fields to bind
}): { token: string; jti: string; issuedAt: number } {
  const issuedAt = Date.now();
  const jti = randomBytes(16).toString('hex'); // Single-use ID
  const userAgent = params.userAgent || 'unknown';

  // Generate payload hash from key fields (prevents mutation attacks)
  let payloadHash = 'none';
  if (params.payloadFields) {
    // Sort keys for consistent hashing
    const sortedKeys = Object.keys(params.payloadFields).sort();
    const payloadString = sortedKeys.map(k => `${k}=${params.payloadFields![k]}`).join('&');
    payloadHash = createHash('sha256')
      .update(payloadString)
      .digest('hex')
      .substring(0, 16); // First 16 chars
  }

  // Claims bound to context
  const claims = {
    iat: issuedAt,
    route: params.route,
    ua: userAgent.substring(0, 100), // Truncate UA
    ph: payloadHash, // Payload hash
    jti
  };

  const payload = `${claims.iat}:${claims.route}:${claims.ua}:${claims.ph}:${claims.jti}`;
  const signature = createHmac('sha256', FORM_SECRET)
    .update(payload)
    .digest('hex');

  return {
    token: `${payload}:${signature}`,
    jti,
    issuedAt
  };
}

/**
 * Verify form integrity token (API-side)
 * Checks signature, expiration, route binding, payload hash, and single-use
 */
export async function verifyFormToken(
  token: string,
  expectedRoute: string,
  userAgent: string,
  supabase: any, // For jti check via RPC
  payloadFields?: Record<string, any> // Key fields to verify
): Promise<{ valid: boolean; reason?: string }> {
  if (!token) {
    return { valid: false, reason: 'missing_token' };
  }

  try {
    const parts = token.split(':');
    if (parts.length !== 6) {
      return { valid: false, reason: 'invalid_format' };
    }

    const [iat, route, ua, ph, jti, signature] = parts;
    const payload = `${iat}:${route}:${ua}:${ph}:${jti}`;

    // Verify signature
    const expectedSignature = createHmac('sha256', FORM_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('⚠️ Form token signature mismatch');
      return { valid: false, reason: 'invalid_signature' };
    }

    // Check expiration
    const tokenAge = Date.now() - parseInt(iat);
    if (tokenAge > TOKEN_TTL) {
      console.warn('⚠️ Form token expired', { age: tokenAge });
      return { valid: false, reason: 'expired' };
    }

    // Check route binding
    if (route !== expectedRoute) {
      console.warn('⚠️ Form token route mismatch', { expected: expectedRoute, got: route });
      return { valid: false, reason: 'route_mismatch' };
    }

    // Check UA binding (fuzzy match - allow minor variations)
    const uaTruncated = userAgent.substring(0, 100);
    if (ua !== uaTruncated) {
      console.warn('⚠️ Form token UA mismatch');
      // Don't fail on UA mismatch (mobile browsers can vary)
      // Just log for monitoring
    }

    // Check payload hash if fields provided (prevents mutation attacks)
    if (payloadFields && ph !== 'none') {
      const sortedKeys = Object.keys(payloadFields).sort();
      const payloadString = sortedKeys.map(k => `${k}=${payloadFields[k]}`).join('&');
      const expectedHash = createHash('sha256')
        .update(payloadString)
        .digest('hex')
        .substring(0, 16);

      if (ph !== expectedHash) {
        console.warn('⚠️ Form token payload hash mismatch - mutation detected');
        return { valid: false, reason: 'payload_mismatch' };
      }
    }

    // Check single-use via SECURITY DEFINER RPC (atomic, no service key exposure)
    const { data: result, error } = await supabase.rpc('check_and_mark_jti', {
      p_jti: jti,
      p_route: expectedRoute,
      p_expires_at: new Date(Date.now() + TOKEN_TTL).toISOString()
    });

    if (error) {
      console.error('⚠️ JTI check error:', error);
      return { valid: false, reason: 'jti_check_error' };
    }

    if (!result.valid) {
      console.warn('⚠️ Form token replay detected', { jti, reason: result.reason });
      return { valid: false, reason: result.reason };
    }

    return { valid: true };
  } catch (error) {
    console.error('Form token verification error:', error);
    return { valid: false, reason: 'verification_error' };
  }
}

/**
 * Generate fingerprint for duplicate detection
 * Hash of salt version + IP + UA + email/phone
 * Salt version allows rotation without breaking old fingerprints
 */
export function generateSubmissionFingerprint(
  ip: string,
  userAgent: string,
  identifier: string, // email or phone
  saltVersion?: string // Optional: for rotation support
): string {
  const version = saltVersion || SALT_VERSION;
  return createHash('sha256')
    .update(`${version}:${FINGERPRINT_SALT}:${ip}:${userAgent}:${identifier}`)
    .digest('hex')
    .substring(0, 32); // First 32 chars
}

/**
 * Check if submission should trigger progressive challenge
 * Based on heuristics (no external calls)
 */
export function shouldTriggerChallenge(payload: any): {
  trigger: boolean;
  reason?: string;
} {
  // Check message entropy (very low = likely bot template)
  if (payload.damageDescription || payload.notes) {
    const text = payload.damageDescription || payload.notes;
    const entropy = calculateEntropy(text);

    if (entropy < 2.5 && text.length > 20) {
      return { trigger: true, reason: 'low_entropy' };
    }
  }

  // Check for multiple URLs in message (spam indicator)
  const urlPattern = /https?:\/\/[^\s]+/g;
  const message = (payload.damageDescription || payload.notes || '');
  const urlMatches = message.match(urlPattern) || [];

  if (urlMatches.length > 2) {
    return { trigger: true, reason: 'multiple_urls' };
  }

  // Check for disposable email domains (common in spam)
  if (payload.email) {
    const disposableDomains = [
      'tempmail.com', 'guerrillamail.com', 'mailinator.com',
      '10minutemail.com', 'throwaway.email'
    ];
    const domain = payload.email.split('@')[1]?.toLowerCase();

    if (disposableDomains.includes(domain)) {
      return { trigger: true, reason: 'disposable_email' };
    }
  }

  return { trigger: false };
}

/**
 * Calculate Shannon entropy of text
 * Low entropy = repetitive/templated text
 */
function calculateEntropy(text: string): number {
  const len = text.length;
  const frequencies: Record<string, number> = {};

  for (const char of text.toLowerCase()) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Supabase duplicate detection query helpers
 */
export interface SubmissionCounter {
  fingerprint: string;
  count: number;
  first_seen: string;
  last_seen: string;
}

/**
 * Check submission thresholds
 * Returns action: 'allow' | 'defer' | 'challenge'
 */
export function evaluateSubmissionRate(counter: SubmissionCounter | null): {
  action: 'allow' | 'defer' | 'challenge';
  reason?: string;
} {
  if (!counter) {
    return { action: 'allow' };
  }

  const windowMs = Date.now() - new Date(counter.first_seen).getTime();
  const windowMinutes = windowMs / 60000;

  // >5 submissions in 15 minutes from same fingerprint
  if (counter.count >= 5 && windowMinutes <= 15) {
    return { action: 'challenge', reason: 'high_frequency' };
  }

  // >10 submissions in 60 minutes
  if (counter.count >= 10 && windowMinutes <= 60) {
    return { action: 'defer', reason: 'burst_detected' };
  }

  return { action: 'allow' };
}
