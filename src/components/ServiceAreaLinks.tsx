import Link from 'next/link';

const CO_CITIES = [
  { name: 'Denver', slug: 'denver-co' },
  { name: 'Aurora', slug: 'aurora-co' },
  { name: 'Colorado Springs', slug: 'colorado-springs-co' },
  { name: 'Boulder', slug: 'boulder-co' },
  { name: 'Fort Collins', slug: 'fort-collins-co' },
  { name: 'Lakewood', slug: 'lakewood-co' },
  { name: 'Arvada', slug: 'arvada-co' },
  { name: 'Thornton', slug: 'thornton-co' },
  { name: 'Westminster', slug: 'westminster-co' },
  { name: 'Centennial', slug: 'centennial-co' },
];

const AZ_CITIES = [
  { name: 'Phoenix', slug: 'phoenix-az' },
  { name: 'Mesa', slug: 'mesa-az' },
  { name: 'Scottsdale', slug: 'scottsdale-az' },
  { name: 'Tempe', slug: 'tempe-az' },
  { name: 'Chandler', slug: 'chandler-az' },
  { name: 'Gilbert', slug: 'gilbert-az' },
  { name: 'Glendale', slug: 'glendale-az' },
  { name: 'Peoria', slug: 'peoria-az' },
];

interface ServiceAreaLinksProps {
  heading?: string;
}

export default function ServiceAreaLinks({ heading = 'Our Service Areas' }: ServiceAreaLinksProps) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{heading}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Colorado Front Range</h3>
          <div className="flex flex-wrap gap-2">
            {CO_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/${city.slug}`}
                className="text-sm bg-pink-50 text-pink-700 hover:bg-pink-100 px-3 py-1 rounded-full transition-colors"
              >
                {city.name}
              </Link>
            ))}
            <Link
              href="/locations"
              className="text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              + 35 more cities
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Phoenix AZ Metro</h3>
          <div className="flex flex-wrap gap-2">
            {AZ_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/${city.slug}`}
                className="text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1 rounded-full transition-colors"
              >
                {city.name}
              </Link>
            ))}
            <Link
              href="/locations"
              className="text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              + 12 more cities
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
