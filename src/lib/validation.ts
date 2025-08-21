/**
 * Server-side validation utilities for Pink Auto Glass booking system
 * Implements comprehensive validation rules for all form fields
 */

import { BookingFormData } from '@/types/booking';
import { ValidationError } from './supabase';

// =============================================================================
// VALIDATION RULES AND CONSTANTS
// =============================================================================

const VALIDATION_RULES = {
  // Phone validation - US format
  PHONE_PATTERN: /^\(\d{3}\) \d{3}-\d{4}$/,
  
  // Email validation - RFC 5322 compliant
  EMAIL_PATTERN: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // ZIP code validation - US format
  ZIP_PATTERN: /^\d{5}(-\d{4})?$/,
  
  // VIN validation - 17 alphanumeric characters
  VIN_PATTERN: /^[A-HJ-NPR-Z0-9]{17}$/i,
  
  // Name validation - letters, spaces, hyphens, apostrophes
  NAME_PATTERN: /^[a-zA-Z\s\-']{2,50}$/,
  
  // State validation - 2-letter US state codes
  STATE_PATTERN: /^[A-Z]{2}$/,
  
  // Text limits
  MAX_DAMAGE_DESCRIPTION_LENGTH: 500,
  MAX_NAME_LENGTH: 50,
  MAX_ADDRESS_LENGTH: 200,
  MAX_CITY_LENGTH: 50,
  
  // Vehicle year constraints
  MIN_VEHICLE_YEAR: 1990,
  MAX_VEHICLE_YEAR: new Date().getFullYear() + 2,
  
  // File upload constraints (generous for compression)
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB - will be compressed client-side
  MAX_FILES: 5,
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
} as const;

// Valid US state codes
const VALID_US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC' // District of Columbia
]);

// Valid service types
const VALID_SERVICE_TYPES = new Set([
  'repair',
  'replacement'
]);

// Valid contact preferences
const VALID_CONTACT_PREFERENCES = new Set([
  'morning',
  'afternoon',
  'evening',
  'anytime'
]);

// Valid date options
const VALID_DATE_OPTIONS = new Set([
  'today',
  'tomorrow',
  'day_after',
  'this_week',
  'next_week',
  'custom'
]);

// Valid time windows (simplified)
const VALID_TIME_WINDOWS = new Set([
  'morning',
  'afternoon', 
  'anytime'
]);

// =============================================================================
// VALIDATION ERROR TYPES
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData?: Partial<BookingFormData>;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFile?: File;
}

// =============================================================================
// FIELD VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate first name
 */
export function validateFirstName(firstName: string): string | null {
  if (!firstName || typeof firstName !== 'string') {
    return 'First name is required';
  }
  
  const trimmed = firstName.trim();
  
  if (trimmed.length < 2) {
    return 'First name must be at least 2 characters long';
  }
  
  if (trimmed.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    return `First name must be less than ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`;
  }
  
  if (!VALIDATION_RULES.NAME_PATTERN.test(trimmed)) {
    return 'First name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
}

/**
 * Validate last name
 */
export function validateLastName(lastName: string): string | null {
  if (!lastName || typeof lastName !== 'string') {
    return 'Last name is required';
  }
  
  const trimmed = lastName.trim();
  
  if (trimmed.length < 2) {
    return 'Last name must be at least 2 characters long';
  }
  
  if (trimmed.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    return `Last name must be less than ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`;
  }
  
  if (!VALIDATION_RULES.NAME_PATTERN.test(trimmed)) {
    return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return 'Phone number is required';
  }
  
  const trimmed = phone.trim();
  
  if (!VALIDATION_RULES.PHONE_PATTERN.test(trimmed)) {
    return 'Please enter a valid phone number in the format (555) 123-4567';
  }
  
  return null;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return 'Email address is required';
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!VALIDATION_RULES.EMAIL_PATTERN.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

/**
 * Validate vehicle year
 */
export function validateVehicleYear(year: number | string): string | null {
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  
  if (!yearNum || isNaN(yearNum)) {
    return 'Vehicle year is required';
  }
  
  if (yearNum < VALIDATION_RULES.MIN_VEHICLE_YEAR || yearNum > VALIDATION_RULES.MAX_VEHICLE_YEAR) {
    return `Vehicle year must be between ${VALIDATION_RULES.MIN_VEHICLE_YEAR} and ${VALIDATION_RULES.MAX_VEHICLE_YEAR}`;
  }
  
  return null;
}

/**
 * Validate vehicle make
 */
export function validateVehicleMake(make: string): string | null {
  if (!make || typeof make !== 'string') {
    return 'Vehicle make is required';
  }
  
  const trimmed = make.trim();
  
  if (trimmed.length < 2) {
    return 'Vehicle make must be at least 2 characters long';
  }
  
  if (trimmed.length > 50) {
    return 'Vehicle make must be less than 50 characters';
  }
  
  return null;
}

/**
 * Validate vehicle model
 */
export function validateVehicleModel(model: string): string | null {
  if (!model || typeof model !== 'string') {
    return 'Vehicle model is required';
  }
  
  const trimmed = model.trim();
  
  if (trimmed.length < 1) {
    return 'Vehicle model is required';
  }
  
  if (trimmed.length > 50) {
    return 'Vehicle model must be less than 50 characters';
  }
  
  return null;
}

/**
 * Validate service type
 */
export function validateServiceType(serviceType: string): string | null {
  if (!serviceType || typeof serviceType !== 'string') {
    return 'Service type is required';
  }
  
  if (!VALID_SERVICE_TYPES.has(serviceType)) {
    return 'Please select a valid service type';
  }
  
  return null;
}

/**
 * Validate street address
 */
export function validateStreetAddress(address: string): string | null {
  if (!address || typeof address !== 'string') {
    return 'Street address is required';
  }
  
  const trimmed = address.trim();
  
  if (trimmed.length < 5) {
    return 'Please enter a complete street address';
  }
  
  if (trimmed.length > VALIDATION_RULES.MAX_ADDRESS_LENGTH) {
    return `Street address must be less than ${VALIDATION_RULES.MAX_ADDRESS_LENGTH} characters`;
  }
  
  return null;
}

/**
 * Validate city
 */
export function validateCity(city: string): string | null {
  if (!city || typeof city !== 'string') {
    return 'City is required';
  }
  
  const trimmed = city.trim();
  
  if (trimmed.length < 2) {
    return 'City must be at least 2 characters long';
  }
  
  if (trimmed.length > VALIDATION_RULES.MAX_CITY_LENGTH) {
    return `City must be less than ${VALIDATION_RULES.MAX_CITY_LENGTH} characters`;
  }
  
  return null;
}

/**
 * Validate state
 */
export function validateState(state: string): string | null {
  if (!state || typeof state !== 'string') {
    return 'State is required';
  }
  
  const trimmed = state.trim().toUpperCase();
  
  if (!VALIDATION_RULES.STATE_PATTERN.test(trimmed)) {
    return 'Please enter a valid 2-letter state code';
  }
  
  if (!VALID_US_STATES.has(trimmed)) {
    return 'Please enter a valid US state code';
  }
  
  return null;
}

/**
 * Validate ZIP code
 */
export function validateZipCode(zipCode: string): string | null {
  if (!zipCode || typeof zipCode !== 'string') {
    return 'ZIP code is required';
  }
  
  const trimmed = zipCode.trim();
  
  if (!VALIDATION_RULES.ZIP_PATTERN.test(trimmed)) {
    return 'Please enter a valid ZIP code (12345 or 12345-6789)';
  }
  
  return null;
}

/**
 * Validate preferred date
 */
export function validatePreferredDate(preferredDate: string): string | null {
  if (!preferredDate || typeof preferredDate !== 'string') {
    return 'Preferred date is required';
  }
  
  const trimmed = preferredDate.trim();
  
  // Check if it's one of the predefined options
  if (VALID_DATE_OPTIONS.has(trimmed)) {
    return null;
  }
  
  // If it's a custom date, validate as ISO date string
  try {
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) {
      return 'Please select a valid date';
    }
    
    // Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return 'Please select a future date';
    }
    
    return null;
  } catch {
    return 'Please select a valid date';
  }
}

/**
 * Validate time window
 */
export function validateTimeWindow(timeWindow: string | null | undefined): string | null {
  // Time window is optional
  if (!timeWindow) {
    return null;
  }
  
  if (typeof timeWindow !== 'string') {
    return 'Invalid time window format';
  }
  
  const trimmed = timeWindow.trim();
  
  if (!VALID_TIME_WINDOWS.has(trimmed)) {
    return 'Please select a valid time window';
  }
  
  return null;
}

/**
 * Validate best time to call
 */
export function validateBestTimeToCall(bestTime: string | null | undefined): string | null {
  // Best time to call is optional
  if (!bestTime) {
    return null;
  }
  
  if (typeof bestTime !== 'string') {
    return 'Invalid contact preference format';
  }
  
  const trimmed = bestTime.trim();
  
  if (!VALID_CONTACT_PREFERENCES.has(trimmed)) {
    return 'Please select a valid contact preference';
  }
  
  return null;
}

/**
 * Validate damage description
 */
export function validateDamageDescription(description: string | null | undefined): string | null {
  // Damage description is optional
  if (!description) {
    return null;
  }
  
  if (typeof description !== 'string') {
    return 'Invalid description format';
  }
  
  const trimmed = description.trim();
  
  if (trimmed.length > VALIDATION_RULES.MAX_DAMAGE_DESCRIPTION_LENGTH) {
    return `Description must be less than ${VALIDATION_RULES.MAX_DAMAGE_DESCRIPTION_LENGTH} characters`;
  }
  
  return null;
}

/**
 * Validate boolean consent fields
 */
export function validateConsent(consent: boolean, fieldName: string): string | null {
  if (typeof consent !== 'boolean') {
    return `${fieldName} must be a boolean value`;
  }
  
  if (!consent) {
    return `${fieldName} is required to continue`;
  }
  
  return null;
}


// =============================================================================
// FILE VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate uploaded file
 */
export function validateFile(file: File): FileValidationResult {
  // Check if it's an image file (generous check)
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: `File "${file.name}" is not an image. Please upload image files only.`
    };
  }
  
  // Check file size (generous for compression)
  if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum size is ${VALIDATION_RULES.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Check filename for security
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      isValid: false,
      error: `File "${file.name}" has an invalid filename`
    };
  }
  
  return {
    isValid: true,
    sanitizedFile: file
  };
}

/**
 * Validate array of files
 */
export function validateFiles(files: File[]): { isValid: boolean; errors: string[]; validFiles: File[] } {
  const errors: string[] = [];
  const validFiles: File[] = [];
  
  if (files.length > VALIDATION_RULES.MAX_FILES) {
    errors.push(`Too many files. Maximum ${VALIDATION_RULES.MAX_FILES} files allowed`);
    return { isValid: false, errors, validFiles };
  }
  
  for (const file of files) {
    const validation = validateFile(file);
    if (validation.isValid && validation.sanitizedFile) {
      validFiles.push(validation.sanitizedFile);
    } else if (validation.error) {
      errors.push(validation.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validFiles
  };
}

// =============================================================================
// COMPREHENSIVE FORM VALIDATION
// =============================================================================

/**
 * Validate complete booking form data
 */
export function validateBookingFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Validate required fields
  const firstNameError = validateFirstName(data.firstName);
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateLastName(data.lastName);
  if (lastNameError) errors.lastName = lastNameError;
  
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const serviceTypeError = validateServiceType(data.serviceType);
  if (serviceTypeError) errors.serviceType = serviceTypeError;
  
  const vehicleYearError = validateVehicleYear(data.vehicleYear);
  if (vehicleYearError) errors.vehicleYear = vehicleYearError;
  
  const vehicleMakeError = validateVehicleMake(data.vehicleMake);
  if (vehicleMakeError) errors.vehicleMake = vehicleMakeError;
  
  const vehicleModelError = validateVehicleModel(data.vehicleModel);
  if (vehicleModelError) errors.vehicleModel = vehicleModelError;
  
  const addressError = validateStreetAddress(data.streetAddress);
  if (addressError) errors.streetAddress = addressError;
  
  const cityError = validateCity(data.city);
  if (cityError) errors.city = cityError;
  
  const stateError = validateState(data.state);
  if (stateError) errors.state = stateError;
  
  const zipCodeError = validateZipCode(data.zipCode);
  if (zipCodeError) errors.zipCode = zipCodeError;
  
  const preferredDateError = validatePreferredDate(data.preferredDate);
  if (preferredDateError) errors.preferredDate = preferredDateError;
  
  const smsConsentError = validateConsent(data.smsConsent, 'SMS consent');
  if (smsConsentError) errors.smsConsent = smsConsentError;
  
  const privacyAcknowledgmentError = validateConsent(data.privacyAcknowledgment, 'Privacy acknowledgment');
  if (privacyAcknowledgmentError) errors.privacyAcknowledgment = privacyAcknowledgmentError;
  
  // Validate optional fields
  const timeWindowError = validateTimeWindow(data.timeWindow);
  if (timeWindowError) errors.timeWindow = timeWindowError;
  
  // bestTimeToCall validation removed - field removed
  
  const damageDescriptionError = validateDamageDescription(data.damageDescription);
  if (damageDescriptionError) errors.damageDescription = damageDescriptionError;
  
  
  // Sanitize data
  const sanitizedData: Partial<BookingFormData> = {
    serviceType: data.serviceType,
    firstName: data.firstName?.trim(),
    lastName: data.lastName?.trim(),
    phone: data.phone?.trim(),
    email: data.email?.trim().toLowerCase(),
    // bestTimeToCall removed - field removed
    vehicleYear: parseInt(data.vehicleYear, 10),
    vehicleMake: data.vehicleMake?.trim(),
    vehicleModel: data.vehicleModel?.trim(),
    // vehicleTrim removed - not needed for auto glass work
    streetAddress: data.streetAddress?.trim(),
    city: data.city?.trim(),
    state: data.state?.trim().toUpperCase(),
    zipCode: data.zipCode?.trim(),
    preferredDate: data.preferredDate?.trim(),
    timeWindow: data.timeWindow?.trim() || undefined,
    damageDescription: data.damageDescription?.trim() || undefined,
    smsConsent: Boolean(data.smsConsent),
    privacyAcknowledgment: Boolean(data.privacyAcknowledgment),
    // UTM fields removed - using simplified tracking
    referralCode: data.referralCode?.trim() || undefined
  };
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
}

// =============================================================================
// SANITIZATION UTILITIES
// =============================================================================

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Normalize phone number to standard format
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Generate validation summary for logging
 */
export function generateValidationSummary(result: ValidationResult): string {
  if (result.isValid) {
    return 'Validation passed';
  }
  
  const errorCount = Object.keys(result.errors).length;
  const errorFields = Object.keys(result.errors).join(', ');
  
  return `Validation failed: ${errorCount} error(s) in fields: ${errorFields}`;
}