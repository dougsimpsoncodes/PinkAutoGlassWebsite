'use client';

import { BookingFormData } from '@/types/booking';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';

interface ContactLocationProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onPrevious: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function ContactLocation({ formData, updateFormData, errors, onNext, onPrevious }: ContactLocationProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const [, area, prefix, line] = match;
      if (line) return `(${area}) ${prefix}-${line}`;
      if (prefix) return `(${area}) ${prefix}`;
      if (area) return `(${area}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateFormData({ phone: formatted });
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get 30 days from now as maximum
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const days = [];

    // Add empty cells for days before month starts
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  const isDateSelectable = (day: number) => {
    if (!day) return false;
    const date = new Date(selectedYear, selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    return dateStr >= minDate && dateStr <= maxDateStr;
  };

  const selectDate = (day: number) => {
    if (!isDateSelectable(day)) return;
    const date = new Date(selectedYear, selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    updateFormData({ preferredDate: dateStr });
    setShowDatePicker(false);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-8">
      {/* Contact Information Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(303) 555-1234"
              maxLength={14}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Location Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          <MapPin className="inline w-6 h-6 mr-2 text-pink-500" />
          Service Location
        </h2>
        
        {formData.mobileService && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">🚐 Mobile Service Selected</p>
            <p className="text-sm text-blue-600 mt-1">
              We'll come to this address to service your vehicle
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Street Address */}
          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Street Address (Optional)
            </label>
            <input
              type="text"
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => updateFormData({ streetAddress: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Denver"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                id="state"
                value={formData.state || 'CO'}
                onChange={(e) => updateFormData({ state: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* ZIP */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  updateFormData({ zipCode: value });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="80202"
                maxLength={5}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Date Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <Calendar className="inline w-6 h-6 mr-2 text-pink-500" />
          When would you like service?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date (Optional)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                {formData.preferredDate ? (
                  new Date(formData.preferredDate + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                ) : (
                  <span className="text-gray-400">Select a date</span>
                )}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>

              {/* Custom Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  {/* Month/Year Selection */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedMonth === 0) {
                          setSelectedMonth(11);
                          setSelectedYear(selectedYear - 1);
                        } else {
                          setSelectedMonth(selectedMonth - 1);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="font-medium">
                      {monthNames[selectedMonth]} {selectedYear}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedMonth === 11) {
                          setSelectedMonth(0);
                          setSelectedYear(selectedYear + 1);
                        } else {
                          setSelectedMonth(selectedMonth + 1);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => day && selectDate(day)}
                        disabled={!day || !isDateSelectable(day)}
                        className={`
                          py-2 text-sm rounded transition-colors
                          ${!day ? 'invisible' : ''}
                          ${day && isDateSelectable(day)
                            ? 'hover:bg-pink-100 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'}
                          ${day && formData.preferredDate ===
                            new Date(selectedYear, selectedMonth, day).toISOString().split('T')[0]
                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                            : ''}
                        `}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Quick Select Options */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">Quick Select:</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          updateFormData({ preferredDate: tomorrow.toISOString().split('T')[0] });
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextWeek = new Date();
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          updateFormData({ preferredDate: nextWeek.toISOString().split('T')[0] });
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Next Week
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Click to select a date • Available: Tomorrow - Next 30 days
            </p>
          </div>

          <div>
            <label htmlFor="timeWindow" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <select
              id="timeWindow"
              value={formData.timeWindow || 'flexible'}
              onChange={(e) => updateFormData({ timeWindow: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="flexible">Flexible</option>
              <option value="morning">Morning (8am - 12pm)</option>
              <option value="afternoon">Afternoon (12pm - 5pm)</option>
              <option value="evening">Evening (5pm - 8pm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        
        <button
          type="button"
          onClick={onNext}
          className="btn-primary flex items-center gap-2"
        >
          Review Order
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}