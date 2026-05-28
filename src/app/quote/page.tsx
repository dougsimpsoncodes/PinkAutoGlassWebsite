import { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import AutomatedQuoteForm from '@/components/AutomatedQuoteForm';

export const metadata: Metadata = {
  title: 'Instant Windshield Quote | Pink Auto Glass',
  description: 'Get an installed windshield replacement quote by license plate, VIN, or vehicle details. Mobile service in Colorado and Arizona.',
  alternates: {
    canonical: 'https://pinkautoglass.com/quote',
  },
};

export default function QuotePage() {
  return (
    <div className="page-top-padding">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Breadcrumbs items={[{ label: 'Quote', href: '/quote' }]} />

        <h1 className="mb-5 mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          Get an <span className="text-pink-600">INSTANT QUOTE</span> and schedule now
        </h1>

        <AutomatedQuoteForm />
      </div>
    </div>
  );
}
