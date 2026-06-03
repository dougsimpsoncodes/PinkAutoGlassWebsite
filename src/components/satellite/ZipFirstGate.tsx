'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { isInServiceArea, OUT_OF_AREA_MESSAGE } from '@/lib/quote/service-area';
import { trackEvent } from '@/lib/tracking';
import type { SatelliteQuoterConfig } from '@/lib/satellite-quoter/config';
import type { SatelliteQuoterTrackingContext } from '@/lib/satellite-quoter/tracking';

interface ZipFirstGateProps {
  config: SatelliteQuoterConfig;
  trackingContext: SatelliteQuoterTrackingContext;
  onPass: (zip: string) => void;
}

export default function ZipFirstGate({
  config,
  trackingContext,
  onPass,
}: ZipFirstGateProps) {
  const [zip, setZip] = useState('');
  const [notice, setNotice] = useState('');
  const wrapperCopy = config.wrapperCopy;

  const canSubmit = /^\d{5}(-\d{4})?$/.test(zip.trim());
  const metadata = useMemo(
    () => ({
      flow_mode: 'zip-first',
      ...trackingContext,
    }),
    [trackingContext]
  );

  function logEvent(eventName: string, extra?: Record<string, unknown>) {
    trackEvent({
      eventName,
      eventCategory: 'satellite_quoter',
      metadata: {
        ...metadata,
        ...extra,
      },
    }).catch(() => { /* analytics never blocks UX */ });
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const result = isInServiceArea(zip.trim());
    if (!result.inServiceArea) {
      setNotice(result.reason === 'invalid_zip' ? 'Please enter a valid ZIP code.' : OUT_OF_AREA_MESSAGE);
      logEvent('satellite_quoter_zip_failed', {
        zip3: result.zip3,
        reason: result.reason,
      });
      return;
    }

    setNotice('');
    logEvent('satellite_quoter_zip_passed', { zip3: result.zip3 });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onPass(zip.trim());
  }

  return (
    <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
        {wrapperCopy?.startLabel || 'Start here'}
      </div>
      <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {wrapperCopy?.zipTitle || 'Get an instant quote'}
      </h3>
      <p className="mt-3 text-base leading-7 text-slate-600">
        {wrapperCopy?.zipBody || "If we serve your ZIP, you can quote and book online right now."}
      </p>

      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-semibold text-slate-900">Service ZIP</span>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4">
            <MapPin className="mr-2 h-5 w-5 text-slate-400" />
            <input
              value={zip}
              onChange={(event) => {
                setZip(event.target.value.replace(/[^0-9-]/g, '').slice(0, 10));
                if (notice) setNotice('');
              }}
              inputMode="numeric"
              placeholder="80212"
              className="w-full border-0 py-4 text-lg text-slate-950 outline-none placeholder:text-slate-400"
              aria-label="Service ZIP"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-2xl bg-teal-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {wrapperCopy?.zipCta || 'Check My ZIP'}
          </button>
        </div>
      </label>

      {notice && (
        <div className="mt-4 flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
