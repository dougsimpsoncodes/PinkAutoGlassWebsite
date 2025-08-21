/**
 * Supabase client configuration for Pink Auto Glass booking system
 * Handles both client-side and server-side operations with proper security
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// =============================================================================
// CLIENT-SIDE SUPABASE CLIENT
// =============================================================================

/**
 * Client-side Supabase client with anon key
 * Used for public operations like booking submissions and file uploads
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No user sessions for booking flow
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'pink-auto-glass-web'
    }
  }
});

// =============================================================================
// SERVER-SIDE SUPABASE CLIENT (Service Role)
// =============================================================================

/**
 * Server-side Supabase client with service role key
 * Used for admin operations that bypass RLS
 * ONLY use this on the server side (API routes)
 */
export const supabaseAdmin = (() => {
  if (!supabaseServiceKey) {
    console.warn('Service role key not available - admin operations will be limited');
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'pink-auto-glass-admin'
      }
    }
  });
})();

// =============================================================================
// STORAGE BUCKET CONFIGURATION
// =============================================================================

export const STORAGE_BUCKETS = {
  LEAD_MEDIA: 'lead-media',
  THUMBNAILS: 'thumbnails',
  TEMP_UPLOADS: 'temp-uploads'
} as const;

export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ],
  MAX_FILES_PER_UPLOAD: 5,
  SIGNED_URL_EXPIRY: 24 * 60 * 60, // 24 hours in seconds
  THUMBNAIL_SIZE: { width: 200, height: 200 }
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate secure file path for storage
 * @param leadId - Lead UUID
 * @param originalFilename - Original filename from upload
 * @returns Secure storage path
 */
export function generateSecureFilePath(leadId: string, originalFilename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop()?.toLowerCase() || '';
  const filename = `${timestamp}_${randomSuffix}.${extension}`;
  
  return `uploads/${leadId}/${filename}`;
}

/**
 * Validate file for upload
 * @param file - File to validate
 * @returns Validation result
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check MIME type
  if (!STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'File type not supported. Please use JPG, PNG, or HEIC format.'
    };
  }

  return { valid: true };
}

/**
 * Generate signed upload URL for file
 * @param filePath - Path where file will be stored
 * @param expiresIn - URL expiry time in seconds
 * @returns Signed upload URL
 */
export async function createSignedUploadUrl(
  filePath: string, 
  expiresIn: number = STORAGE_CONFIG.SIGNED_URL_EXPIRY
) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.LEAD_MEDIA)
    .createSignedUploadUrl(filePath, {
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to create signed upload URL: ${error.message}`);
  }

  return data;
}

/**
 * Upload file to Supabase Storage using signed URL
 * @param file - File to upload
 * @param signedUrl - Signed upload URL
 * @param filePath - Storage path
 * @returns Upload result
 */
export async function uploadFileToStorage(
  file: File,
  signedUrl: string,
  filePath: string
): Promise<{ success: boolean; error?: string; path?: string }> {
  try {
    // Upload file using signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        'Cache-Control': 'max-age=3600'
      }
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    return {
      success: true,
      path: filePath
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Get public URL for uploaded file
 * @param filePath - Path to file in storage
 * @returns Public URL
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.LEAD_MEDIA)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Create signed URL for private file access
 * @param filePath - Path to file in storage
 * @param expiresIn - URL expiry time in seconds
 * @returns Signed URL for file access
 */
export async function createSignedDownloadUrl(
  filePath: string,
  expiresIn: number = STORAGE_CONFIG.SIGNED_URL_EXPIRY
) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.LEAD_MEDIA)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed download URL: ${error.message}`);
  }

  return data;
}

/**
 * Delete file from storage (admin only)
 * @param filePath - Path to file in storage
 * @returns Deletion result
 */
export async function deleteFile(filePath: string) {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available');
  }

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.LEAD_MEDIA)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  return { success: true };
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Insert new lead into database
 * @param leadData - Lead data to insert
 * @returns Created lead record
 */
export async function insertLead(leadData: Database['public']['Tables']['leads']['Insert']) {
  // Use admin client for server-side operations to bypass RLS
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from('leads')
    .insert(leadData)
    .select()
    .single();

  if (error) {
    console.error("🟥 Supabase insert error:", error);
    console.error('Lead insertion error:', error);
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return data;
}

/**
 * Insert media file record
 * @param mediaData - Media file data to insert
 * @returns Created media file record
 */
export async function insertMediaFile(mediaData: any) {
  // Use admin client for server-side operations to bypass RLS
  const client = supabaseAdmin || supabase;
  const { data, error } = await (client as any)
    .from('media_files')
    .insert(mediaData)
    .select()
    .single();

  if (error) {
    console.error('Media file insertion error:', error);
    throw new Error(`Failed to create media file record: ${error.message}`);
  }

  return data;
}

/**
 * Associate media file with lead
 * @param associationData - Association data
 * @returns Created association record
 */
export async function associateMediaWithLead(
  associationData: any
) {
  // Use admin client for server-side operations to bypass RLS
  const client = supabaseAdmin || supabase;
  const { data, error } = await (client as any)
    .from('media_associations')
    .insert(associationData)
    .select()
    .single();

  if (error) {
    console.error('Media association error:', error);
    throw new Error(`Failed to associate media with lead: ${error.message}`);
  }

  return data;
}

/**
 * Retrieve lead by reference number
 * @param referenceNumber - Lead reference number
 * @returns Lead data with associated media
 */
export async function getLeadByReference(referenceNumber: string) {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      media_associations (
        id,
        context,
        display_order,
        caption,
        media_files (
          id,
          filename,
          original_filename,
          file_size,
          mime_type,
          public_url,
          thumbnail_url,
          status
        )
      )
    `)
    .eq('reference_number', referenceNumber)
    .single();

  if (error) {
    console.error('Lead retrieval error:', error);
    return null;
  }

  return data;
}

/**
 * Update lead status
 * @param leadId - Lead UUID
 * @param status - New status
 * @param userId - User making the update (optional)
 * @returns Updated lead
 */
export async function updateLeadStatus(
  leadId: string, 
  status: Database['public']['Enums']['lead_status'],
  userId?: string
) {
  const client = userId && supabaseAdmin ? supabaseAdmin : supabase;
  
  const { data, error } = await client
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Lead status update error:', error);
    throw new Error(`Failed to update lead status: ${error.message}`);
  }

  return data;
}

/**
 * Log communication event
 * @param communicationData - Communication data
 * @returns Created communication record
 */
export async function logCommunication(
  communicationData: any
) {
  const { data, error } = await (supabase as any)
    .from('lead_communications')
    .insert(communicationData)
    .select()
    .single();

  if (error) {
    console.error('Communication logging error:', error);
    throw new Error(`Failed to log communication: ${error.message}`);
  }

  return data;
}

// =============================================================================
// RATE LIMITING AND SECURITY
// =============================================================================

/**
 * Simple in-memory rate limiter for API endpoints
 * In production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for IP address
 * @param ipAddress - Client IP address
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Whether request is allowed
 */
export function checkRateLimit(
  ipAddress: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const key = `rate_limit:${ipAddress}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // New window or expired window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, resetTime: current.resetTime };
  }

  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  return { allowed: true };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up rate limit store every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Rate limit exceeded',
    public resetTime?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
// Type suppressions for non-existent tables
declare module '@supabase/supabase-js' {
  interface Database {
    public: {
      Tables: {
        media_files: any;
        media_associations: any;
        lead_communications: any;
      }
    }
  }
}
