'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { compressImages, formatFileSize, getCompressionMessage } from '@/lib/image-compression';

interface PhotoUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  errors?: string[];
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILES = 5;

export function PhotoUploader({ files, onChange, errors }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState<Record<string, string>>({});
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return `Invalid file type: ${file.name}. Allowed types: JPEG, PNG, WebP, HEIC`;
    }
    return null;
  };

  const processFiles = async (newFiles: File[]) => {
    // Filter valid files
    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        errorMessages.push(error);
      } else {
        validFiles.push(file);
      }
    }

    if (errorMessages.length > 0) {
      // Show errors but continue with valid files
      console.warn('File validation errors:', errorMessages);
    }

    // Check total count
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > MAX_FILES) {
      const allowedCount = MAX_FILES - files.length;
      if (allowedCount > 0) {
        validFiles.splice(allowedCount);
        errorMessages.push(`Maximum ${MAX_FILES} files allowed. Only first ${allowedCount} files were added.`);
      } else {
        return; // Already at max
      }
    }

    if (validFiles.length === 0) return;

    // Find files that need compression (> 2MB)
    const filesToCompress = validFiles.filter(f => f.size > 2 * 1024 * 1024);
    const smallFiles = validFiles.filter(f => f.size <= 2 * 1024 * 1024);

    let processedFiles = [...smallFiles];

    // Compress large files
    if (filesToCompress.length > 0) {
      setIsCompressing(true);
      try {
        const { compressedFiles, compressionStats } = await compressImages(
          filesToCompress,
          undefined,
          (index, result) => {
            // Update compression status for each file
            const fileName = filesToCompress[index].name;
            const message = getCompressionMessage(result.originalSize, result.compressedSize);
            setCompressionStatus(prev => ({
              ...prev,
              [result.compressedFile.name]: message
            }));
          }
        );
        processedFiles = [...processedFiles, ...compressedFiles];
      } catch (error) {
        console.error('Compression error:', error);
        // Fall back to original files if compression fails
        processedFiles = [...processedFiles, ...filesToCompress];
      } finally {
        setIsCompressing(false);
      }
    }

    // Update parent state
    onChange([...files, ...processedFiles]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input to allow selecting same file again
    event.target.value = '';
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  }, [files, onChange]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);

    // Clean up compression status
    const fileName = files[index].name;
    setCompressionStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* File input and drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'}
          ${isCompressing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!isCompressing ? triggerFileInput : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        aria-label="Upload photos"
        aria-describedby="upload-instructions"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="sr-only"
          disabled={isCompressing || files.length >= MAX_FILES}
          aria-label="Select photos to upload"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" aria-hidden="true" />

        <p id="upload-instructions" className="text-sm text-gray-600">
          {files.length >= MAX_FILES ? (
            `Maximum ${MAX_FILES} photos reached`
          ) : isCompressing ? (
            'Compressing images...'
          ) : (
            <>
              <span className="font-medium">Click to upload</span> or drag and drop
              <br />
              <span className="text-xs">JPEG, PNG, WebP, or HEIC (max {MAX_FILES} files)</span>
            </>
          )}
        </p>
      </div>

      {/* Error messages */}
      {errors && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-gray-200"
            >
              {/* Preview thumbnail */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={(e) => {
                      // Clean up object URL after image loads
                      URL.revokeObjectURL(e.currentTarget.src);
                    }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* File info */}
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                {compressionStatus[file.name] && (
                  <p className="text-xs text-green-600 mt-1">
                    {compressionStatus[file.name]}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File count indicator */}
      {files.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {files.length} of {MAX_FILES} photos added
        </p>
      )}
    </div>
  );
}