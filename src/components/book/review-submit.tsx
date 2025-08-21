import { cn } from '@/lib/utils';
import type { BookingFormData } from '@/types/booking';

interface ReviewSubmitProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export function ReviewSubmit({
  formData,
  updateFormData,
  errors,
  onSubmit,
  onPrevious,
  isLoading,
}: ReviewSubmitProps) {

  const getServiceDisplayName = () => {
    const serviceNames: Record<string, string> = {
      'repair': 'Windshield Repair',
      'replacement': 'Windshield Replacement',
    };
    
    const mainService = serviceNames[formData.serviceType] || formData.serviceType;
    return `${mainService} (Mobile Service)`;
  };

  const getDateDisplayName = () => {
    const dateLabels: Record<string, string> = {
      'today': 'Today',
      'tomorrow': 'Tomorrow',
      'day_after': 'Day After Tomorrow',
      'this_week': 'Later This Week',
      'next_week': 'Next Week',
      'custom': 'Selected Date',
    };
    return dateLabels[formData.preferredDate] || formData.preferredDate;
  };

  const getTimeDisplayName = () => {
    if (!formData.timeWindow) return 'Flexible timing';
    
    const timeLabels: Record<string, string> = {
      'morning': 'Morning (8AM-12PM)',
      'afternoon': 'Afternoon (12PM-5PM)',
      'anytime': 'Anytime',
    };
    return timeLabels[formData.timeWindow] || formData.timeWindow;
  };

  // getBestTimeDisplayName removed - best time to call field removed

  const isValidToSubmit = 
    formData.smsConsent && 
    formData.privacyAcknowledgment &&
    (!formData.damageDescription || formData.damageDescription.length <= 500);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy mb-2">
          Review your quote request
        </h2>
        <p className="text-gray-600">
          Please review the information below and submit your request
        </p>
      </div>

      {/* Review Summary */}
      <div className="space-y-6">
        {/* Service Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">Service Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{getServiceDisplayName()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium">
                {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
                {/* Trim removed - not needed for auto glass work */}
              </span>
            </div>
            {formData.photos.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Photos:</span>
                <span className="font-medium">{formData.photos.length} uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{formData.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{formData.email}</span>
            </div>
            {/* Best time to call removed - auto glass work is typically urgent */}
          </div>
        </div>

        {/* Location & Schedule Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">Location & Schedule</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Address:</span>
              <div className="text-right font-medium">
                <div>{formData.streetAddress}</div>
                <div>{formData.city}, {formData.state} {formData.zipCode}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Preferred date:</span>
              <span className="font-medium">{getDateDisplayName()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time window:</span>
              <span className="font-medium">{getTimeDisplayName()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Damage Description */}
      <div className="space-y-4">
        <label htmlFor="damageDescription" className="text-lg font-semibold text-brand-navy">
          Damage Description (Optional)
        </label>
        <textarea
          id="damageDescription"
          value={formData.damageDescription || ''}
          onChange={(e) => updateFormData({ damageDescription: e.target.value })}
          rows={4}
          maxLength={500}
          className={cn(
            'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink resize-none',
            errors.damageDescription ? 'border-red-500' : ''
          )}
          placeholder="Describe the damage or any specific concerns you have..."
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            Help us prepare for your service by describing the damage
          </span>
          <span className={cn(
            'text-gray-500',
            formData.damageDescription && formData.damageDescription.length > 450 ? 'text-orange-500' : '',
            formData.damageDescription && formData.damageDescription.length > 500 ? 'text-red-500' : ''
          )}>
            {formData.damageDescription?.length || 0}/500
          </span>
        </div>
        {errors.damageDescription && (
          <p className="text-red-500 text-sm">{errors.damageDescription}</p>
        )}
      </div>

      {/* Consent and Privacy Section */}
      <div className="space-y-6 border-t pt-6">
        <h3 className="text-lg font-semibold text-brand-navy">
          Required Consents
        </h3>

        {/* SMS Consent */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="smsConsent"
              checked={formData.smsConsent}
              onChange={(e) => updateFormData({ smsConsent: e.target.checked })}
              className="w-5 h-5 text-brand-pink border-gray-300 rounded focus:ring-brand-pink focus:ring-offset-0 mt-0.5"
            />
            <label htmlFor="smsConsent" className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium">SMS Consent:</span> I consent to receive appointment updates 
              and service notifications via SMS to the phone number provided. Standard message rates may apply. 
              Text STOP to opt-out anytime. <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.smsConsent && (
            <p className="text-red-500 text-sm ml-8">{errors.smsConsent}</p>
          )}
        </div>

        {/* Privacy Acknowledgment */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacyAcknowledgment"
              checked={formData.privacyAcknowledgment}
              onChange={(e) => updateFormData({ privacyAcknowledgment: e.target.checked })}
              className="w-5 h-5 text-brand-pink border-gray-300 rounded focus:ring-brand-pink focus:ring-offset-0 mt-0.5"
            />
            <label htmlFor="privacyAcknowledgment" className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium">Privacy Acknowledgment:</span> I acknowledge that my information 
              will be retained for 18 months to provide service and support. Photos are kept for 90 days 
              (or 18 months if service is scheduled). I understand my rights to request data deletion, 
              correction, or export. <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.privacyAcknowledgment && (
            <p className="text-red-500 text-sm ml-8">{errors.privacyAcknowledgment}</p>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-lg">🔒</div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Your Privacy & Data Security
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Data Protection:</strong> Your information is encrypted and stored securely using 
                  industry-standard practices. We never sell or share your personal data.
                </p>
                <p>
                  <strong>Data Retention:</strong> Contact information and service details are retained for 
                  18 months. Photos are kept for 90 days (18 months if you schedule service).
                </p>
                <p>
                  <strong>Your Rights:</strong> You can request data deletion, correction, or export at any time.
                </p>
              </div>
              <a 
                href="/privacy-policy" 
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Complete Privacy Policy →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Error */}
      {errors.submit && (
        <div className="text-red-500 text-sm flex items-center space-x-2 justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errors.submit}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="btn-secondary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <button
          onClick={onSubmit}
          disabled={!isValidToSubmit || isLoading}
          className={cn(
            'btn-primary min-w-[140px]',
            {
              'opacity-50 cursor-not-allowed': !isValidToSubmit || isLoading,
            }
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Getting Quote...
            </>
          ) : (
            <>
              Get Free Quote
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}