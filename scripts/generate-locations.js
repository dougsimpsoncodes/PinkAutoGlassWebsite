const fs = require('fs');
const path = require('path');

const locations = [
  {
    city: 'Lakewood',
    state: 'CO',
    slug: 'lakewood-co',
    zipCode: '80226',
    lat: 39.7047,
    lon: -105.0814,
    neighborhoods: ['Bear Valley', 'Green Mountain', 'Belmar', 'Applewood', 'Fox Hollow', 'Lakewood Heights', 'Villa Italia', 'Lakewood Estates', 'Red Rocks', 'Morrison Road', 'Kipling', 'Wadsworth', 'West Alameda', 'Lakewood Plaza', 'Kendrick Lake'],
    references: 'Red Rocks Amphitheatre, Bear Creek Lake, Green Mountain',
    nearbyLocations: ['Denver', 'Arvada', 'Golden', 'Westminster']
  },
  {
    city: 'Boulder',
    state: 'CO',
    slug: 'boulder-co',
    zipCode: '80301',
    lat: 40.0150,
    lon: -105.2705,
    neighborhoods: ['University Hill', 'Table Mesa', 'Gunbarrel', 'North Boulder', 'South Boulder', 'Martin Acres', 'Newlands', 'Chautauqua', 'Downtown Boulder', 'Pearl Street', 'Boulder Creek', 'Wonderland Lake', 'Niwot', 'Four Mile Canyon', 'Mapleton Hill'],
    references: 'CU Boulder, Pearl Street Mall, Flatirons',
    nearbyLocations: ['Westminster', 'Thornton', 'Denver', 'Lakewood']
  },
  {
    city: 'Highlands Ranch',
    state: 'CO',
    slug: 'highlands-ranch-co',
    zipCode: '80126',
    lat: 39.5539,
    lon: -104.9689,
    neighborhoods: ['Backcountry', 'Northridge', 'Southridge', 'Westridge', 'Highlands Ranch Town Center', 'Redstone', 'Ranch at Highlands Ranch', 'Sanctuary', 'Sterling Ranch', 'Shea Homes', 'Wildcat Reserve', 'University Hills', 'East Highlands Ranch', 'Cougar Run', 'Timbers'],
    references: 'C-470, Santa Fe Drive, planned community',
    nearbyLocations: ['Centennial', 'Littleton', 'Parker', 'Denver']
  },
  {
    city: 'Thornton',
    state: 'CO',
    slug: 'thornton-co',
    zipCode: '80229',
    lat: 39.8681,
    lon: -104.9719,
    neighborhoods: ['Heritage', 'Eastlake', 'Thornton Town Center', 'Thorncreek', 'Northglenn', 'North Washington', 'Thornton Parkway', 'Trail Winds', 'Hunters Glen', 'Belford', 'Skyline Vista', 'Margaret W Carpenter', 'Trailside', 'Alpine Vista', 'Colorado Boulevard'],
    references: 'I-25, E-470, 120th Avenue',
    nearbyLocations: ['Westminster', 'Northglenn', 'Denver', 'Aurora']
  },
  {
    city: 'Arvada',
    state: 'CO',
    slug: 'arvada-co',
    zipCode: '80002',
    lat: 39.8028,
    lon: -105.0875,
    neighborhoods: ['Olde Town Arvada', 'Candelas', 'Leyden Rock', 'Stonebridge', 'Ralston Creek', 'Berkeley Park', 'Arvada West', 'Van Bibber Creek', 'Wadsworth', 'Grandview Estates', 'Indian Tree', 'Rocky Flats', 'Plainview', 'Tallman Gulch', 'Gold Strike'],
    references: 'I-76, Wadsworth, 80th Avenue, historic downtown',
    nearbyLocations: ['Westminster', 'Lakewood', 'Denver', 'Thornton']
  },
  {
    city: 'Westminster',
    state: 'CO',
    slug: 'westminster-co',
    zipCode: '80031',
    lat: 39.8367,
    lon: -105.0372,
    neighborhoods: ['Legacy Ridge', 'Westminster Station', 'Standley Lake', 'Country Club Hills', 'McKay Lake', 'South Westminster', 'Hyland Hills', 'City Center', 'Hidden Lake', 'Amherst', 'Federal Heights', 'Sheridan Green', 'Westminster Promenade', 'Westglenn', 'Brookhill'],
    references: 'US-36, I-25, 120th Avenue, between Denver and Boulder',
    nearbyLocations: ['Thornton', 'Arvada', 'Boulder', 'Denver']
  },
  {
    city: 'Parker',
    state: 'CO',
    slug: 'parker-co',
    zipCode: '80134',
    lat: 39.5186,
    lon: -104.7614,
    neighborhoods: ['Stonegate', 'Pinery', 'Newlin Gulch', 'Pine Lane', 'Canterbury', 'Meridian', 'Cottonwood', 'Pradera', 'Stroh Ranch', 'Salisbury', 'Tallman', 'Discovery', 'Saddle Rock Golf Club', 'Hess Ranch', 'Buffalo Ridge'],
    references: 'I-25, E-470, Parker Road, southeast growth area',
    nearbyLocations: ['Centennial', 'Aurora', 'Highlands Ranch', 'Castle Rock']
  },
  {
    city: 'Centennial',
    state: 'CO',
    slug: 'centennial-co',
    zipCode: '80112',
    lat: 39.5807,
    lon: -104.8772,
    neighborhoods: ['Southglenn', 'Centennial Airport', 'Walnut Hills', 'Dry Creek', 'Piney Creek', 'Cherry Knolls', 'Willow Creek', 'Greenwood Village', 'Smoky Hill', 'Willow Spring', 'Heritage Place', 'Orchard', 'South Suburban', 'Arapahoe Road', 'Peakview'],
    references: 'I-25, E-470, Arapahoe Road, southeast quality market',
    nearbyLocations: ['Aurora', 'Parker', 'Highlands Ranch', 'Denver']
  }
];

const generateLocationPage = (loc) => {
  return `import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Repair & Replacement ${loc.city}, CO | Pink Auto Glass',
  description: 'Professional windshield repair and replacement in ${loc.city}, Colorado. Mobile service to your home or office. Same-day appointments. Call (720) 918-7465 for a free quote.',
  keywords: 'windshield repair ${loc.city.toLowerCase()}, windshield replacement ${loc.city.toLowerCase()}, auto glass ${loc.city.toLowerCase()} co',
  openGraph: {
    title: 'Windshield Repair & Replacement ${loc.city}, CO | Pink Auto Glass',
    description: '${loc.city}\\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/${loc.slug}',
    type: 'website',
  },
};

export default function ${loc.city.replace(/\s+/g, '')}LocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in ${loc.city}?',
      answer: 'Yes! Mobile service is our specialty in ${loc.city}. We come to your home, office, or anywhere in ${loc.city}. Our fully equipped mobile units serve all ${loc.city} neighborhoods.'
    },
    {
      question: 'What ${loc.city} neighborhoods do you serve?',
      answer: 'We serve all of ${loc.city} including: ${loc.neighborhoods.slice(0, 5).join(', ')}, and all other ${loc.city} neighborhoods. If you\\'re in ${loc.city}, we\\'ll come to you.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: '${loc.city}',
    state: '${loc.state}',
    zipCode: '${loc.zipCode}',
    latitude: ${loc.lat},
    longitude: ${loc.lon},
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: '${loc.city}, CO', url: 'https://pinkautoglass.com/locations/${loc.slug}' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">${loc.city}, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ${loc.city}'s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="${loc.slug}-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: '${loc.city}, CO', href: '/locations/${loc.slug}' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why ${loc.city} Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  ${loc.city} drivers deserve reliable auto glass service. From ${loc.references}, Pink Auto Glass provides fast, professional windshield repair and replacement throughout ${loc.city}. We bring our mobile service directly to you.
                </p>
                <AboveFoldCTA location="location-${loc.slug}" />
                <p className="text-lg text-gray-700 mb-4">
                  Our fully equipped mobile units serve all ${loc.city} neighborhoods. Whether you're at home, work, or anywhere in ${loc.city}, we come to you.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">${loc.city} Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  ${loc.neighborhoods.map(n => `<div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">${n}</span>
                    </div>`).join('\n                  ')}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in ${loc.city}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">From $89</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">From $299</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from ${loc.city} Customers</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-pink-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in ${loc.city}?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in ${loc.city}. Call now for a free quote.</p>
                <CTAButtons source="${loc.slug}-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Vehicles</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/vehicles/subaru-outback-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between"><span>Subaru Outback</span><span className="text-gray-600">$420</span></Link></li>
                    <li><Link href="/vehicles/honda-cr-v-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between"><span>Honda CR-V</span><span className="text-gray-600">$380</span></Link></li>
                  </ul>
                  <Link href="/services/windshield-replacement" className="block mt-4 text-blue-600 hover:underline font-semibold">View All Services →</Link>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Cities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    ${loc.nearbyLocations.map(city => `<Link href="/locations/${city.toLowerCase().replace(/\s+/g, '-')}-co" className="text-blue-600 hover:underline">${city}</Link>`).join('\n                    ')}
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d${loc.lon}!3d${loc.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="${loc.city}, CO Map"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
`;
};

// Generate all location pages
locations.forEach(loc => {
  const dir = path.join(__dirname, '..', 'src', 'app', 'locations', loc.slug);
  const filePath = path.join(dir, 'page.tsx');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, generateLocationPage(loc));
  console.log(`Generated: ${loc.slug}/page.tsx`);
});

console.log('All location pages generated successfully!');
