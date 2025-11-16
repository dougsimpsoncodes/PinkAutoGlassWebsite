const fs = require('fs');
const path = require('path');

// Only cities within service area:
// - 30 miles from Denver
// - 10 miles from Colorado Springs
// - 10 miles from Fort Collins
const cities = [
  // Denver Metro (within 30 miles)
  { name: 'Erie', slug: 'erie-co', zip: '80516', lat: 40.0500, lng: -105.0500, population: 40639, neighborhoods: ['Vista Ridge', 'Erie Highlands', 'Coal Ridge', 'Colliers Hill'], highlights: ['Fastest growing town in CO', 'I-25 commuter traffic', 'New housing developments'] },
  { name: 'Northglenn', slug: 'northglenn-co', zip: '80233', lat: 39.8961, lng: -104.9872, population: 38249, neighborhoods: ['Belford', 'Northglenn Marketplace', 'Thornton Crossing'], highlights: ['I-25 corridor', 'North Denver metro', 'Shopping districts'] },
  { name: 'Wheat Ridge', slug: 'wheat-ridge-co', zip: '80033', lat: 39.7661, lng: -105.0772, population: 32000, neighborhoods: ['Old Town Wheat Ridge', 'Applewood', 'Clear Creek Valley'], highlights: ['I-70 traffic', 'Gateway to mountains', 'West Denver metro'] },
  { name: 'Lafayette', slug: 'lafayette-co', zip: '80026', lat: 39.9936, lng: -105.0897, population: 30633, neighborhoods: ['Old Town Lafayette', 'Indian Peaks', 'Waneka Lake'], highlights: ['Boulder County', 'US-287 corridor', 'Growing suburb'] },
  { name: 'Louisville', slug: 'louisville-co', zip: '80027', lat: 39.9778, lng: -105.1319, population: 20712, neighborhoods: ['Old Town Louisville', 'Coal Creek', 'Harper Lake'], highlights: ['Boulder County', 'US-36 corridor', 'Tech workers'] },
  { name: 'Superior', slug: 'superior-co', zip: '80027', lat: 39.9527, lng: -105.1686, population: 13000, neighborhoods: ['Rock Creek', 'Coal Creek Ranch', 'Superior Town Center'], highlights: ['Boulder County', 'US-36 corridor', 'Tech hub proximity'] },
  { name: 'Federal Heights', slug: 'federal-heights-co', zip: '80260', lat: 39.8583, lng: -105.0153, population: 12000, neighborhoods: ['Water World area', 'Federal Boulevard'], highlights: ['I-25 access', 'North Denver metro', 'High traffic area'] },
  { name: 'Sheridan', slug: 'sheridan-co', zip: '80110', lat: 39.6472, lng: -105.0253, population: 6000, neighborhoods: ['Federal Boulevard area', 'Englewood border'], highlights: ['Central Denver metro', 'US-285 access', 'Dense population'] },
  { name: 'Greenwood Village', slug: 'greenwood-village-co', zip: '80111', lat: 39.6172, lng: -104.9508, population: 16000, neighborhoods: ['Cherry Creek South', 'Orchard Road', 'Fiddlers Green'], highlights: ['Denver Tech Center', 'I-25 corridor', 'Upscale suburb'] },
  { name: 'Lone Tree', slug: 'lone-tree-co', zip: '80124', lat: 39.5422, lng: -104.8886, population: 16000, neighborhoods: ['RidgeGate', 'Heritage Hills', 'Montecito'], highlights: ['Denver Tech Center', 'I-25/C-470', 'Business district'] },
  { name: 'Cherry Hills Village', slug: 'cherry-hills-village-co', zip: '80113', lat: 39.6394, lng: -104.9572, population: 7000, neighborhoods: ['Country Club', 'Cherry Hills Estates'], highlights: ['Upscale suburb', 'High-value homes', 'I-25 corridor'] },
  { name: 'Firestone', slug: 'firestone-co', zip: '80520', lat: 40.1500, lng: -104.9375, population: 17000, neighborhoods: ['Stonebridge', 'Barbwire Ranch', 'Settlers Village'], highlights: ['Fast growing', 'I-25 corridor', 'New construction'] },
  { name: 'Frederick', slug: 'frederick-co', zip: '80530', lat: 40.0986, lng: -104.9386, population: 14000, neighborhoods: ['Carbon Valley', 'Mirada', 'Bella Rosa'], highlights: ['I-25 corridor', 'Weld County', 'Fast growing'] },

  // Fort Collins Area (within 10 miles)
  { name: 'Johnstown', slug: 'johnstown-co', zip: '80534', lat: 40.3369, lng: -104.9108, population: 19000, neighborhoods: ['Parish', 'Thompson Crossing', 'Johnstown Center'], highlights: ['I-25 corridor', 'Near Fort Collins', 'Northern Front Range'] },
  { name: 'Timnath', slug: 'timnath-co', zip: '80547', lat: 40.5308, lng: -104.9975, population: 8000, neighborhoods: ['Riverbend', 'Sterling Ranch', 'Timnath Ranch'], highlights: ['Fast growing', 'East of Fort Collins', 'I-25 access'] },
  { name: 'Wellington', slug: 'wellington-co', zip: '80549', lat: 40.7028, lng: -105.0083, population: 11000, neighborhoods: ['Downtown Wellington', 'Bellisimo', 'Boxelder Estates'], highlights: ['North of Fort Collins', 'Rural character', 'Growing community'] },

  // Colorado Springs Area (within 10 miles)
  { name: 'Security-Widefield', slug: 'security-widefield-co', zip: '80911', lat: 38.7472, lng: -104.7208, population: 39000, neighborhoods: ['Security', 'Widefield', 'Stratmoor'], highlights: ['Fort Carson area', 'South CO Springs', 'Military community'] },
  { name: 'Fountain', slug: 'fountain-co', zip: '80817', lat: 38.6822, lng: -104.7008, population: 31000, neighborhoods: ['Fountain Mesa', 'Lorson Ranch', 'Countryside'], highlights: ['Fort Carson proximity', 'I-25 corridor', 'Military families'] },
  { name: 'Manitou Springs', slug: 'manitou-springs-co', zip: '80829', lat: 38.8581, lng: -104.9208, population: 5000, neighborhoods: ['Historic Downtown', 'Ruxton', 'Crystal Hills'], highlights: ['Tourist destination', 'Pikes Peak access', 'West of CO Springs'] },
  { name: 'Black Forest', slug: 'black-forest-co', zip: '80908', lat: 39.0022, lng: -104.6847, population: 14000, neighborhoods: ['Shoup Road area', 'Hodgen Road', 'Black Forest Estates'], highlights: ['Northeast CO Springs', 'Rural residential', 'Pine forest area'] },
];

const template = (city) => {
  const neighborhoodList = city.neighborhoods.map(n => `'${n}'`).join(', ');
  const highlightsList = city.highlights.map(h => `'${h}'`).join(', ');

  return `import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: '${city.name} Windshield Repair | Auto Glass Replacement | Same-Day | (720) 918-7465',
  description: '★★★★★ ${city.name} auto glass repair & windshield replacement. Mobile service. Often $0 with insurance. Same-day appointments. Lifetime warranty. Serving all ${city.name} neighborhoods. Call (720) 918-7465!',
  keywords: 'windshield repair ${city.name.toLowerCase()}, windshield replacement ${city.name.toLowerCase()}, auto glass ${city.name.toLowerCase()} co, mobile windshield service ${city.name.toLowerCase()}',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/${city.slug}',
  },
  openGraph: {
    title: '${city.name} Windshield Repair & Replacement CO | Pink Auto Glass',
    description: '${city.name}\\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/${city.slug}',
    type: 'website',
  },
};

export default function ${city.name.replace(/[- ]/g, '')}LocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in ${city.name}?',
      answer: 'Yes! Mobile service is our specialty in ${city.name}. We come to your home, office, or anywhere in ${city.name}. Our fully equipped mobile units serve all ${city.name} neighborhoods including ${city.neighborhoods.slice(0, 3).join(', ')}, and more.'
    },
    {
      question: 'How quickly can you replace a windshield in ${city.name}?',
      answer: 'We offer same-day windshield replacement throughout ${city.name}. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What ${city.name} neighborhoods do you serve?',
      answer: 'We serve all of ${city.name} including: ${city.neighborhoods.join(', ')}, and all other ${city.name} areas. If you\\'re anywhere in ${city.name}, we\\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in ${city.name}?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for ${city.name} residents.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: '${city.name}',
    state: 'CO',
    zipCode: '${city.zip}',
    latitude: ${city.lat},
    longitude: ${city.lng},
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: '${city.name}, CO', url: 'https://pinkautoglass.com/locations/${city.slug}' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">${city.name}, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ${city.name}'s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="${city.slug}-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: '${city.name}, CO', href: '/locations/${city.slug}' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why ${city.name} Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  ${city.name} drivers deserve reliable auto glass service. With ${city.population.toLocaleString()} residents, ${city.name}'s unique location creates specific windshield challenges. From ${city.neighborhoods[0]} to ${city.neighborhoods[1]}, Pink Auto Glass provides fast, professional windshield repair and replacement throughout ${city.name}.
                </p>
                <AboveFoldCTA location="location-${city.slug}" />
                <p className="text-lg text-gray-700 mb-4">
                  Our fully equipped mobile units serve all ${city.name} neighborhoods. We understand the unique challenges ${city.name} drivers face and provide expert windshield care tailored to your needs.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">${city.name}'s Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    ${city.highlights.map(highlight => `<li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>${highlight}</strong></span>
                    </li>`).join('\n                    ')}
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">${city.name} Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  ${city.neighborhoods.map(neighborhood => `<div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                    <span className="text-gray-700 font-medium">${neighborhood}</span>
                  </div>`).join('\n                  ')}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in ${city.name}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Same-Day Service</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Lifetime Warranty</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from ${city.name} Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in ${city.name}?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in ${city.name}. Call now for a free quote.</p>
                <CTAButtons source="${city.slug}-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get a Free Quote</h3>
                  <div className="space-y-3">
                    <a href="tel:+17209187465" className="flex items-center justify-center w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
                      <Phone className="w-5 h-5 mr-2" />
                      Call (720) 918-7465
                    </a>
                    <Link href="/book" className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Book Online
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Cities</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/denver-co" className="text-pink-600 hover:underline">Denver →</Link></li>
                    <li><Link href="/locations/aurora-co" className="text-pink-600 hover:underline">Aurora →</Link></li>
                    <li><Link href="/locations/boulder-co" className="text-pink-600 hover:underline">Boulder →</Link></li>
                    <li><Link href="/locations/colorado-springs-co" className="text-pink-600 hover:underline">Colorado Springs →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li><Link href="/services/windshield-repair" className="text-pink-600 hover:underline">Windshield Repair →</Link></li>
                    <li><Link href="/services/windshield-replacement" className="text-pink-600 hover:underline">Windshield Replacement →</Link></li>
                    <li><Link href="/services/mobile-service" className="text-pink-600 hover:underline">Mobile Service →</Link></li>
                    <li><Link href="/services/insurance-claims" className="text-pink-600 hover:underline">Insurance Claims →</Link></li>
                  </ul>
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

// Create pages
cities.forEach(city => {
  const dirPath = path.join(__dirname, '..', 'src', 'app', 'locations', city.slug);
  const filePath = path.join(dirPath, 'page.tsx');

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write page file
  fs.writeFileSync(filePath, template(city));
  console.log(`✅ Created ${city.slug}/page.tsx`);
});

console.log(`\n🎉 Successfully created ${cities.length} location pages!`);
console.log(`\nAll cities are within service area:`);
console.log(`  - Denver metro (30 mile radius): ${cities.filter(c => c.lat > 39.5 && c.lat < 40.3 && c.lng > -105.3 && c.lng < -104.5).length} cities`);
console.log(`  - Fort Collins area (10 mile radius): ${cities.filter(c => c.lat > 40.3 && c.lat < 40.8).length} cities`);
console.log(`  - Colorado Springs area (10 mile radius): ${cities.filter(c => c.lat > 38.6 && c.lat < 39.1).length} cities`);
