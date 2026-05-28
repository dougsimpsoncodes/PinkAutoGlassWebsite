import { Metadata } from 'next';
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
      {/*
        Per Doug 2026-05-28: kill the breadcrumbs and the marketing H1 on
        /quote so the price + booking form get the full screen and drive
        conversion. The form's own bordered price card carries the visual
        weight now.
      */}
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-8 lg:px-8 max-w-2xl">
        <AutomatedQuoteForm />
      </div>
    </div>
  );
}
