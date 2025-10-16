import { cn } from '@/lib/utils';
import type { BookingFormData } from '@/types/booking';

interface ServiceSelectionProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
}

const services = [
  {
    id: 'repair' as const,
    name: 'Windshield Repair',
    description: 'Fix chips & cracks',
    price: 'Starting at $89',
    icon: '🔧',
    popular: false,
  },
  {
    id: 'replacement' as const,
    name: 'Windshield Replacement',
    description: 'Complete replacement',
    price: 'From $299',
    icon: '🚗',
    popular: true,
  },
];

// Mobile service removed - all services are mobile

export function ServiceSelection({
  formData,
  updateFormData,
  errors,
  onNext,
}: ServiceSelectionProps) {
  const handleServiceSelect = (serviceId: 'repair' | 'replacement') => {
    updateFormData({ serviceType: serviceId });
  };

  // Mobile service removed - all services are mobile

  const isValidToProgress = formData.serviceType !== '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy mb-2">
          What service do you need?
        </h2>
        <p className="text-gray-600">
          Choose the service that best fits your needs
        </p>
      </div>

      {/* Service Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-navy mb-4">
          Primary Service
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={cn(
                'relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200',
                'hover:shadow-md hover:-translate-y-1',
                {
                  'border-brand-pink bg-gradient-light shadow-brand':
                    formData.serviceType === service.id,
                  'border-gray-200 bg-white hover:border-gray-300':
                    formData.serviceType !== service.id,
                }
              )}
              onClick={() => handleServiceSelect(service.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleServiceSelect(service.id);
                }
              }}
              aria-pressed={formData.serviceType === service.id}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute -top-2 -right-2">
                  <span className="badge badge-primary">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Service Icon */}
              <div className="text-3xl mb-3">{service.icon}</div>

              {/* Service Details */}
              <h4 className="text-lg font-semibold text-brand-navy mb-2">
                {service.name}
              </h4>
              <p className="text-gray-600 text-sm mb-3">
                {service.description}
              </p>
              <div className="text-brand-pink font-semibold">
                {service.price}
              </div>

              {/* Selection Indicator */}
              <div
                className={cn(
                  'absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-200',
                  {
                    'border-brand-pink bg-brand-pink': formData.serviceType === service.id,
                    'border-gray-300': formData.serviceType !== service.id,
                  }
                )}
              >
                {formData.serviceType === service.id && (
                  <svg
                    className="w-4 h-4 text-white m-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile service notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">ℹ️</span>
          <p className="text-sm text-blue-800">
            All our services are mobile - we come to you at your home or office!
          </p>
        </div>
      </div>

      {/* Mobile service add-on section removed - all services are mobile */}

      {/* Error Message */}
      {errors.serviceType && (
        <div className="text-red-500 text-sm flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errors.serviceType}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6">
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