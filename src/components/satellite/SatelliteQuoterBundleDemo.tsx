'use client';

import { useEffect } from 'react';
import type { SatelliteQuoterMountApi } from '@/embed/satellite-quoter-entry';

declare global {
  interface Window {
    PAGSatelliteQuoterV1?: SatelliteQuoterMountApi;
  }
}

const SCRIPT_ID = 'pag-satellite-quoter-demo-bundle';
const BUNDLE_SRC = '/embed/satellite-quoter.v1.js';

function mountDemoQuoters() {
  window.PAGSatelliteQuoterV1?.mount('#satellite-quoter-demo-standard', {
    mode: 'standard',
    siteKey: 'windshieldchiprepairdenver',
    marketHint: 'colorado',
    utmSource: 'windshieldchiprepairdenver.com',
    wrapperCopy: {
      headline: "DON'T WAIT.\nGet an instant quote\nand book your service now.",
      subhead: 'No phone calls. Just quote and book.',
    },
  });

  window.PAGSatelliteQuoterV1?.mount('#satellite-quoter-demo-zip-first', {
    mode: 'zip-first',
    siteKey: 'windshieldcostcalculator',
    marketHint: 'national',
    utmSource: 'windshieldcostcalculator.com',
    wrapperCopy: {
      headline: "DON'T WAIT.\nGet an instant quote\nand book your service now.",
      subhead: 'Enter your ZIP to unlock instant pricing and online booking.',
      startLabel: 'Start here',
      zipTitle: 'Get an instant quote',
      zipBody: 'If we serve your ZIP, you can quote and book online right now.',
      zipCta: 'Check My ZIP',
    },
  });
}

function unmountDemoQuoters() {
  window.PAGSatelliteQuoterV1?.unmount('#satellite-quoter-demo-standard');
  window.PAGSatelliteQuoterV1?.unmount('#satellite-quoter-demo-zip-first');
}

export default function SatelliteQuoterBundleDemo() {
  useEffect(() => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.PAGSatelliteQuoterV1) mountDemoQuoters();
      return () => unmountDemoQuoters();
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = BUNDLE_SRC;
    script.async = true;
    script.onload = () => mountDemoQuoters();
    document.head.appendChild(script);

    return () => {
      unmountDemoQuoters();
    };
  }, []);

  return (
    <div className="bg-slate-950 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-300">
            Shared satellite quoter bundle demo
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            One live embed. Two satellite modes.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            This page mounts the generated browser bundle exactly the way a satellite site will.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section>
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">
                Standard mode
              </p>
              <h2 className="mt-2 text-2xl font-bold">Local-intent site example</h2>
              <p className="mt-2 text-sm text-slate-300">
                Use for Denver, Phoenix, Aurora, Mesa, Boulder, and other local-name domains.
              </p>
            </div>
            <div
              id="satellite-quoter-demo-standard"
              className="min-h-[720px] rounded-[2rem] bg-slate-100"
            />
          </section>

          <section>
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-300">
                ZIP-first mode
              </p>
              <h2 className="mt-2 text-2xl font-bold">National price site example</h2>
              <p className="mt-2 text-sm text-slate-300">
                Use for price and quote domains that attract traffic from across the U.S.
              </p>
            </div>
            <div
              id="satellite-quoter-demo-zip-first"
              className="min-h-[720px] rounded-[2rem] bg-slate-100"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
