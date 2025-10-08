'use client';

import type { BookingFormData } from "@/types/booking";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { StepTracker } from '@/components/book/step-tracker';
import { ServiceVehicle } from '@/components/book/service-vehicle';
import { ContactLocation } from '@/components/book/contact-location';
import { ReviewSubmit } from '@/components/book/review-submit';
import { SuccessConfirmation } from '@/components/book/success-confirmation';

// Types for form data
const TOTAL_STEPS = 3;

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: '',
    mobileService: false,
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: 'CO', // Default to Colorado
    zipCode: '',
    preferredDate: '',
    smsConsent: false,
    privacyAcknowledgment: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle URL parameters for prefilling and tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillData: Partial<BookingFormData> = {};

    // UTM tracking
    if (params.get('utm_source')) prefillData.utmSource = params.get('utm_source')!;
    if (params.get('utm_medium')) prefillData.utmMedium = params.get('utm_medium')!;
    if (params.get('utm_campaign')) prefillData.utmCampaign = params.get('utm_campaign')!;
    if (params.get('ref')) prefillData.referralCode = params.get('ref')!;

    // Vehicle prefill
    if (params.get('year')) prefillData.vehicleYear = params.get('year')!;
    if (params.get('make')) prefillData.vehicleMake = params.get('make')!;
    if (params.get('model')) prefillData.vehicleModel = params.get('model')!;
    // vehicleTrim removed - not needed for auto glass work

    // Service prefill
    const serviceMap: Record<string, string> = {
      'windshield-replacement': 'windshield_replacement',
      'windshield-repair': 'windshield_repair',
      'mobile-service': 'mobile_service',
      'rock-chip': 'windshield_repair',
      'adas-calibration': 'windshield_replacement'
    };
    if (params.get('service') && serviceMap[params.get('service')!]) {
      prefillData.serviceType = serviceMap[params.get('service')!];
    }

    // Location prefill
    if (params.get('location')) {
      const location = params.get('location')!;
      if (location.match(/^\d{5}$/)) {
        prefillData.zipCode = location;
      } else {
        const [city, state] = location.split('-');
        if (city && state) {
          prefillData.city = city.charAt(0).toUpperCase() + city.slice(1);
          prefillData.state = state.toUpperCase();
        }
      }
    }

    // Marketing attribution (simplified)
    const source = params.get('source') || 'direct';
    const referralCode = params.get('code') || params.get('ref') || '';
    if (referralCode) prefillData.referralCode = referralCode;

    // Restore from session storage
    const savedData = sessionStorage.getItem('booking_form_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) { // 30 minutes
          setFormData(prev => ({ ...prev, ...parsed.data, ...prefillData }));
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        }
      } catch (error) {
        console.warn('Failed to restore form data:', error);
      }
    } else if (Object.keys(prefillData).length > 0) {
      setFormData(prev => ({ ...prev, ...prefillData }));
    }

    // Track entry point (simplified)
    if (typeof (globalThis as any).gtag !== 'undefined') {
      (globalThis as any).gtag('event', 'booking_start', {
        'source': source,
        'referral_code': referralCode,
        'prefilled_vehicle': !!(params.get('year') && params.get('make')),
        'prefilled_service': !!params.get('service'),
        'prefilled_location': !!params.get('location')
      });
    }
  }, []);

  // Save form data to session storage
  useEffect(() => {
    const dataToSave = {
      data: formData,
      currentStep,
      timestamp: Date.now()
    };
    sessionStorage.setItem('booking_form_data', JSON.stringify(dataToSave));
  }, [formData, currentStep]);

  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.serviceType) {
          newErrors.serviceType = 'Please select a service to continue';
        }
        if (!formData.vehicleYear) {
          newErrors.vehicleYear = 'Please select your vehicle year';
        }
        if (!formData.vehicleMake) {
          newErrors.vehicleMake = 'Please select your vehicle make';
        }
        if (!formData.vehicleModel) {
          newErrors.vehicleModel = 'Please select your vehicle model';
        }
        break;

      case 2:
        if (!formData.firstName || formData.firstName.length < 2) {
          newErrors.firstName = 'Please enter your first name';
        }
        if (!formData.lastName || formData.lastName.length < 2) {
          newErrors.lastName = 'Please enter your last name';
        }
        if (!formData.phone) {
          newErrors.phone = 'Please enter a phone number';
        } else {
          const phoneDigits = formData.phone.replace(/\D/g, '');
          if (phoneDigits.length !== 10) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
          }
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        // streetAddress is optional
        if (!formData.city) {
          newErrors.city = 'Please enter a city';
        }
        if (!formData.state) {
          newErrors.state = 'Please select a state';
        }
        if (!formData.zipCode || !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
          newErrors.zipCode = 'Please enter a valid ZIP code';
        }
        // preferredDate is optional
        break;

      case 3:
        if (!formData.smsConsent) {
          newErrors.smsConsent = 'SMS consent required to continue';
        }
        if (!formData.privacyAcknowledgment) {
          newErrors.privacyAcknowledgment = 'Privacy acknowledgment required to continue';
        }
        if (formData.damageDescription && formData.damageDescription.length > 500) {
          newErrors.damageDescription = 'Description too long (max 500 characters)';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      // Normalize phone to E.164 format
      const normalizePhone = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
          return `+1${cleaned}`;
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
          return `+${cleaned}`;
        }
        return `+${cleaned}`;
      };

      // Generate session and client IDs
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const sessionId = sessionStorage.getItem('session_id') || generateUUID();
      const clientId = localStorage.getItem('client_id') || generateUUID();

      // Store IDs for future use
      sessionStorage.setItem('session_id', sessionId);
      localStorage.setItem('client_id', clientId);

      // Get UTM data from URL or sessionStorage
      const params = new URLSearchParams(window.location.search);
      const firstTouch = {
        utm_source: params.get('utm_source') || formData.utmSource || 'direct',
        utm_medium: params.get('utm_medium') || formData.utmMedium || 'none',
        utm_campaign: params.get('utm_campaign') || formData.utmCampaign || 'none',
        referrer: document.referrer || 'direct'
      };

      // Photos not included in MVP

      // Prepare submission data in camelCase format (matching API expectations)
      const submissionData: any = {
        serviceType: formData.serviceType,
        mobileService: formData.mobileService || false,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneE164: normalizePhone(formData.phone),
        email: formData.email,
        vehicleYear: parseInt(String(formData.vehicleYear), 10),
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        preferredDate: formData.preferredDate || undefined,
        timePreference: formData.timeWindow || 'flexible',
        notes: formData.damageDescription || undefined,
        smsConsent: formData.smsConsent || false,
        privacyAcknowledgment: formData.privacyAcknowledgment,
        termsAccepted: formData.privacyAcknowledgment,
        clientId: clientId,
        sessionId: sessionId,
        firstTouch: firstTouch,
        lastTouch: firstTouch
      };

      // No files in MVP submission

      // Submit to API
      const submitResponse = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const responseData = await submitResponse.json();

      if (!submitResponse.ok || !responseData.ok) {
        // Handle validation errors specifically
        if (responseData.validationErrors) {
          setErrors(responseData.validationErrors);
          return;
        }

        throw new Error(responseData.error || 'Failed to submit booking');
      }

      // Use real reference number from API response
      const leadId = responseData.id;
      const referenceNumber = responseData.referenceNumber || `REF-${leadId.slice(0, 8).toUpperCase()}`;
      console.log('Booking submitted successfully:', {
        leadId,
        referenceNumber,
        photosUploaded: 0
      });

      setReferenceNumber(referenceNumber);
      setIsSubmitted(true);
      
      // Clear session storage on successful submission
      sessionStorage.removeItem('booking_form_data');
      
      // Track conversion
      // No analytics events in MVP

    } catch (error) {
      console.error('Submission error:', error);

      // Set appropriate error message
      let errorMessage = 'Something went wrong. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Validation')) {
          errorMessage = 'Please check your information and try again.';
        }
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return <SuccessConfirmation referenceNumber={referenceNumber} email={formData.email} />;
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceVehicle
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onNext={goToNextStep}
          />
        );
      case 2:
        return (
          <ContactLocation
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        );
      case 3:
        return (
          <ReviewSubmit
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onSubmit={handleSubmit}
            onPrevious={goToPreviousStep}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light">
      <div className="container-padding pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-brand-navy">
              Get Your <span className="text-pink-600">FREE Quote</span>
            </h1>
          </div>

          {/* Form Container */}
          <div className="mt-4">
            {renderCurrentStep()}
          </div>

          {/* Privacy Notice */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Your information is secure and encrypted. We never sell or share your personal data.{' '}
              <a href="/privacy-policy" className="text-brand-pink hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
