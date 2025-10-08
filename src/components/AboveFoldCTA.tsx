'use client';

import { Phone, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { trackCTAClick } from '@/lib/analytics';

interface AboveFoldCTAProps {
  location?: string; // For analytics tracking
}

export default function AboveFoldCTA({ location = 'above-fold' }: AboveFoldCTAProps) {
  return (
    <div className="my-8 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 rounded-xl p-6">
      <div className="grid md:grid-cols-3 gap-4">
        <a
          href="tel:+17209187465"
          onClick={() => trackCTAClick('call', location)}
          className="flex flex-col items-center justify-center bg-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl group"
        >
          <Phone className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg">Call Now</span>
          <span className="text-sm text-pink-100">(720) 918-7465</span>
        </a>

        <a
          href="sms:+17209187465"
          onClick={() => trackCTAClick('text', location)}
          className="flex flex-col items-center justify-center bg-gray-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl group"
        >
          <MessageSquare className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg">Text Us</span>
          <span className="text-sm text-gray-300">Quick Response</span>
        </a>

        <Link
          href="/book"
          onClick={() => trackCTAClick('book', location)}
          className="flex flex-col items-center justify-center bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl group"
        >
          <Calendar className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg">Book Online</span>
          <span className="text-sm text-blue-100">Same-Day Available</span>
        </Link>
      </div>
    </div>
  );
}
