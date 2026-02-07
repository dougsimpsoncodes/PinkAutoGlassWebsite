export interface Neighborhood {
  slug: string;
  name: string;
  citySlug: string;       // e.g. "denver"
  cityName: string;       // e.g. "Denver"
  zipCode: string;        // Primary ZIP for schema markup
  coords: [number, number]; // [lat, lng] for map embed
  tagline: string;        // Hero subtitle
  intro: string;          // 2-3 sentence intro paragraph
  highlights: string[];   // What makes this neighborhood iconic (3-5)
  hazards: string[];      // Driving/windshield hazards relevant to auto glass (3-4)
  mobileNote: string;     // Why mobile service works here
  landmarks: string[];    // Local references people use (3-5)
  faqs: { q: string; a: string }[];  // 3 neighborhood-specific FAQs
}
