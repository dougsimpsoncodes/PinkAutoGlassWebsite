/**
 * API Authentication Middleware
 * Provides API key authentication for sensitive endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Environment-based API keys (in production, use proper key management)
const API_KEYS = {
  // Public API key for booking submissions (can be in frontend)
  public: process.env.NEXT_PUBLIC_API_KEY || 'pag_public_dev_2025',
  
  // Private API keys for admin operations (server-side only)
  admin: process.env.API_KEY_ADMIN || 'pag_admin_dev_2025_secure',
  internal: process.env.API_KEY_INTERNAL || 'pag_internal_dev_2025'
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

  // Check against known keys
  for (const [type, key] of Object.entries(API_KEYS)) {
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