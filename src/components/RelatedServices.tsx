import Link from 'next/link';

const ALL_SERVICES = [
  { name: 'Windshield Replacement', slug: '/services/windshield-replacement', desc: 'Full replacement with OEM glass' },
  { name: 'Chip & Crack Repair', slug: '/services/windshield-repair', desc: 'Fast 30-minute repair service' },
  { name: 'ADAS Calibration', slug: '/services/adas-calibration', desc: 'Camera recalibration after replacement' },
  { name: 'Mobile Service', slug: '/services/mobile-service', desc: 'Free — we come to you' },
  { name: 'Insurance Claims', slug: '/services/insurance-claims', desc: 'We handle all paperwork' },
  { name: 'Emergency Repair', slug: '/services/emergency-windshield-repair', desc: 'Same-day 24/7 available' },
];

interface RelatedServicesProps {
  /** Slug of the current page to exclude from the list */
  currentSlug?: string;
  /** Max number of services to show */
  max?: number;
}

export default function RelatedServices({ currentSlug, max = 4 }: RelatedServicesProps) {
  const services = ALL_SERVICES
    .filter(s => s.slug !== currentSlug)
    .slice(0, max);

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Services</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={service.slug}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-pink-300 transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
