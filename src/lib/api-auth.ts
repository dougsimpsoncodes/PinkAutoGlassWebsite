/**
 * API Authentication Middleware
 * Provides API key authentication for sensitive endpoints
 *
 * Usage in API routes for defense-in-depth:
 *
 * import { validateAdminApiKey } from '@/lib/api-auth'
 *
 * export async function GET(req: NextRequest) {
 *   const authError = validateAdminApiKey(req);
 *   if (authError) return authError;
 *   // ... rest of handler
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Lazy-loaded API keys cache (initialized at first request, not build time)
let API_KEYS: { public: string; admin: string; internal: string } | null = null;

function getApiKeys() {
  // Return cached keys if already initialized
  if (API_KEYS) return API_KEYS;

  const isDev = process.env.NODE_ENV !== 'production';
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

  const keys = {
    public: process.env.NEXT_PUBLIC_API_KEY,
    admin: process.env.API_KEY_ADMIN,
    internal: process.env.API_KEY_INTERNAL
  };

  // Skip validation during build phase
  if (isBuild) {
    console.log('⏭️  Skipping API key validation during build phase');
    keys.public = keys.public || 'build_placeholder';
    keys.admin = keys.admin || 'build_placeholder';
    keys.internal = keys.internal || 'build_placeholder';
    API_KEYS = keys as { public: string; admin: string; internal: string };
    return API_KEYS;
  }

  // In production runtime, ALL keys must be set
  if (!isDev) {
    const missing = Object.entries(keys)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`FATAL: Missing required API keys in production: ${missing.join(', ')}`);
    }
  } else {
    // In development, warn about missing keys and use fallbacks
    if (!keys.public) {
      console.warn('⚠️  WARNING: NEXT_PUBLIC_API_KEY not set, using dev fallback');
      keys.public = 'pag_public_dev_2025';
    }
    if (!keys.admin) {
      console.warn('⚠️  WARNING: API_KEY_ADMIN not set, using dev fallback');
      keys.admin = 'pag_admin_dev_2025_secure';
    }
    if (!keys.internal) {
      console.warn('⚠️  WARNING: API_KEY_INTERNAL not set, using dev fallback');
      keys.internal = 'pag_internal_dev_2025';
    }
  }

  API_KEYS = keys as { public: string; admin: string; internal: string };
  return API_KEYS;
}

export type ApiKeyType = 'public' | 'admin' | 'internal' | 'none'

/**
 * Validate API key from request headers
 */
export function validateApiKey(request: NextRequest): {
  valid: boolean
  keyType: ApiKeyType
  error?: string
} {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')

  if (!apiKey) {
    return { valid: false, keyType: 'none', error: 'Missing API key' }
  }

  // Get keys (lazy-loaded at runtime)
  const keys = getApiKeys();

  // Check against known keys
  for (const [type, key] of Object.entries(keys)) {
    if (apiKey === key) {
      return { valid: true, keyType: type as ApiKeyType }
    }
  }

  return { valid: false, keyType: 'none', error: 'Invalid API key' }
}

/**
 * Check if endpoint requires authentication
 */
export function requiresAuth(pathname: string): ApiKeyType {
  // Public endpoints (no auth required)
  if (pathname.startsWith('/api/booking/submit')) return 'none'
  if (pathname.startsWith('/api/health')) return 'none'
  
  // Admin endpoints (admin key required)
  if (pathname.startsWith('/api/admin/')) return 'admin'
  if (pathname.startsWith('/api/leads/')) return 'admin'
  if (pathname.startsWith('/api/dashboard/')) return 'admin'
  
  // Internal endpoints (internal key required)  
  if (pathname.startsWith('/api/internal/')) return 'internal'
  if (pathname.startsWith('/api/webhook/')) return 'internal'
  
  // Default to public for other API routes
  if (pathname.startsWith('/api/')) return 'public'
  
  return 'none'
}

/**
 * Middleware to check API authentication
 */
export function withApiAuth(handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requiredAuth = requiresAuth(request.nextUrl.pathname)
    
    // No auth required
    if (requiredAuth === 'none') {
      return handler(request)
    }
    
    // Validate API key
    const authResult = validateApiKey(request)
    
    if (!authResult.valid) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Authentication required',
          code: 'INVALID_API_KEY'
        }, 
        { status: 401 }
      )
    }
    
    // Check if key type has sufficient permissions
    const hasPermission = checkPermission(authResult.keyType, requiredAuth)
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        }, 
        { status: 403 }
      )
    }
    
    // Add auth info to request headers for use in handler
    const requestWithAuth = new NextRequest(request.url, {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
    })
    
    requestWithAuth.headers.set('x-auth-type', authResult.keyType)
    
    return handler(requestWithAuth)
  }
}

/**
 * Check if key type has permission for required auth level
 */
function checkPermission(keyType: ApiKeyType, required: ApiKeyType): boolean {
  const permissions = {
    'none': ['none'],
    'public': ['none', 'public'],
    'admin': ['none', 'public', 'admin'], 
    'internal': ['none', 'public', 'admin', 'internal']
  }
  
  return permissions[keyType]?.includes(required) || false
}

/**
 * Generate a secure API key (for setup/admin use)
 */
export function generateApiKey(prefix: string = 'pag'): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(16).toString('hex')
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Hash API key for storage (if storing in database)
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Create API key middleware for specific auth level
 */
export function createAuthMiddleware(requiredAuth: ApiKeyType) {
  return (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) => {
    return withApiAuth(async (request: NextRequest) => {
      const authResult = validateApiKey(request)
      
      if (requiredAuth !== 'none' && !checkPermission(authResult.keyType, requiredAuth)) {
        return NextResponse.json(
          { 
            ok: false, 
            error: `Requires ${requiredAuth} API key`,
            code: 'INSUFFICIENT_PERMISSIONS'
          }, 
          { status: 403 }
        )
      }
      
      return handler(request)
    })
  }
}

// Export commonly used middleware
export const requirePublicKey = createAuthMiddleware('public')
export const requireAdminKey = createAuthMiddleware('admin')  
export const requireInternalKey = createAuthMiddleware('internal')

// Rate limiting bypass for authenticated requests
export function shouldBypassRateLimit(request: NextRequest): boolean {
  const authResult = validateApiKey(request)

  // Admin and internal keys bypass rate limiting
  return authResult.valid && ['admin', 'internal'].includes(authResult.keyType)
}

/**
 * Simple API key validation for admin routes (defense-in-depth)
 * Returns error response if invalid, null if valid
 *
 * @example
 * export async function GET(req: NextRequest) {
 *   const authError = validateAdminApiKey(req);
 *   if (authError) return authError;
 *   // ... rest of handler
 * }
 */
export function validateAdminApiKey(request: NextRequest): NextResponse | null {
  const authResult = validateApiKey(request)

  if (!authResult.valid) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Missing or invalid API key',
        code: 'INVALID_API_KEY',
        hint: 'Include x-api-key header with admin API key'
      },
      { status: 401 }
    )
  }

  if (!checkPermission(authResult.keyType, 'admin')) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Insufficient permissions - admin key required',
        code: 'INSUFFICIENT_PERMISSIONS',
        keyType: authResult.keyType
      },
      { status: 403 }
    )
  }

  return null // Valid
}

/**
 * Simple API key validation for internal routes
 * Returns error response if invalid, null if valid
 */
export function validateInternalApiKey(request: NextRequest): NextResponse | null {
  const authResult = validateApiKey(request)

  if (!authResult.valid) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Missing or invalid API key',
        code: 'INVALID_API_KEY'
      },
      { status: 401 }
    )
  }

  if (!checkPermission(authResult.keyType, 'internal')) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Insufficient permissions - internal key required',
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    )
  }

  return null // Valid
}