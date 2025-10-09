import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, Clock, Star, Shield, Users } from "lucide-react";
import CTAButtons from "@/components/CTAButtons";
import QuoteForm from "@/components/QuoteForm";
import TrustSignals from "@/components/TrustSignals";

export default function Home() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "Pink Auto Glass",
    "image": "https://pinkautoglass.com/pink-logo-horizontal.png",
    "@id": "https://pinkautoglass.com",
    "url": "https://pinkautoglass.com",
    "telephone": "+17209187465",
    "priceRange": "$89-$500",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Denver",
      "addressRegion": "CO",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 39.7392,
      "longitude": -104.9903
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Denver"
      },
      {
        "@type": "City",
        "name": "Aurora"
      },
      {
        "@type": "City",
        "name": "Lakewood"
      },
      {
        "@type": "City",
        "name": "Highlands Ranch"
      },
      {
        "@type": "City",
        "name": "Boulder"
      }
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "07:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://www.facebook.com/pinkautoglass",
      "https://www.instagram.com/pinkautoglass"
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
            "name": "Windshield Repair",
            "description": "Professional windshield chip and crack repair"
          },
          "price": "89",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Windshield Replacement",
            "description": "Full windshield replacement with OEM quality glass"
          },
          "price": "299",
          "priceCurrency": "USD"
        }
      ]
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do you come to my location?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We're 100% mobile. We come to your home, office, or anywhere in the Denver metro area."
        }
      },
      {
        "@type": "Question",
        "name": "Does insurance cover windshield replacement?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most comprehensive insurance policies in Colorado cover windshield replacement with $0 deductible. We handle all insurance paperwork for you."
        }
      },
      {
        "@type": "Question",
        "name": "How long does windshield replacement take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most windshield repairs take under 30 minutes. Full replacements typically take 1-2 hours."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer same-day service?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We offer same-day mobile windshield service throughout the Denver metro area, 7 days a week."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Compact Hero Section - Lead Generation Focused */}
      <section className="bg-gradient-hero py-16 md:py-20 text-white page-top-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Colorado's #1
              <span className="block">Mobile Auto Glass</span>
              <span className="block">Repair & Replacement</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              We come to you! Professional windshield service at your home or office. 
              Quick repairs, quality replacements, unbeatable prices.
            </p>
            
            {/* Primary CTAs */}
            <div className="mb-8">
              <CTAButtons source="hero" />
            </div>
            
            {/* Quick Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Same Day Service
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Mobile Service
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Lifetime Warranty
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form & Trust Signals Section */}
      <section className="py-12 bg-white border-t-4 border-pink-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Quote Form */}
            <div>
              <QuoteForm />
            </div>

            {/* Trust Signals */}
            <div>
              <TrustSignals />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Colorado Chooses Pink Auto Glass</h2>
            <p className="text-xl text-gray-600">Over 5,000 satisfied customers trust us with their auto glass needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Mobile Convenience */}
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">We Come to You</h3>
              <p className="text-gray-600 mb-4">No need to drive with a damaged windshield. We provide mobile service at your home, office, or anywhere in Colorado.</p>
              <div className="text-sm text-pink-600 font-semibold">Available 7 Days a Week</div>
            </div>
            
            {/* Speed & Quality */}
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Fast & Professional</h3>
              <p className="text-gray-600 mb-4">Most repairs completed in under 30 minutes. Replacements done in 1-2 hours using OEM quality glass and professional techniques.</p>
              <div className="text-sm text-green-600 font-semibold">Same Day Service Available</div>
            </div>
            
            {/* Warranty & Trust */}
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lifetime Warranty</h3>
              <p className="text-gray-600 mb-4">We stand behind our work with a lifetime warranty on all installations. Licensed, insured, and trusted by 200+ 5-star reviews.</p>
              <div className="text-sm text-blue-600 font-semibold">Fully Licensed & Insured</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-pink-600 mb-2">5,000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">4.9★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">Same Day</div>
                <div className="text-sm text-gray-600">Service Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">Lifetime</div>
                <div className="text-sm text-gray-600">Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-pink-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Your Windshield Fixed?</h2>
          <p className="text-xl mb-8 text-pink-100">Join thousands of satisfied customers in Colorado</p>
          
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/book" className="bg-white text-pink-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all">
              📱 Book Online Now
            </Link>
            <a href="tel:+17209187465" className="bg-pink-800 hover:bg-pink-900 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all">
              📞 Call (720) 918-7465
            </a>
          </div>
          
          {/* Contact Info Grid */}
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
              <p className="text-lg">Statewide Colorado</p>
              <div className="text-sm mt-1">Mobile service available</div>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-pink-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-white">Quick Response</h3>
              <p className="text-lg">Same Day Service</p>
              <div className="text-sm mt-1">Emergency repairs available</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
