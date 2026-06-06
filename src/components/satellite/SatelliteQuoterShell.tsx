'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AutomatedQuoteForm from '@/components/AutomatedQuoteForm';
import ZipFirstGate from '@/components/satellite/ZipFirstGate';
import type { SatelliteQuoterConfig } from '@/lib/satellite-quoter/config';
import type { SatelliteQuoterTrackingContext } from '@/lib/satellite-quoter/tracking';
import { initializeSession } from '@/lib/tracking';

interface SatelliteQuoterShellProps {
  config: SatelliteQuoterConfig;
}

export default function SatelliteQuoterShell({ config }: SatelliteQuoterShellProps) {
  const [zipPassed, setZipPassed] = useState(false);
  const wrapperCopy = config.wrapperCopy;
  const sectionRef = useRef<HTMLElement | null>(null);

  const trackingContext: SatelliteQuoterTrackingContext = useMemo(
    () => ({
      siteKey: config.siteKey,
      mode: config.mode,
      utmSource: config.utmSource,
      marketHint: config.marketHint,
      surface: `satellite:${config.siteKey}`,
    }),
    [config.marketHint, config.mode, config.siteKey, config.utmSource]
  );

  const showZipFirstGate = config.mode === 'zip-first' && !zipPassed;
  const flowMode = config.mode === 'zip-first' ? 'zip-first-unlocked' : 'standard';
  const showUnlockedQuoteIntro = config.mode === 'zip-first' && zipPassed;
  const quoteCardTitle = wrapperCopy?.quoteCardTitle || 'Get your instant quote';
  const quoteCardBody =
    wrapperCopy?.quoteCardBody ||
    'Enter your license plate and state, or switch to VIN if you have it handy.';

  useEffect(() => {
    initializeSession().catch(() => {
      /* session creation should never block the quoter */
    });
  }, []);

  useEffect(() => {
    if (!showUnlockedQuoteIntro) return;

    // After ZIP unlock, force the host-page viewport back to the absolute top
    // so mobile users see the full post-ZIP state from the beginning.
    const resetScroll = () => {
      if (typeof window === 'undefined') return;

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
    };

    const frameOne = window.requestAnimationFrame(() => {
      resetScroll();
      window.requestAnimationFrame(resetScroll);
    });

    return () => {
      window.cancelAnimationFrame(frameOne);
    };
  }, [showUnlockedQuoteIntro]);

  return (
    <section ref={sectionRef} className="bg-white py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {(wrapperCopy?.headline || wrapperCopy?.subhead) && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            {wrapperCopy?.headline && (
              <h2 className="whitespace-pre-line text-balance text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {wrapperCopy.headline}
              </h2>
            )}
            {wrapperCopy?.subhead && (
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                {wrapperCopy.subhead}
              </p>
            )}
          </div>
        )}

        {showZipFirstGate ? (
          <div className="mx-auto max-w-3xl">
            <ZipFirstGate
              config={config}
              trackingContext={trackingContext}
              onPass={() => setZipPassed(true)}
            />
          </div>
        ) : (
          <>
            {showUnlockedQuoteIntro && (
              <div className="mx-auto mb-6 max-w-3xl rounded-3xl border border-teal-100 bg-teal-50/60 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Next step
                </div>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {quoteCardTitle}
                </h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  {quoteCardBody}
                </p>
              </div>
            )}

            <AutomatedQuoteForm
              flowMode={flowMode}
              showIntro={false}
              trackingContext={trackingContext}
            />
          </>
        )}
      </div>
    </section>
  );
}
