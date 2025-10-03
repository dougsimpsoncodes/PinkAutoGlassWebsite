'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TrackContent() {
  const searchParams = useSearchParams();
  const referenceNumber = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-gradient-light">
      <div className="container-padding section-padding">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-brand p-8 text-center">
            <h1 className="text-3xl font-display font-bold text-brand-navy mb-4">
              Track Your Request
            </h1>
            
            {referenceNumber ? (
              <div className="space-y-6">
                <div className="bg-gradient-light rounded-lg p-6">
                  <h2 className="text-sm font-medium text-brand-navy mb-2">
                    Reference Number
                  </h2>
                  <p className="text-2xl font-bold text-brand-pink font-mono">
                    {referenceNumber}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Request Status: Pending
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Your request has been received and is being processed. 
                    We'll call you within 15 minutes to confirm your appointment.
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Request tracking functionality will be fully 
                    implemented with the Supabase integration.
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Questions? Call us:</p>
                  <a
                    href="tel:+17209187465"
                    className="text-lg font-semibold text-brand-pink hover:text-brand-navy transition-colors duration-200"
                  >
                    (720) 918-7465
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600">
                  Please provide a reference number to track your request.
                </p>
                <Link href="/book" className="btn-primary">
                  Make a New Request
                </Link>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t">
              <Link href="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}