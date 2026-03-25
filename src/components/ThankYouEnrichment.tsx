'use client';

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * ThankYouEnrichment — Progressive capture form shown on thank-you page.
 * Collects vehicle + insurance info to enrich the lead that was just created.
 * Only shown if a pending_lead_id exists in sessionStorage.
 */
export default function ThankYouEnrichment() {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [hasInsurance, setHasInsurance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const id = sessionStorage.getItem('pending_lead_id');
    if (id) setLeadId(id);

    // Load vehicle makes
    fetch('/api/vehicles/makes')
      .then(r => r.json())
      .then(data => {
        if (data?.makes && Array.isArray(data.makes)) {
          setAvailableMakes(data.makes);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!vehicleMake) { setAvailableModels([]); return; }
    fetch(`/api/vehicles/models?make=${encodeURIComponent(vehicleMake)}`)
      .then(r => r.json())
      .then(data => {
        if (data?.models && Array.isArray(data.models)) {
          setAvailableModels(data.models);
        }
      })
      .catch(() => {});
  }, [vehicleMake]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lead/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
          vehicleMake: vehicleMake || null,
          vehicleModel: vehicleModel || null,
          hasInsurance: hasInsurance || null,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        sessionStorage.removeItem('pending_lead_id');
      }
    } catch {
      // Non-critical — lead already exists, this is just enrichment
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show if no pending lead or already submitted
  if (!leadId || submitted) {
    if (submitted) {
      return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-center">
          <p className="text-blue-800 font-semibold">Thanks! We&apos;ll have your quote ready when we call.</p>
        </div>
      );
    }
    return null;
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i);

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        Help us prepare your quote
      </h2>
      <p className="text-gray-600 text-sm mb-4">While you wait for our call, tell us about your vehicle:</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <select
            value={vehicleYear}
            onChange={(e) => setVehicleYear(e.target.value)}
            className="p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            aria-label="Vehicle year"
          >
            <option value="">Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={vehicleMake}
            onChange={(e) => { setVehicleMake(e.target.value); setVehicleModel(''); }}
            className="p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            aria-label="Vehicle make"
          >
            <option value="">Make</option>
            {availableMakes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            className="p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            aria-label="Vehicle model"
            disabled={!vehicleMake}
          >
            <option value="">Model</option>
            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <select
          value={hasInsurance}
          onChange={(e) => setHasInsurance(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          aria-label="Insurance status"
        >
          <option value="">Do you have insurance?</option>
          <option value="yes">Yes - I have insurance</option>
          <option value="no">No - I&apos;ll pay out of pocket</option>
          <option value="unsure">Not sure</option>
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Saving...' : 'Save Vehicle Info'}
          {!isSubmitting && <ChevronRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
