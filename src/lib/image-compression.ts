/**
 * Client-side image compression utility for Pink Auto Glass
 * Compresses uploaded images to reduce file size while maintaining quality
 */

import imageCompression from 'browser-image-compression';

// Compression settings
const COMPRESSION_OPTIONS = {
  maxSizeMB: 2, // Maximum file size in MB after compression
  maxWidthOrHeight: 1920, // Maximum width or height in pixels
  useWebWorker: true, // Use web worker for better performance
  fileType: 'image/jpeg', // Convert all to JPEG for consistency
  initialQuality: 0.8, // Starting quality (80%)
  alwaysKeepResolution: false, // Allow resolution reduction if needed
};

// File size limits
const MAX_ORIGINAL_SIZE_MB = 50; // 50MB - very generous for original files
const TARGET_COMPRESSED_SIZE_MB = 2; // Target after compression

/**
 * Compress a single image file
 */
export async function compressImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ 
  compressedFile: File; 
  originalSize: number; 
  compressedSize: number; 
  compressionRatio: number;
}> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Check if file is too large even for compression
  const originalSizeMB = file.size / (1024 * 1024);
  if (originalSizeMB > MAX_ORIGINAL_SIZE_MB) {
    throw new Error(`Image is too large (${originalSizeMB.toFixed(1)}MB). Please use an image smaller than ${MAX_ORIGINAL_SIZE_MB}MB.`);
  }

  // If file is already small enough, return as-is
  if (originalSizeMB <= TARGET_COMPRESSED_SIZE_MB) {
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1.0
    };
  }

  try {
    // Compress the image
    const compressedFile = await imageCompression(file, {
      ...COMPRESSION_OPTIONS,
      onProgress: onProgress ? (progress: number) => onProgress(progress) : undefined,
    });

    const compressionRatio = compressedFile.size / file.size;

    // Ensure the compressed file has a reasonable name
    const originalName = file.name;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const compressedFileName = `${nameWithoutExt}_compressed.jpg`;

    // Create new file with proper name
    const finalFile = new File([compressedFile], compressedFileName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    return {
      compressedFile: finalFile,
      originalSize: file.size,
      compressedSize: finalFile.size,
      compressionRatio
    };

  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Compress multiple image files
 */
export async function compressImages(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void,
  onComplete?: (fileIndex: number, result: any) => void
): Promise<{
  compressedFiles: File[];
  compressionStats: {
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
    averageCompressionRatio: number;
  };
}> {
  const compressedFiles: File[] = [];
  const results: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await compressImage(file, (progress) => {
        onProgress?.(i, progress);
      });
      
      compressedFiles.push(result.compressedFile);
      results.push(result);
      
      onComplete?.(i, result);
    } catch (error) {
      console.error(`Failed to compress file ${file.name}:`, error);
      // Skip failed files but continue with others
      continue;
    }
  }

  // Calculate compression statistics
  const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalSavings = totalOriginalSize - totalCompressedSize;
  const averageCompressionRatio = totalCompressedSize / totalOriginalSize;

  return {
    compressedFiles,
    compressionStats: {
      totalOriginalSize,
      totalCompressedSize,
      totalSavings,
      averageCompressionRatio
    }
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get compression savings message
 */
export function getCompressionMessage(
  originalSize: number, 
  compressedSize: number
): string {
  const savings = originalSize - compressedSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(0);
  
  if (savings > 0) {
    return `Compressed by ${savingsPercent}% (saved ${formatFileSize(savings)})`;
  } else {
    return 'Image was already optimized';
  }
}

/**
 * Check if file needs compression
 */
export function needsCompression(file: File): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > TARGET_COMPRESSED_SIZE_MB;
}