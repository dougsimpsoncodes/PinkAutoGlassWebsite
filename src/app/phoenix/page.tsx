import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, Clock, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import PhoenixClickTracker from "@/components/PhoenixClickTracker";

export const metadata: Metadata = {
  title: "Phoenix Windshield Replacement | $0 Out of Pocket",
  description:
    "AZ law means $0 deductible for windshield replacement. Pink Auto Glass serves all Phoenix metro. Same-day mobile service. (480) 712-7465.",
  keywords: [
    "windshield replacement phoenix az",
    "auto glass phoenix arizona",
    "windshield repair phoenix",
    "mobile windshield replacement phoenix",
    "zero deductible windshield arizona",
    "insurance windshield replacement phoenix",
    "same day windshield phoenix",
  ],
  openGraph: {
    title: "Phoenix Windshield Replacement | $0 Out of Pocket",
    description:
      "AZ law means $0 deductible for windshield replacement. Pink Auto Glass serves all Phoenix metro. Same-day mobile service. (480) 712-7465.",
    url: "https://pinkautoglass.com/phoenix",
    siteName: "Pink Auto Glass",
    type: "website",
  },
};

const phoenixCities = [
  { name: "Phoenix", slug: "phoenix-az" },
  { name: "Scottsdale", slug: "scottsdale-az" },
  { name: "Tempe", slug: "tempe-az" },
  { name: "Mesa", slug: "mesa-az" },
  { name: "Chandler", slug: "chandler-az" },
  { name: "Gilbert", slug: "gilbert-az" },
  { name: "Glendale", slug: "glendale-az" },
  { name: "Peoria", slug: "peoria-az" },
  { name: "Surprise", slug: "surprise-az" },
  { name: "Goodyear", slug: "goodyear-az" },
  { name: "Avondale", slug: "avondale-az" },
  { name: "Buckeye", slug: "buckeye-az" },
  { name: "Fountain Hills", slug: "fountain-hills-az" },
  { name: "Queen Creek", slug: "queen-creek-az" },
  { name: "Apache Junction", slug: "apache-junction-az" },
  { name: "Cave Creek", slug: "cave-creek-az" },
  { name: "Maricopa", slug: "maricopa-az" },
  { name: "El Mirage", slug: "el-mirage-az" },
  { name: "Litchfield Park", slug: "litchfield-park-az" },
  { name: "Ahwatukee", slug: "ahwatukee-az" },
];

export default function PhoenixPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoRepair",
        name: "Pink Auto Glass",
        url: "https://pinkautoglass.com",
        telephone: "+14807127465",
        image: "https://pinkautoglass.com/pink-logo-horizontal-1200x300.webp",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Phoenix",
          addressRegion: "AZ",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 33.4484,
          longitude: -112.074,
        },
        areaServed: [
          { "@type": "City", name: "Phoenix" },
          { "@type": "City", name: "Scottsdale" },
          { "@type": "City", name: "Tempe" },
          { "@type": "City", name: "Mesa" },
          { "@type": "City", name: "Chandler" },
          { "@type": "City", name: "Gilbert" },
          { "@type": "City", name: "Glendale" },
          { "@type": "City", name: "Peoria" },
          { "@type": "City", name: "Surprise" },
          { "@type": "City", name: "Goodyear" },
        ],
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "07:00",
          closes: "19:00",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "200",
        },
        priceRange: "$$",
        paymentAccepted: ["Cash", "Credit Card", "Insurance"],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does Arizona law really require $0 deductible windshield replacement?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Arizona Revised Statutes § 20-264 requires insurers offering comprehensive coverage to include full glass coverage with no deductible. If you have comprehensive coverage, your windshield replacement costs you nothing — the insurer pays 100%.",
            },
          },
          {
            "@type": "Question",
            name: "Will filing a windshield claim raise my insurance rates in Arizona?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. ARS § 20-263 prohibits insurers from raising your rates or canceling your policy solely because you filed a comprehensive glass claim. Arizona treats glass claims as no-fault events.",
            },
          },
          {
            "@type": "Question",
            name: "Can my insurance company require me to use Safelite?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. ARS § 20-469 gives you the legal right to choose any licensed auto glass shop. Insurers cannot steer you to their preferred vendor. If your insurer pressures you to use a specific shop, that may violate Arizona law.",
            },
          },
          {
            "@type": "Question",
            name: "Do you offer mobile windshield replacement in Phoenix?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes — mobile service is our specialty. We come to your home, office, or any location across the Phoenix metro area. Same-day appointments available, 7 days a week.",
            },
          },
          {
            "@type": "Question",
            name: "Why does Phoenix have so many windshield cracks?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Phoenix's extreme heat (115°F+) causes glass to expand and contract rapidly, turning small chips into full cracks overnight. Monsoon season brings flying debris and hail. I-10 and US-60 truck traffic kicks up heavy gravel. Caliche dust from unpaved roads in newer developments adds additional abrasion.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Hero */}
      <div className="page-top-padding">
        <section className="bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800 py-12 md:py-24 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-semibold mb-6">
                <MapPin className="w-4 h-4" />
                Now Serving Phoenix Metro
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Phoenix Windshield Replacement
                <span className="block text-yellow-300 mt-2">$0 Out of Pocket</span>
              </h1>

              <p className="text-xl md:text-2xl mb-4 text-white/90 max-w-2xl mx-auto">
                Arizona law requires your insurer to cover it. We handle everything.
              </p>
              <p className="text-lg mb-10 text-pink-200 max-w-xl mx-auto">
                Mobile service across all 20 Phoenix metro cities — we come to your home or office,
                7 days a week.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link
                  href="/book?utm_source=phoenix-landing&utm_medium=cta&utm_campaign=phoenix"
                  className="bg-white text-pink-600 hover:bg-yellow-50 font-bold py-4 px-10 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Book Online Now — Free
                </Link>
                <a
                  href="tel:+14807127465"
                  className="bg-pink-800 hover:bg-pink-900 border-2 border-white/30 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  📞 Call Now
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  $0 Deductible — Arizona Law
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  No Rate Increase
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  You Choose the Shop
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  Same-Day Mobile Service
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Arizona Law — The Big Differentiator */}
      <section className="py-16 bg-white border-t-4 border-pink-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Arizona Law Protects You — 3 Things You Need to Know
              </h2>
              <p className="text-xl text-gray-600">
                You&apos;ve been paying for this coverage. Here&apos;s what the law guarantees you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Law 1 */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    ARS
                  </div>
                  <div>
                    <div className="text-xs text-green-700 font-semibold uppercase tracking-wide">
                      ARS § 20-264
                    </div>
                    <div className="font-bold text-gray-900">Zero Deductible</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  If you have comprehensive auto insurance in Arizona, your insurer{" "}
                  <strong>must</strong> replace your windshield with <strong>zero deductible</strong>
                  . You pay nothing. The law is clear.
                </p>
              </div>

              {/* Law 2 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    ARS
                  </div>
                  <div>
                    <div className="text-xs text-blue-700 font-semibold uppercase tracking-wide">
                      ARS § 20-263
                    </div>
                    <div className="font-bold text-gray-900">No Rate Increase</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Arizona prohibits insurers from raising your premium or canceling your policy
                  because you filed a comprehensive glass claim.{" "}
                  <strong>Using this benefit cannot hurt you.</strong>
                </p>
              </div>

              {/* Law 3 */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    ARS
                  </div>
                  <div>
                    <div className="text-xs text-purple-700 font-semibold uppercase tracking-wide">
                      ARS § 20-469
                    </div>
                    <div className="font-bold text-gray-900">You Choose the Shop</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Your insurer <strong>cannot</strong> force you to use their preferred shop
                  (Safelite, etc.). Arizona gives you the legal right to choose any licensed
                  auto glass provider — including us.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded-xl p-6 text-center">
              <p className="text-lg font-semibold text-yellow-800">
                Bottom line: You&apos;ve been paying for this coverage. Arizona law protects you.
                You pick the shop. We do the rest. <strong>You pay nothing.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Pink Auto Glass */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Phoenix Chooses Pink Auto Glass</h2>
            <p className="text-xl text-gray-600">
              Professional mobile service across all of Maricopa County
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">We Come to You</h3>
              <p className="text-gray-600 mb-4">
                No need to drive with a cracked windshield through Phoenix traffic. We come to your
                home, office, or any location in the Valley.
              </p>
              <div className="text-sm text-pink-600 font-semibold">Available 7 Days a Week</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Fast & Professional</h3>
              <p className="text-gray-600 mb-4">
                Most chip repairs take under 30 minutes. Replacements done in 1–2 hours using OEM
                quality glass. We handle all insurer paperwork.
              </p>
              <div className="text-sm text-green-600 font-semibold">Same-Day Service Available</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lifetime Warranty</h3>
              <p className="text-gray-600 mb-4">
                Every installation is backed by a lifetime warranty. Licensed, insured, and trusted
                by 200+ five-star reviews across Colorado and Arizona.
              </p>
              <div className="text-sm text-blue-600 font-semibold">Fully Licensed & Insured</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-pink-600 mb-2">$0</div>
                <div className="text-sm text-gray-600">Your Cost (with insurance)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">Same Day</div>
                <div className="text-sm text-gray-600">Service Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">20</div>
                <div className="text-sm text-gray-600">Phoenix Metro Cities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">Lifetime</div>
                <div className="text-sm text-gray-600">Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phoenix-Specific Damage Factors */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Phoenix Windshields Crack Faster Than Anywhere Else
              </h2>
              <p className="text-xl text-gray-600">
                The Valley has unique conditions that accelerate windshield damage
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Extreme Heat (115°F+)</h3>
                  <p className="text-gray-700 text-sm">
                    A small chip can become a full crack overnight as Phoenix temperatures swing 40°F between day and night.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <AlertTriangle className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Monsoon Season Debris</h3>
                  <p className="text-gray-700 text-sm">
                    July–September monsoons bring hail, flying debris, and haboobs that hit windshields at highway speeds.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <AlertTriangle className="w-8 h-8 text-gray-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">I-10 & US-60 Truck Traffic</h3>
                  <p className="text-gray-700 text-sm">
                    Heavy semis on I-10, US-60, and I-17 constantly kick up gravel — the leading cause of windshield chips in Maricopa County.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Caliche Roads & Construction</h3>
                  <p className="text-gray-700 text-sm">
                    Rapid growth in Buckeye, Queen Creek, and Gilbert means miles of unpaved caliche roads and construction debris across the Valley.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-6">
                Don&apos;t wait — Phoenix heat turns chips into cracks overnight. A chip repair costs
                nothing with insurance. A full crack means replacement.
              </p>
              <a
                href="tel:+14807127465"
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now — Same-Day Service
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works — Zero Hassle, $0 Out of Pocket
            </h2>

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Call or Book Online",
                  desc: 'Call (480) 712-7465 or click "Book Online Now." Tell us your vehicle year, make, and model.',
                },
                {
                  step: "2",
                  title: "We Verify Your Insurance",
                  desc: "We call your insurance company, confirm your zero-deductible coverage under ARS § 20-264, and schedule your appointment.",
                },
                {
                  step: "3",
                  title: "We Come to You",
                  desc: "Our technician arrives at your home, office, or anywhere in Phoenix metro — same day if you call before noon.",
                },
                {
                  step: "4",
                  title: "Professional Installation",
                  desc: "OEM quality glass installed in 1–2 hours. ADAS calibration included if your vehicle requires it. Lifetime warranty on all work.",
                },
                {
                  step: "5",
                  title: "You Pay Nothing",
                  desc: "We bill your insurance directly. You sign off on the completed work. Zero out-of-pocket. Done.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 bg-white p-6 rounded-xl shadow">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Phoenix Metro City Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Serving All Phoenix Metro Cities</h2>
            <p className="text-xl text-gray-600">
              Mobile windshield service throughout Maricopa County
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {phoenixCities.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/${city.slug}`}
                className="text-center p-3 bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-300 rounded-lg text-sm font-medium text-gray-700 hover:text-pink-700 transition-all"
              >
                {city.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            Don&apos;t see your city?{" "}
            <a href="tel:+14807127465" className="text-pink-600 hover:underline font-medium">
              Call (480) 712-7465
            </a>{" "}
            — we likely serve your area.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Arizona Windshield Insurance — Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-bold mb-3">
                  Does Arizona law really require $0 deductible windshield replacement?
                </h3>
                <p className="text-gray-700">
                  Yes. Arizona Revised Statutes § 20-264 requires every insurer offering
                  comprehensive auto coverage in Arizona to include full glass coverage with
                  <strong> no deductible applied</strong>. If you have comprehensive coverage,
                  your windshield replacement costs you exactly $0 — the insurer pays 100%.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-bold mb-3">
                  Will filing a claim raise my insurance rates?
                </h3>
                <p className="text-gray-700">
                  No. ARS § 20-263 prohibits insurers from raising your premium or canceling your
                  policy solely because you filed a comprehensive glass claim. Glass claims are
                  treated as no-fault events — using this benefit <strong>cannot hurt you</strong>.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-bold mb-3">
                  Can my insurance make me use Safelite?
                </h3>
                <p className="text-gray-700">
                  No. ARS § 20-469 gives you the legal right to choose any licensed auto glass
                  shop. Insurers cannot require you to use their preferred vendor. If your claims
                  adjuster pushes you toward Safelite or another specific shop, politely remind them
                  of ARS § 20-469 — or just call us and we&apos;ll handle it.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-bold mb-3">
                  What insurance companies do you work with in Arizona?
                </h3>
                <p className="text-gray-700">
                  We work with all major insurers serving Arizona, including State Farm, GEICO,
                  Progressive, Allstate, Farmers, USAA, Liberty Mutual, Nationwide, and more.
                  We handle all the paperwork and insurer communication directly.
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-xl font-bold mb-3">
                  Do you do ADAS calibration in Phoenix?
                </h3>
                <p className="text-gray-700">
                  Yes. If your vehicle has Advanced Driver Assistance Systems (lane departure
                  warning, automatic emergency braking, adaptive cruise control — typically
                  2018+ models), we perform ADAS calibration on-site after windshield installation.
                  <strong> ADAS calibration is included</strong> when required for your vehicle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Your Phoenix Windshield Fixed?
          </h2>
          <p className="text-xl mb-2 text-pink-100">
            Arizona law makes it free. We make it easy.
          </p>
          <p className="text-lg mb-10 text-pink-200">
            Same-day mobile service across Phoenix metro — we come to you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/book?utm_source=phoenix-landing&utm_medium=cta&utm_campaign=phoenix-bottom"
              className="bg-white text-pink-600 hover:bg-yellow-50 font-bold py-4 px-10 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
            >
              📱 Book Online Now — It&apos;s Free
            </Link>
            <a
              href="tel:+14807127465"
              className="bg-pink-800 hover:bg-pink-900 border-2 border-white/30 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
            >
              📞 Call Now
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-pink-100">
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-pink-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-white">Call or Text</h3>
              <a href="tel:+14807127465" className="text-pink-200 hover:text-white transition-colors text-lg">
                (480) 712-7465
              </a>
              <div className="text-sm mt-1">Available 7 days a week</div>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-pink-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-white">Service Area</h3>
              <p className="text-lg">All Phoenix Metro</p>
              <div className="text-sm mt-1">20+ cities in Maricopa County</div>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-pink-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-white">Hours</h3>
              <p className="text-lg">7 Days a Week</p>
              <div className="text-sm mt-1">7 AM – 7 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-10 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Helpful Resources</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services/insurance-claims/arizona"
                className="text-pink-600 hover:underline text-sm font-medium"
              >
                Arizona Glass Insurance Laws — Full Guide
              </Link>
              <Link
                href="/locations/phoenix-az"
                className="text-pink-600 hover:underline text-sm font-medium"
              >
                Phoenix Auto Glass — Local Service Page
              </Link>
              <Link
                href="/services/windshield-replacement"
                className="text-pink-600 hover:underline text-sm font-medium"
              >
                About Windshield Replacement
              </Link>
              <Link
                href="/services/insurance-claims"
                className="text-pink-600 hover:underline text-sm font-medium"
              >
                Insurance Claims Process
              </Link>
              <Link href="/locations" className="text-pink-600 hover:underline text-sm font-medium">
                All Service Locations
              </Link>
            </div>
          </div>
        </div>
      </section>
      <PhoenixClickTracker />
    </>
  );
}
