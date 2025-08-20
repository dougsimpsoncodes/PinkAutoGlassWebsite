import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookingFormData } from '@/app/book/page';

interface LocationScheduleProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onPrevious: () => void;
}

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const dateOptions = [
  { value: 'today', label: 'Today', available: false },
  { value: 'tomorrow', label: 'Tomorrow', available: true },
  { value: 'day_after', label: 'Day After Tomorrow', available: true },
  { value: 'this_week', label: 'Later This Week', available: true },
  { value: 'next_week', label: 'Next Week', available: true },
  { value: 'custom', label: 'Select Date', available: true },
];

const timeWindows = [
  { value: 'morning', label: 'Morning (8AM-12PM)', available: true },
  { value: 'afternoon', label: 'Afternoon (12PM-5PM)', available: true },
  { value: 'anytime', label: 'Anytime', available: true },
];

export function LocationSchedule({
  formData,
  updateFormData,
  errors,
  onNext,
  onPrevious,
}: LocationScheduleProps) {


  const handleZipCodeChange = (zipCode: string) => {
    // Only allow digits and limit to 5 characters
    const cleaned = zipCode.replace(/\D/g, '').slice(0, 5);
    updateFormData({ zipCode: cleaned });

    // Auto-populate city/state for known ZIP codes (mock implementation)
    if (cleaned.length === 5) {
      // TODO: Replace with actual ZIP code lookup API
      const mockZipData: Record<string, { city: string; state: string }> = {
        '80202': { city: 'Denver', state: 'CO' },
        '10001': { city: 'New York', state: 'NY' },
        '90210': { city: 'Beverly Hills', state: 'CA' },
        '60601': { city: 'Chicago', state: 'IL' },
      };

      if (mockZipData[cleaned]) {
        updateFormData({
          city: mockZipData[cleaned].city,
          state: mockZipData[cleaned].state,
        });
      }
    }
  };

  const isValidToProgress = 
    formData.streetAddress && formData.city && formData.state && formData.zipCode &&
    formData.preferredDate;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy mb-2">
          Where and when?
        </h2>
        <p className="text-gray-600">
          Tell us where you'd like the service and your preferred timing
        </p>
      </div>

      {/* Location Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-navy">
          Service Location
        </h3>

        {/* Manual Address Entry */}
        <div className="space-y-4">

          {/* Street Address */}
          <div className="space-y-2">
            <label htmlFor="streetAddress" className="text-sm font-medium text-brand-navy">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => updateFormData({ streetAddress: e.target.value })}
              className={cn(
                'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
                errors.streetAddress ? 'border-red-500' : ''
              )}
              placeholder="123 Main Street"
            />
            {errors.streetAddress && (
              <p className="text-red-500 text-sm">{errors.streetAddress}</p>
            )}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* City */}
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium text-brand-navy">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
                  errors.city ? 'border-red-500' : ''
                )}
                placeholder="Denver"
              />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium text-brand-navy">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => updateFormData({ state: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
                  errors.state ? 'border-red-500' : ''
                )}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-red-500 text-sm">{errors.state}</p>
              )}
            </div>

            {/* ZIP Code */}
            <div className="space-y-2">
              <label htmlFor="zipCode" className="text-sm font-medium text-brand-navy">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink',
                  errors.zipCode ? 'border-red-500' : ''
                )}
                placeholder="80202"
                maxLength={5}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-navy">
          Preferred Schedule
        </h3>

        {/* Date Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-brand-navy mb-3 block">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dateOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                    'hover:shadow-sm',
                    {
                      'border-brand-pink bg-gradient-light': formData.preferredDate === option.value,
                      'border-gray-200 bg-white hover:border-gray-300': formData.preferredDate !== option.value,
                      'opacity-50 cursor-not-allowed': !option.available,
                    }
                  )}
                  onClick={() => {
                    if (option.available) {
                      updateFormData({ preferredDate: option.value });
                    }
                  }}
                  role="button"
                  tabIndex={option.available ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && option.available) {
                      e.preventDefault();
                      updateFormData({ preferredDate: option.value });
                    }
                  }}
                  aria-pressed={formData.preferredDate === option.value}
                  aria-disabled={!option.available}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm font-medium',
                      option.available ? 'text-brand-navy' : 'text-gray-400'
                    )}>
                      {option.label}
                    </span>
                    {!option.available && (
                      <span className="text-xs text-gray-400">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {errors.preferredDate && (
            <p className="text-red-500 text-sm">{errors.preferredDate}</p>
          )}
        </div>

        {/* Time Window Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-brand-navy mb-3 block">
              Time Window (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {timeWindows.map((window) => (
                <div
                  key={window.value}
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                    'hover:shadow-sm',
                    {
                      'border-brand-pink bg-gradient-light': formData.timeWindow === window.value,
                      'border-gray-200 bg-white hover:border-gray-300': formData.timeWindow !== window.value,
                      'opacity-50 cursor-not-allowed': !window.available,
                    }
                  )}
                  onClick={() => {
                    if (window.available) {
                      updateFormData({ 
                        timeWindow: formData.timeWindow === window.value ? '' : window.value 
                      });
                    }
                  }}
                  role="button"
                  tabIndex={window.available ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && window.available) {
                      e.preventDefault();
                      updateFormData({ 
                        timeWindow: formData.timeWindow === window.value ? '' : window.value 
                      });
                    }
                  }}
                  aria-pressed={formData.timeWindow === window.value}
                  aria-disabled={!window.available}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm font-medium',
                      window.available ? 'text-brand-navy' : 'text-gray-400'
                    )}>
                      {window.label}
                    </span>
                    {!window.available && (
                      <span className="text-xs text-gray-400">Booked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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