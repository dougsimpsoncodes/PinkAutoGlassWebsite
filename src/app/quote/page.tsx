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
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Quote', href: '/quote' }]} />

        <div className="mb-8 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-normal text-gray-900 md:text-5xl">
            Get an installed windshield quote
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Enter a plate, VIN, or vehicle details. The quote includes mobile installation labor and standard supplies. No payment is collected online.
          </p>
        </div>

        <AutomatedQuoteForm />
      </div>
    </div>
  );
}
