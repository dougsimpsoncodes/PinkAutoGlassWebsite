'use client';

import { BookingFormData } from '@/types/booking';
import { useEffect, useState } from 'react';
import { ChevronRight, Car, Wrench, Home, MapPin } from 'lucide-react';
import { vehicleDatabase } from '@/data/vehicles';

interface ServiceVehicleProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
}

export function ServiceVehicle({ formData, updateFormData, errors, onNext }: ServiceVehicleProps) {
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Update available makes when year changes
  useEffect(() => {
    if (formData.vehicleYear) {
      // Convert to number for comparison with database
      const yearNum = typeof formData.vehicleYear === 'string' ? parseInt(formData.vehicleYear, 10) : formData.vehicleYear;
      const yearData = vehicleDatabase.find(v => v.year === yearNum);
      if (yearData) {
        setAvailableMakes(Object.keys(yearData.makes));
        // Reset make and model if year changed
        if (!Object.keys(yearData.makes).includes(formData.vehicleMake)) {
          updateFormData({ vehicleMake: '', vehicleModel: '' });
          setAvailableModels([]);
        }
      }
    } else {
      setAvailableMakes([]);
      setAvailableModels([]);
    }
  }, [formData.vehicleYear]);

  // Update available models when make changes
  useEffect(() => {
    if (formData.vehicleYear && formData.vehicleMake) {
      // Convert to number for comparison with database
      const yearNum = typeof formData.vehicleYear === 'string' ? parseInt(formData.vehicleYear, 10) : formData.vehicleYear;
      const yearData = vehicleDatabase.find(v => v.year === yearNum);
      const models = yearData?.makes[formData.vehicleMake as keyof typeof yearData.makes];
      if (yearData && models) {
        setAvailableModels(models);
        // Reset model if make changed
        if (!models.includes(formData.vehicleModel)) {
          updateFormData({ vehicleModel: '' });
        }
      }
    } else {
      setAvailableModels([]);
    }
  }, [formData.vehicleMake, formData.vehicleYear]);

  return (
    <div className="space-y-8">
      {/* Service Selection Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What service do you need?</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => updateFormData({ serviceType: 'repair' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              formData.serviceType === 'repair'
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <Wrench className={`w-8 h-8 flex-shrink-0 ${
                formData.serviceType === 'repair' ? 'text-pink-500' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Windshield Repair</h3>
                <p className="text-sm text-gray-600 mb-2">Chips, cracks under 6 inches</p>
                <p className="text-lg font-bold text-pink-600">Starting at $89</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateFormData({ serviceType: 'replacement' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              formData.serviceType === 'replacement'
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <Car className={`w-8 h-8 flex-shrink-0 ${
                formData.serviceType === 'replacement' ? 'text-pink-500' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Windshield Replacement</h3>
                <p className="text-sm text-gray-600 mb-2">Full windshield replacement</p>
                <p className="text-lg font-bold text-pink-600">Starting at $299</p>
              </div>
            </div>
          </button>
        </div>

        {errors.serviceType && (
          <p className="text-red-500 text-sm mt-2">{errors.serviceType}</p>
        )}
      </div>

      {/* Vehicle Information Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tell us about your vehicle</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Year Selection */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <select
              id="year"
              value={formData.vehicleYear}
              onChange={(e) => updateFormData({ vehicleYear: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 touch-manipulation ${
                errors.vehicleYear ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ WebkitAppearance: 'none', appearance: 'none' }}
            >
              <option value="">Select Year</option>
              {vehicleDatabase.map(v => (
                <option key={v.year} value={v.year}>{v.year}</option>
              ))}
            </select>
            {errors.vehicleYear && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleYear}</p>
            )}
          </div>

          {/* Make Selection */}
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
              Make *
            </label>
            <select
              id="make"
              value={formData.vehicleMake}
              onChange={(e) => updateFormData({ vehicleMake: e.target.value })}
              disabled={!formData.vehicleYear}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 touch-manipulation ${
                errors.vehicleMake ? 'border-red-500' : 'border-gray-300'
              } ${!formData.vehicleYear ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              style={{ WebkitAppearance: 'none', appearance: 'none' }}
            >
              <option value="">Select Make</option>
              {availableMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            {errors.vehicleMake && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleMake}</p>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <select
              id="model"
              value={formData.vehicleModel}
              onChange={(e) => updateFormData({ vehicleModel: e.target.value })}
              disabled={!formData.vehicleMake}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 touch-manipulation ${
                errors.vehicleModel ? 'border-red-500' : 'border-gray-300'
              } ${!formData.vehicleMake ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              style={{ WebkitAppearance: 'none', appearance: 'none' }}
            >
              <option value="">Select Model</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            {errors.vehicleModel && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>
            )}
          </div>
        </div>

        {/* Quick tip */}
        {formData.vehicleYear && formData.vehicleMake && formData.vehicleModel && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Great! We service {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="btn-primary flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}