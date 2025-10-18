'use client';

import { useState } from 'react';
import { Car, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function QuoteCalculator() {
  const [serviceType, setServiceType] = useState<'repair' | 'replacement' | ''>('');
  const [vehicleType, setVehicleType] = useState<'sedan' | 'suv' | 'truck' | 'luxury' | ''>('');
  const [hasADAS, setHasADAS] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [showResults, setShowResults] = useState(false);

  const calculatePriceRange = () => {
    if (!serviceType || !vehicleType) return { min: 0, max: 0 };

    const basePrice = {
      repair: { min: 75, max: 150 },
      replacement: {
        sedan: { min: 300, max: 480 },
        suv: { min: 380, max: 650 },
        truck: { min: 360, max: 620 },
        luxury: { min: 450, max: 800 }
      }
    };

    if (serviceType === 'repair') {
      return basePrice.repair;
    }

    let range = basePrice.replacement[vehicleType];

    // Add ADAS cost if applicable (though we include it free)
    if (hasADAS && serviceType === 'replacement') {
      range = { ...range }; // ADAS included in our pricing
    }

    return range;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceType && vehicleType) {
      setShowResults(true);
    }
  };

  const priceRange = calculatePriceRange();
  const insuranceNote = "Most customers with comprehensive insurance pay $0";

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-pink-100 rounded-full mb-3">
          <DollarSign className="w-8 h-8 text-pink-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Instant Quote Calculator</h3>
        <p className="text-gray-600">Get an estimated price range in seconds</p>
      </div>

      <form onSubmit={handleCalculate} className="space-y-4">
        {/* Service Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">Service Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setServiceType('repair')}
              className={`p-3 rounded-lg border-2 transition-all ${
                serviceType === 'repair'
                  ? 'border-pink-600 bg-pink-50 text-pink-600'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="font-semibold">Repair</div>
              <div className="text-xs text-gray-600">Small chips/cracks</div>
            </button>
            <button
              type="button"
              onClick={() => setServiceType('replacement')}
              className={`p-3 rounded-lg border-2 transition-all ${
                serviceType === 'replacement'
                  ? 'border-pink-600 bg-pink-50 text-pink-600'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="font-semibold">Replacement</div>
              <div className="text-xs text-gray-600">Full windshield</div>
            </button>
          </div>
        </div>

        {/* Vehicle Type */}
        {serviceType && (
          <div>
            <label className="block text-sm font-semibold mb-2">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-600 focus:outline-none"
              required
            >
              <option value="">Select vehicle type...</option>
              <option value="sedan">Sedan / Compact</option>
              <option value="suv">SUV / Crossover</option>
              <option value="truck">Truck / Van</option>
              <option value="luxury">Luxury / Premium</option>
            </select>
          </div>
        )}

        {/* ADAS */}
        {serviceType === 'replacement' && vehicleType && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasADAS}
                onChange={(e) => setHasADAS(e.target.checked)}
                className="mt-1 w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <div>
                <div className="font-semibold">My vehicle has ADAS features</div>
                <div className="text-sm text-gray-600">
                  Lane keeping, auto-braking, or forward collision warning (2018+ vehicles)
                </div>
              </div>
            </label>
          </div>
        )}

        {/* Email */}
        {serviceType && vehicleType && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Email (optional - for detailed quote)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-600 focus:outline-none"
            />
          </div>
        )}

        {/* Calculate Button */}
        {serviceType && vehicleType && (
          <button
            type="submit"
            className="w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
          >
            Calculate Price Range
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Results */}
      {showResults && priceRange.min > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 text-center">
            <div className="text-sm font-semibold text-gray-600 mb-2">Estimated Price Range</div>
            <div className="text-4xl font-bold text-pink-600 mb-2">
              ${priceRange.min} - ${priceRange.max}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {serviceType === 'replacement' && hasADAS && '(ADAS calibration included)'}
            </div>
            <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 mb-4">
              <div className="font-bold text-green-800 mb-1">With Insurance:</div>
              <div className="text-2xl font-bold text-green-600">$0</div>
              <div className="text-sm text-green-700">{insuranceNote}</div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Car className="w-4 h-4" />
                Mobile service included (free)
              </div>
              {serviceType === 'replacement' && (
                <>
                  <div>Lifetime warranty on all installations</div>
                  {hasADAS && <div>ADAS calibration included (no extra charge)</div>}
                </>
              )}
            </div>
            <Link
              href="/book"
              className="inline-block w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Get Exact Quote & Book Now
            </Link>
          </div>
        </div>
      )}

      {!showResults && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          Select service type and vehicle to see pricing estimate
        </div>
      )}
    </div>
  );
}
