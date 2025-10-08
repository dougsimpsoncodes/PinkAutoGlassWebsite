'use client';

import { useState, useEffect } from 'react';
import { Phone, X } from 'lucide-react';
import { trackCTAClick } from '@/lib/analytics';

interface StickyCallbackBarProps {
  source?: string;
}

export default function StickyCallbackBar({ source = 'sticky-callback' }: StickyCallbackBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed
    const dismissed = sessionStorage.getItem('callbackBarDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after 3 seconds of page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCall = () => {
    trackCTAClick('call', source);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('callbackBarDismissed', 'true');
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Mobile Only - Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex-1">
              <div className="font-bold text-sm mb-1">
                🚗 Need Auto Glass Service?
              </div>
              <div className="text-xs text-pink-100">
                Request callback in 5 minutes
              </div>
            </div>
            <a
              href="tel:+17209187465"
              onClick={handleCall}
              className="flex items-center gap-2 bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition-colors mr-2"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">Call Now</span>
            </a>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Dismiss callback bar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add padding to bottom of page on mobile to prevent content overlap */}
      <style jsx>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 70px;
          }
        }
      `}</style>
    </>
  );
}
