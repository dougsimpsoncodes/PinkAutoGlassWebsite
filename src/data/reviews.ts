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

/**
 * TODO: Replace with real Google reviews.
 * Copy exact text from your Google Business Profile.
 */
export const googleReviews: GoogleReview[] = [
  {
    author: 'Sarah M.',
    rating: 5,
    date: '2026-01-15',
    text: 'They came to my office downtown and replaced my windshield while I worked. Professional, fast, and the quality is perfect. Highly recommend!',
    city: 'Denver',
  },
  {
    author: 'Mike D.',
    rating: 5,
    date: '2026-01-08',
    text: 'Got hit by a rock on I-25 during my commute. Pink Auto Glass came to my apartment the same day and had me fixed up in an hour. Great service!',
    city: 'Denver',
  },
  {
    author: 'Jessica R.',
    rating: 5,
    date: '2025-12-20',
    text: 'After the last hailstorm, they handled everything with my insurance. Zero stress, zero deductible, and my windshield looks brand new.',
    city: 'Denver',
  },
  {
    author: 'Carlos T.',
    rating: 5,
    date: '2025-12-15',
    text: 'Best price I found in the Aurora area. They came to my house and replaced the windshield on my Honda CR-V. Took about an hour. Very professional.',
    city: 'Aurora',
  },
  {
    author: 'Lisa W.',
    rating: 5,
    date: '2025-12-10',
    text: 'Called in the morning, they were at my house in Lakewood by lunch. Great communication and quality work. Will use again.',
    city: 'Lakewood',
  },
  {
    author: 'James K.',
    rating: 5,
    date: '2025-11-28',
    text: 'Needed an emergency windshield replacement on my way to the mountains. They came to my hotel parking lot in Golden and had it done in under 2 hours. Lifesaver!',
    city: 'Golden',
  },
  {
    author: 'Amanda P.',
    rating: 5,
    date: '2025-11-15',
    text: 'I love that a portion goes to breast cancer awareness. Great cause and great service. My Subaru Outback windshield looks perfect.',
    city: 'Boulder',
  },
  {
    author: 'David H.',
    rating: 5,
    date: '2025-11-01',
    text: 'Fast, affordable, and they handled my ADAS calibration too. Most shops I called didn\'t even know what that was. These guys are legit.',
    city: 'Colorado Springs',
  },
  {
    author: 'Rachel B.',
    rating: 5,
    date: '2025-10-20',
    text: 'Dan was super helpful on the phone and the tech who came out was professional and fast. Insurance covered everything. Easy experience.',
    city: 'Thornton',
  },
  {
    author: 'Kevin S.',
    rating: 5,
    date: '2025-10-05',
    text: 'Third time using Pink Auto Glass. Consistent quality every time. They remember me and always fit me in same day. Can\'t beat that.',
    city: 'Highlands Ranch',
  },
];

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
