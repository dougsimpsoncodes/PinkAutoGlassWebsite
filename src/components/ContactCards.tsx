'use client';

import { Phone, MessageSquare, Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { trackPhoneClick, trackTextClick } from '@/lib/tracking';
import { resolveMarket, getPhoneForMarket } from '@/lib/market';

export default function ContactCards() {
  const pathname = usePathname();
  const market = resolveMarket(pathname);
  const { phoneE164, displayPhone } = getPhoneForMarket(market);

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-16">
      {/* Call Us */}
      <a
        href={`tel:${phoneE164}`}
        onClick={() => trackPhoneClick('contact-card-call', 'Call Us', phoneE164)}
        className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-transparent hover:border-pink-200"
      >
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Us</h2>
        <p className="text-gray-600 mb-3">Speak with our team now</p>
        <p className="text-3xl font-bold text-pink-600">{displayPhone}</p>
        <p className="text-sm text-gray-500 mt-2">Monday - Saturday, 7am - 7pm</p>
      </a>

      {/* Text Us */}
      <a
        href={`sms:${phoneE164}`}
        onClick={() => trackTextClick('contact-card-text')}
        className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Text Us</h2>
        <p className="text-gray-600 mb-3">Quick questions? Send a text</p>
        <p className="text-3xl font-bold text-blue-600">{displayPhone}</p>
        <p className="text-sm text-gray-500 mt-2">Fast response times</p>
      </a>

      {/* Email Us */}
      <a
        href="mailto:service@pinkautoglass.com"
        className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200"
      >
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Us</h2>
        <p className="text-gray-600 mb-3">Detailed inquiries welcome</p>
        <p className="text-lg font-semibold text-purple-600 break-all">service@pinkautoglass.com</p>
        <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
      </a>
    </div>
  );
}
