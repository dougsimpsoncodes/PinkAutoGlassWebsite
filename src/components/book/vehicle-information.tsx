import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { BookingFormData } from '@/app/book/page';
import { compressImages } from '@/lib/image-compression';

interface VehicleInformationProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onPrevious: () => void;
}

// Generate years from current year down to 1990
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

// Popular makes (shown first)
const popularMakes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Volkswagen'];
const allMakes = [
  'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
  'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia',
  'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
  'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

// Mock models data - in real app this would come from an API
const mockModels: Record<string, string[]> = {
  'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Passport', 'Ridgeline'],
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna', '4Runner', 'Tacoma'],
  'Ford': ['F-150', 'Escape', 'Explorer', 'Edge', 'Fusion', 'Mustang', 'Expedition', 'Focus'],
  'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Suburban', 'Traverse', 'Cruze', 'Impala'],
  // Add more as needed...
};

export function VehicleInformation({
  formData,
  updateFormData,
  errors,
  onNext,
  onPrevious,
}: VehicleInformationProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMessage, setCompressionMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvailableModels = () => {
    if (!formData.vehicleMake || !mockModels[formData.vehicleMake]) {
      return [];
    }
    return mockModels[formData.vehicleMake];
  };

  const handleYearChange = (year: string) => {
    updateFormData({ 
      vehicleYear: year,
      vehicleMake: '', // Reset make when year changes
      vehicleModel: '', // Reset model when year changes
    });
  };

  const handleMakeChange = (make: string) => {
    updateFormData({ 
      vehicleMake: make,
      vehicleModel: '', // Reset model when make changes
    });
  };

  const handleModelChange = (model: string) => {
    updateFormData({ vehicleModel: model });
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Filter valid image files (more generous size limit for compression)
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB - will be compressed
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      setCompressionMessage('Some files were rejected (non-images or too large)');
      setTimeout(() => setCompressionMessage(''), 3000);
    }

    // Check if we'll exceed the 5 file limit
    const totalFiles = formData.photos.length + validFiles.length;
    const filesToProcess = totalFiles > 5 
      ? validFiles.slice(0, 5 - formData.photos.length)
      : validFiles;

    if (filesToProcess.length === 0) return;

    setIsCompressing(true);
    setCompressionMessage('Processing images...');

    try {
      const { compressedFiles } = await compressImages(filesToProcess);

      // Update form data with compressed files
      updateFormData({ photos: [...formData.photos, ...compressedFiles] });

      // Show simple success message
      setCompressionMessage(`✅ ${compressedFiles.length} image${compressedFiles.length > 1 ? 's' : ''} uploaded successfully`);

    } catch (error) {
      console.error('Compression failed:', error);
      setCompressionMessage('❌ Failed to process some images. Please try again.');
    } finally {
      setIsCompressing(false);
      setTimeout(() => setCompressionMessage(''), 3000);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData({ photos: newPhotos });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const isValidToProgress = formData.vehicleYear && formData.vehicleMake && formData.vehicleModel;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy mb-2">
          Tell us about your vehicle
        </h2>
        <p className="text-gray-600">
          We need your vehicle details to provide an accurate quote
        </p>
      </div>

      {/* Vehicle Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Year */}
        <div className="space-y-2">
          <label htmlFor="year" className="text-sm font-medium text-brand-navy">
            Year <span className="text-red-500">*</span>
          </label>
          <select
            id="year"
            value={formData.vehicleYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
              errors.vehicleYear ? 'border-red-500' : ''
            )}
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.vehicleYear && (
            <p className="text-red-500 text-sm">{errors.vehicleYear}</p>
          )}
        </div>

        {/* Make */}
        <div className="space-y-2">
          <label htmlFor="make" className="text-sm font-medium text-brand-navy">
            Make <span className="text-red-500">*</span>
          </label>
          <select
            id="make"
            value={formData.vehicleMake}
            onChange={(e) => handleMakeChange(e.target.value)}
            disabled={!formData.vehicleYear}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
              errors.vehicleMake ? 'border-red-500' : '',
              !formData.vehicleYear ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            <option value="">Select Make</option>
            <optgroup label="Popular Makes">
              {popularMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </optgroup>
            <optgroup label="All Makes">
              {allMakes.filter(make => !popularMakes.includes(make)).map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </optgroup>
          </select>
          {errors.vehicleMake && (
            <p className="text-red-500 text-sm">{errors.vehicleMake}</p>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium text-brand-navy">
            Model <span className="text-red-500">*</span>
          </label>
          <select
            id="model"
            value={formData.vehicleModel}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!formData.vehicleMake}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
              errors.vehicleModel ? 'border-red-500' : '',
              !formData.vehicleMake ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            <option value="">Select Model</option>
            {getAvailableModels().map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.vehicleModel && (
            <p className="text-red-500 text-sm">{errors.vehicleModel}</p>
          )}
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-brand-navy mb-2">
            Upload Photos (Optional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload photos of the damage to help us provide a more accurate quote. 
            Max 5 photos, any size (we'll compress them automatically).
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200',
            dragActive
              ? 'border-brand-pink bg-gradient-light'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="text-4xl">📷</div>
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop photos here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-brand-pink hover:underline font-medium"
                >
                  browse files
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Any image format, any size - we'll optimize them for you
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
              }
            }}
            className="hidden"
            disabled={isCompressing}
          />
        </div>

        {/* Upload Progress */}
        {isCompressing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Processing images...</p>
                <p className="text-xs text-blue-700">Please wait while we prepare your photos</p>
              </div>
            </div>
          </div>
        )}

        {/* Compression Message */}
        {compressionMessage && !isCompressing && (
          <div className={cn(
            "rounded-lg p-3 text-sm",
            compressionMessage.includes('❌') 
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          )}>
            {compressionMessage}
          </div>
        )}

        {/* Photo Previews */}
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Photo Upload Limit */}
        {formData.photos.length >= 5 && (
          <p className="text-sm text-gray-500">
            Maximum of 5 photos reached. Remove photos to add different ones.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="btn-secondary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!isValidToProgress}
          className={cn(
            'btn-primary',
            {
              'opacity-50 cursor-not-allowed': !isValidToProgress,
            }
          )}
        >
          Continue
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}