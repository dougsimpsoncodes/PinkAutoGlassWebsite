'use client';

import { Phone, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { trackPhoneClick, trackTextClick, trackBookingClick } from '@/lib/analytics';

interface CTAButtonsProps {
  source: string;
  layout?: 'horizontal' | 'vertical';
  showDiscount?: boolean;
}

export default function CTAButtons({
  source,
  layout = 'horizontal',
  showDiscount = true
}: CTAButtonsProps) {
  const phoneNumber = '7209187465';
  const displayPhone = '(720) 918-7465';

  const handlePhoneClick = () => {
    trackPhoneClick(source);
  };

  const handleTextClick = () => {
    trackTextClick(source);
  };

  const handleBookClick = () => {
    trackBookingClick(source);
  };

  const buttonClasses = layout === 'vertical' ? 'flex flex-col gap-3 items-center' : 'flex flex-col sm:flex-row gap-4 justify-center items-center';

  return (
    <div className={buttonClasses}>
      {/* Call Button */}
      <a
        href={`tel:+1${phoneNumber}`}
        onClick={handlePhoneClick}
        className="inline-flex items-center justify-center gap-2 bg-white text-pink-600 hover:bg-gray-50 font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all border-2 border-pink-600"
      >
        <Phone className="w-5 h-5" />
        Call Now
      </a>

      {/* Text Button */}
      <a
        href={`sms:+1${phoneNumber}`}
        onClick={handleTextClick}
        className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white hover:bg-pink-700 font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
      >
        <MessageSquare className="w-5 h-5" />
        Text Us
      </a>

      {/* Book Button */}
      <Link
        href="/book"
        onClick={handleBookClick}
        className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white hover:bg-pink-700 font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
      >
        📅 Book Online
      </Link>
    </div>
  );
}
