'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface GoogleReviewButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
  source?: string;
}

export default function GoogleReviewButton({
  variant = 'primary',
  className = '',
  source = 'website'
}: GoogleReviewButtonProps) {
  // Pink Auto Glass Google Business Profile review link
  const GOOGLE_REVIEW_URL = 'https://g.page/r/CZ2YTY_EELLQEAI/review';

  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    // Track the click for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'review_click', {
        event_category: 'engagement',
        event_label: source,
      });
    }
  };

  if (variant === 'minimal') {
    return (
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition-colors ${className}`}
      >
        <Star className="w-5 h-5" />
        Leave a Google Review
      </a>
    );
  }

  if (variant === 'secondary') {
    return (
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-pink-600 text-pink-600 hover:bg-pink-50 font-semibold rounded-lg transition-all ${className}`}
      >
        <Star className="w-5 h-5" />
        {clicked ? 'Thanks for reviewing!' : 'Leave a Review on Google'}
      </a>
    );
  }

  // Primary variant (default)
  return (
    <a
      href={GOOGLE_REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${className}`}
    >
      <Star className="w-6 h-6 fill-current" />
      {clicked ? 'Thanks! Opening Google...' : 'Leave Us a 5-Star Review'}
    </a>
  );
}
