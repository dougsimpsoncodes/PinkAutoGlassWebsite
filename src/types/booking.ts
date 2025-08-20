import type { BookingInput } from "@/lib/booking-schema";

// Frontend form data (camelCase for React forms)
export interface BookingFormData {
  // Service details
  serviceType: string;
  mobileService?: boolean;
  
  // Vehicle details
  vehicleYear: string | number;
  vehicleMake: string;
  vehicleModel: string;
  
  // Contact details
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  
  // Location details
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Schedule details
  preferredDate: string;
  timeWindow?: string;
  
  // Additional details
  damageDescription?: string;
  smsConsent: boolean;
  privacyAcknowledgment: boolean;
  
  // Photos
  photos: File[];
  
  // Metadata
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Backend API type (snake_case for database)
export type BookingApiData = BookingInput & { photos?: File[] };
