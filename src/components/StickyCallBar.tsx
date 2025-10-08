'use client';

import { Phone, MessageSquare, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackPhoneClick, trackTextClick } from '@/lib/analytics';

export default function StickyCallBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const phoneNumber = '7209187465';
  const displayPhone = '(720) 918-7465';

  // Check if sticky bar is enabled via environment variable
  const isEnabled = process.env.NEXT_PUBLIC_STICKY_CALLBAR === '1';

  useEffect(() => {
    if (!isEnabled || isDismissed) return;

    // Show after scrolling down 300px
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isEnabled, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handlePhoneClick = () => {
    trackPhoneClick('sticky_call_bar');
  };

  const handleTextClick = () => {
    trackTextClick('sticky_call_bar');
  };

  if (!isEnabled || !isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-2xl">
        <div className="relative px-4 py-3">
          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between gap-3 pr-8">
            {/* Call Button */}
            <a
              href={`tel:+1${phoneNumber}`}
              onClick={handlePhoneClick}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-pink-600 font-bold py-3 px-4 rounded-lg shadow-lg active:scale-95 transition-transform"
            >
              <Phone className="w-5 h-5" />
              <span className="text-sm">Call Now</span>
            </a>

            {/* Text Button */}
            <a
              href={`sms:+1${phoneNumber}`}
              onClick={handleTextClick}
              className="flex-1 flex items-center justify-center gap-2 bg-pink-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg active:scale-95 transition-transform"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Text Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add to globals.css:
// @keyframes slide-up {
//   from {
//     transform: translateY(100%);
//   }
//   to {
//     transform: translateY(0);
//   }
// }
// .animate-slide-up {
//   animation: slide-up 0.3s ease-out;
// }
