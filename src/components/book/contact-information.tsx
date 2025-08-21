import { cn } from '@/lib/utils';
import type { BookingFormData } from '@/types/booking';

interface ContactInformationProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onPrevious: () => void;
}

// timeOptions removed - best time to call field removed

export function ContactInformation({
  formData,
  updateFormData,
  errors,
  onNext,
  onPrevious,
}: ContactInformationProps) {
  
  const formatPhone = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return input;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    updateFormData({ phone: formatted });
  };

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    // Allow only letters, spaces, and common name characters
    const cleaned = value.replace(/[^a-zA-Z\s'-]/g, '');
    updateFormData({ [field]: cleaned });
  };

  const isValidToProgress = 
    formData.firstName.length >= 2 &&
    formData.lastName.length >= 2 &&
    /^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy mb-2">
          How can we reach you?
        </h2>
        <p className="text-gray-600">
          We'll use this information to confirm your appointment and provide updates
        </p>
      </div>

      {/* Contact Form */}
      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-brand-navy">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleNameChange('firstName', e.target.value)}
              className={cn(
                'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
                errors.firstName ? 'border-red-500' : ''
              )}
              placeholder="Enter your first name"
              maxLength={50}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-brand-navy">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleNameChange('lastName', e.target.value)}
              className={cn(
                'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
                errors.lastName ? 'border-red-500' : ''
              )}
              placeholder="Enter your last name"
              maxLength={50}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-brand-navy">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
              errors.phone ? 'border-red-500' : ''
            )}
            placeholder="(555) 123-4567"
            maxLength={14}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}
          <p className="text-sm text-gray-500">
            We'll use this number to confirm your appointment and send updates
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-brand-navy">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value.toLowerCase() })}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
              errors.email ? 'border-red-500' : ''
            )}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
          <p className="text-sm text-gray-500">
            We'll send your quote and appointment details to this email
          </p>
        </div>

        {/* Best time to call removed - auto glass work is typically urgent */}
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-brand-pink text-lg">🔒</div>
          <div>
            <h4 className="text-sm font-medium text-brand-navy mb-1">
              Your privacy matters
            </h4>
            <p className="text-sm text-gray-600">
              We only use your contact information for service delivery and appointment coordination. 
              We never sell or share your personal data with third parties.
            </p>
          </div>
        </div>
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