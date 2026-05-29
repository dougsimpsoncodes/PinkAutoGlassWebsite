import { Phone, MapPin, Clock, Star, Shield } from "lucide-react";
import AutomatedQuoteForm from "@/components/AutomatedQuoteForm";
import { combineSchemas } from "@/lib/schema";

/**
 * Homepage — Mockup B (locked 2026-05-28).
 *
 * Per project memory `project-pink-auto-glass-homepage-migration`:
 *   - Replaces the legacy QuickCaptureForm + QuoteForm hero with the
 *     auto-quoter (the same `<AutomatedQuoteForm>` shipped at /quote).
 *   - Phoenix is removed from `/` entirely (visible text + schema). AZ has
 *     its own /arizona pages and Phoenix Google Ads land there.
 *   - FAQ 1/2/3 rewritten to match current ops (no "same day", no "free ADAS").
 *   - `/quote` 301-redirects to `/` (configured in next.config.js).
 */
export default function Home() {
  const schemaData = {
    "@type": "AutoRepair",
    "name": "Pink Auto Glass",
    "image": "https://pinkautoglass.com/pink-logo-horizontal-1200x300.webp",
    "@id": "https://pinkautoglass.com",
    "url": "https://pinkautoglass.com",
    "telephone": "+17209187465",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Denver",
      "addressRegion": "CO",
      "postalCode": "80202",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 39.7392,
      "longitude": -104.9903
    },
    // CO Front Range only — AZ has its own /arizona pages
    "areaServed": [
      { "@type": "State", "name": "Colorado" },
      { "@type": "City", "name": "Denver" },
      { "@type": "City", "name": "Aurora" },
      { "@type": "City", "name": "Lakewood" },
      { "@type": "City", "name": "Boulder" },
      { "@type": "City", "name": "Colorado Springs" },
      { "@type": "City", "name": "Fort Collins" },
      { "@type": "City", "name": "Highlands Ranch" },
      { "@type": "City", "name": "Thornton" },
      { "@type": "City", "name": "Arvada" },
      { "@type": "City", "name": "Westminster" },
      { "@type": "City", "name": "Centennial" }
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "07:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://www.facebook.com/PinkAutoGlassDenver",
      "https://www.instagram.com/pinkautoglassdenver",
      "https://www.linkedin.com/company/pink-auto-glass"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Auto Glass Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Windshield Replacement",
            "description": "Full windshield replacement with OEM quality glass, mobile service across the Front Range."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Windshield Repair",
            "description": "Professional windshield chip and crack repair."
          }
        }
      ]
    }
  };

  const faqSchema = {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I get a quote?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Type in your VIN or plate, your ZIP, and a few details about your vehicle. You'll see your real installed price in seconds — no phone call required. Then pick a time and we come to you."
        }
      },
      {
        "@type": "Question",
        "name": "Is ADAS calibration required after windshield replacement?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, for most 2018+ vehicles with lane-keeping, automatic emergency braking, adaptive cruise, or forward-collision systems. When your vehicle needs it, calibration is performed in-house, on-site, by our techs — no sublet, no dealer pass-through. Your instant quote includes any calibration required for your vehicle."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer mobile windshield replacement in Denver?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — mobile service is what we do. We come to your home, office, or anywhere in the Denver metro area at no extra charge. ADAS calibration is performed on-site by our techs."
        }
      },
      {
        "@type": "Question",
        "name": "How long does windshield replacement take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Chip repairs: 20-30 minutes. Standard replacement: 60-90 minutes. Replacement plus ADAS calibration: 90-150 minutes. After installation we recommend waiting 1-2 hours before driving to allow the adhesive to cure."
        }
      },
      {
        "@type": "Question",
        "name": "Will filing a windshield claim raise my insurance rates?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, windshield claims typically don't raise your insurance rates in Colorado. Glass claims are comprehensive (not at-fault) claims, treated differently than collision claims, and most insurers don't count glass-only claims against you."
        }
      }
    ]
  };

  const combinedSchema = combineSchemas(schemaData, faqSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      {/* ===== Hero — Mockup B (white, tool-forward) ===== */}
      <section id="quote-tool" className="page-top-padding bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-bold leading-tight mb-5 md:mb-7 text-slate-900 text-2xl md:text-5xl">
              <span className="block whitespace-nowrap">
                Get an <span className="text-pink-600">INSTANT QUOTE</span>
              </span>
              <span className="block">and book your install</span>
            </h1>

            {/* Trust line (replaces previous value-prop pills) */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-7 text-sm md:text-base text-slate-600">
              <span>✓ Lifetime warranty</span>
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <strong className="text-slate-900">4.9 on Google</strong>
              </span>
              <span>✓ 5,000+ installed</span>
            </div>

            {/* The actual auto-quoter — same component shipped at /quote */}
            <div className="text-left">
              <AutomatedQuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Why Colorado Chooses Pink (sanitized — no "Same Day") ===== */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Colorado Chooses Pink Auto Glass</h2>
            <p className="text-xl text-gray-600">Over 5,000 satisfied customers trust us with their auto glass needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">We Come to You</h3>
              <p className="text-gray-600 mb-4">No need to drive with a damaged windshield. We provide mobile service at your home, office, or anywhere in Colorado.</p>
              <div className="text-sm text-pink-600 font-semibold">Available 7 Days a Week</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Fast &amp; Professional</h3>
              <p className="text-gray-600 mb-4">Most installs done in 60-90 minutes using OEM quality glass and professional techniques.</p>
              <div className="text-sm text-green-600 font-semibold">Most installs done in 60-90 min</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lifetime Warranty</h3>
              <p className="text-gray-600 mb-4">We stand behind our work with a lifetime warranty on all installations. Licensed, insured, trusted by 200+ 5-star reviews.</p>
              <div className="text-sm text-blue-600 font-semibold">Fully Licensed &amp; Insured</div>
            </div>
          </div>

          {/* Stats row — "Same Day" replaced with 4.9★ on Google */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-pink-600 mb-2">5,000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-500 mb-2">4.9★</div>
                <div className="text-sm text-gray-600">on Google (200+ reviews)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">Lifetime</div>
                <div className="text-sm text-gray-600">Warranty on every install</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ — questions 1/2/3 rewritten ===== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Answers About Auto Glass Service</h2>

            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-bold mb-4">How do I get a quote?</h3>
                <p className="text-lg text-gray-700">Type in your VIN or plate, your ZIP, and a few details about your vehicle. You'll see your real installed price in seconds — no phone call required. Then pick a time and we come to you.</p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-bold mb-4">Is ADAS calibration required after windshield replacement?</h3>
                <p className="text-lg text-gray-700 mb-3">Yes, for most 2018+ vehicles with lane-keeping, automatic emergency braking, adaptive cruise, or forward-collision systems.</p>
                <p className="text-gray-700"><strong>When your vehicle needs it, calibration is performed in-house, on-site, by our techs — no sublet, no dealer pass-through.</strong> Your instant quote includes any calibration required for your vehicle.</p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-bold mb-4">Do you offer mobile windshield replacement in Denver?</h3>
                <p className="text-lg text-gray-700">Yes — mobile service is what we do. We come to your home, office, or anywhere in the Denver metro area at no extra charge. ADAS calibration is performed on-site by our techs.</p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-bold mb-4">How long does windshield replacement take?</h3>
                <div className="text-lg text-gray-700">
                  <table className="w-full border-collapse mb-3">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Service Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Time Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Windshield chip repair</td>
                        <td className="border border-gray-300 px-4 py-2">20-30 minutes</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Standard windshield replacement</td>
                        <td className="border border-gray-300 px-4 py-2">60-90 minutes</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Replacement + ADAS calibration</td>
                        <td className="border border-gray-300 px-4 py-2">90-150 minutes</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-gray-700">After installation, we recommend waiting 1-2 hours before driving to allow the adhesive to cure properly.</p>
                </div>
              </div>

              <div className="pb-6">
                <h3 className="text-2xl font-bold mb-4">Will filing a windshield claim raise my insurance rates?</h3>
                <p className="text-lg text-gray-700 mb-3">No, windshield claims typically don't raise your insurance rates in Colorado. Here's why:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Glass claims are comprehensive (not at-fault) claims</li>
                  <li>They're treated differently than collision claims</li>
                  <li>Most insurers don't count glass-only claims against you</li>
                  <li>Colorado has favorable glass coverage laws</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA (sanitized — no Phoenix, no "Same Day") ===== */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-pink-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Your Windshield Fixed?</h2>
          <p className="text-xl mb-8 text-pink-100">Join thousands of satisfied customers in Colorado</p>

          {/* Primary Actions — "Book Online" now anchors back to the quote tool at the top of /, not /book */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#quote-tool" className="bg-white text-pink-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all">
              📱 Book Online Now
            </a>
            <a href="tel:+17209187465" className="bg-pink-800 hover:bg-pink-900 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all">
              📞 Call (720) 918-7465
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-pink-100">
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-pink-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-white">Call or Text</h3>
              <a href="tel:+17209187465" className="text-pink-200 hover:text-white transition-colors text-lg">
                (720) 918-7465
              </a>
              <div className="text-sm mt-1">Available 7 days a week</div>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-pink-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-white">Service Area</h3>
              <p className="text-lg">Front Range Colorado</p>
              <div className="text-sm mt-1">Mobile service across the metro</div>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-pink-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Phone Calls</h3>
              <p className="text-lg">Book online in under a minute</p>
              <div className="text-sm mt-1">Real price, real schedule, online</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
