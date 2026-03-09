/**
 * Curated Google Reviews for display on location pages.
 *
 * Replace these with REAL customer reviews from your Google Business Profile.
 * Keep reviews authentic — copy the exact text and name from Google.
 * Aim for 10-15 reviews total, tagged with the closest city for location-specific display.
 */

export interface GoogleReview {
  author: string;
  rating: number;
  date: string; // YYYY-MM-DD
  text: string;
  city?: string; // Tag with city for location-specific filtering
}

export const GOOGLE_REVIEW_URL = 'https://g.page/r/CZ2YTY_EELLQEAI/review';
export const GOOGLE_PROFILE_URL = 'https://g.page/r/CZ2YTY_EELLQEAI';

export const AGGREGATE_RATING = {
  value: 4.9,
  count: 200,
};

// Live reviews are synced from Google Places API via /api/admin/sync/gbp-reviews
// and stored in the google_reviews Supabase table.
// This local array is only used as a fallback before the first sync runs.
export const googleReviews: GoogleReview[] = [];

/** Minimum rating to display on the website. Anything below this is filtered out. */
const MIN_DISPLAY_RATING = 4;

/**
 * Get reviews for a specific city (falls back to all reviews if not enough city-specific ones).
 * Only returns reviews with rating >= MIN_DISPLAY_RATING (4+).
 */
export function getReviewsForCity(city: string, count: number = 3): GoogleReview[] {
  const goodReviews = googleReviews.filter(r => r.rating >= MIN_DISPLAY_RATING);
  const cityReviews = goodReviews.filter(r => r.city?.toLowerCase() === city.toLowerCase());

  if (cityReviews.length >= count) {
    return cityReviews.slice(0, count);
  }

  // Fill remaining slots with other good reviews
  const otherReviews = goodReviews.filter(r => r.city?.toLowerCase() !== city.toLowerCase());
  return [...cityReviews, ...otherReviews].slice(0, count);
}
