'use client';

import { BookingFormData } from '@/types/booking';
import { useState, useEffect, memo } from 'react';
import { ChevronRight, Car, Wrench } from 'lucide-react';

interface ServiceVehicleProps {
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
}

const ServiceVehicleComponent = ({ formData, updateFormData, errors, onNext }: ServiceVehicleProps) => {
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  // Generate years array (2005-2024)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  // Fetch makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        setLoadingMakes(true);
        const response = await fetch('/api/vehicles/makes');
        if (response.ok) {
          const data = await response.json();
          setAvailableMakes(data.makes || []);
        }
      } catch (error) {
        console.error('Error fetching makes:', error);
      } finally {
        setLoadingMakes(false);
      }
    };
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    if (!formData.vehicleMake) {
      setAvailableModels([]);
      return;
    }

    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch(`/api/vehicles/models?make=${encodeURIComponent(formData.vehicleMake)}`);
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setAvailableModels([]);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [formData.vehicleMake]);

  return (
    <div className="space-y-4">
      {/* Service Selection Section */}
      <div className="bg-white rounded-xl shadow-brand p-6 sm:p-8 lg:p-10">
        <h2 className="text-xl font-semibold text-brand-navy mb-4">Choose Your Service Type</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateFormData({ serviceType: 'repair' })}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              formData.serviceType === 'repair'
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wrench className={`w-6 h-6 flex-shrink-0 ${
                formData.serviceType === 'repair' ? 'text-pink-500' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="text-base font-semibold text-gray-900">Repair</h3>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateFormData({ serviceType: 'replacement' })}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              formData.serviceType === 'replacement'
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Car className={`w-6 h-6 flex-shrink-0 ${
                formData.serviceType === 'replacement' ? 'text-pink-500' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="text-base font-semibold text-gray-900">Replacement</h3>
              </div>
            </div>
          </button>
        </div>

        {errors.serviceType && (
          <p className="text-red-500 text-sm mt-2">{errors.serviceType}</p>
        )}
      </div>

      {/* Vehicle Information Section */}
      <div className="bg-white rounded-xl shadow-brand p-6 sm:p-8 lg:p-10">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Year Selection */}
          <div>
            <select
              id="year"
              value={formData.vehicleYear}
              onChange={(e) => updateFormData({ vehicleYear: e.target.value, vehicleMake: '', vehicleModel: '' })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 touch-manipulation ${
                errors.vehicleYear ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.vehicleYear && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleYear}</p>
            )}
          </div>

          {/* Make Selection */}
          <div>
            <select
              id="make"
              value={formData.vehicleMake}
              onChange={(e) => {
                updateFormData({ vehicleMake: e.target.value, vehicleModel: '' });
              }}
              disabled={loadingMakes || availableMakes.length === 0}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 touch-manipulation ${
                errors.vehicleMake ? 'border-red-500' : 'border-gray-300'
              } ${(loadingMakes || availableMakes.length === 0) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">{loadingMakes ? 'Loading...' : 'Make'}</option>
              {availableMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {errors.vehicleMake && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleMake}</p>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <select
              id="model"
              value={formData.vehicleModel}
              onChange={(e) => {
                updateFormData({ vehicleModel: e.target.value });
              }}
              disabled={!formData.vehicleMake || loadingModels}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 touch-manipulation ${
                errors.vehicleModel ? 'border-red-500' : 'border-gray-300'
              } ${(!formData.vehicleMake || loadingModels) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">{loadingModels ? 'Loading...' : 'Model'}</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
              <option value="Other">Other</option>
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
};

export const ServiceVehicle = memo(ServiceVehicleComponent);