import { Star } from 'lucide-react';
import { GoogleReview, GOOGLE_PROFILE_URL, AGGREGATE_RATING, getReviewsForCity } from '@/data/reviews';

interface GoogleReviewsWidgetProps {
  city: string;
  count?: number;
  className?: string;
}

export default function GoogleReviewsWidget({ city, count = 3, className = '' }: GoogleReviewsWidgetProps) {
  const reviews = getReviewsForCity(city, count);

  return (
    <div className={className}>
      {/* Header with Google branding */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <div>
            <div className="font-bold text-gray-900 text-sm">Google Reviews</div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-gray-900">{AGGREGATE_RATING.value}</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs text-gray-500">({AGGREGATE_RATING.count})</span>
            </div>
          </div>
        </div>
        <a
          href={GOOGLE_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          See all
        </a>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {reviews.map((review, idx) => (
          <ReviewCard key={idx} review={review} />
        ))}
      </div>

      {/* Write a review CTA */}
      <a
        href={GOOGLE_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Write a review on Google
      </a>
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const timeAgo = getTimeAgo(review.date);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-sm">
            {review.author.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900 text-sm">{review.author}</div>
            <div className="text-xs text-gray-500">{timeAgo}</div>
          </div>
        </div>
        <div className="flex text-yellow-400">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
