'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('exit_popup_shown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from the top of the viewport
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exit_popup_shown', 'true');
      }
    };

    // Add delay before enabling exit intent
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000); // Wait 3 seconds before activating

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-slideUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="inline-block p-4 bg-pink-100 rounded-full mb-4">
            <Gift className="w-12 h-12 text-pink-600" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold mb-3">Wait! Special Offer</h2>
          <p className="text-xl text-gray-600 mb-6">
            Before you go, get your FREE windshield inspection
          </p>

          {/* Offer Details */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-pink-600 mb-2">FREE Benefits:</h3>
            <ul className="space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">✓</span>
                <span>Free damage assessment and quote</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">✓</span>
                <span>Free insurance verification (most pay $0)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">✓</span>
                <span>Same-day mobile service available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">✓</span>
                <span>No obligation - just expert advice</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <a
              href="tel:+17209187465"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 w-full bg-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-pink-700 transition-all shadow-lg"
            >
              <Phone className="w-5 h-5" />
              Call Now for FREE Quote
            </a>
            <Link
              href="/book"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 w-full bg-white text-pink-600 font-bold py-4 px-6 rounded-lg hover:bg-gray-50 transition-all border-2 border-pink-600"
            >
              <Calendar className="w-5 h-5" />
              Book Online - 60 Seconds
            </Link>
          </div>

          {/* Trust Element */}
          <p className="text-sm text-gray-500 mt-4">
            Join 5,000+ satisfied customers. Rated 4.9 stars with 200+ reviews.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
