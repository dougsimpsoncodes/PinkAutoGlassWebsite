import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckCircle2, Phone } from 'lucide-react';
import { loadRescueQuote } from '@/lib/quote/rescue-booking';
import QuoteBookingForm from '@/components/QuoteBookingForm';

// Discount state changes over time (24h expiry) — never cache this page.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Book Your Windshield Install | Pink Auto Glass',
  robots: { index: false, follow: false },
};

const DISCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000;

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default async function RescueBookingPage({ params }: { params: { token: string } }) {
  const { quote, booking } = await loadRescueQuote(params.token);

  if (!quote || !quote.quote_total_cents) {
    redirect('/quote');
  }

  if (quote.expires_at && new Date(quote.expires_at).getTime() < Date.now()) {
    redirect('/quote');
  }

  const vehicle = [quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim]
    .filter(Boolean)
    .join(' ');
  const firstName = quote.first_name || '';

  if (booking) {
    return (
      <div className="page-top-padding">
        <div className="container mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">You&apos;re already booked!</h1>
            <p className="mt-2 text-gray-700">
              {firstName ? `${firstName}, your` : 'Your'} install for {vehicle || 'your vehicle'} is confirmed
              {booking.preferred_install_date ? ` for ${booking.preferred_install_date}` : ''}.
              Reference: <span className="font-mono font-semibold">{booking.booking_token}</span>
            </p>
            <p className="mt-3 text-sm text-gray-600">Need to change anything? Give us a call.</p>
            <a
              href="tel:+17209187465"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-3 text-base font-bold text-white hover:bg-pink-700"
            >
              <Phone className="h-5 w-5" />
              (720) 918-7465
            </a>
          </div>
        </div>
      </div>
    );
  }

  const discountActive = !!(
    quote.discount_offered_at &&
    quote.discounted_total_cents &&
    Date.now() - new Date(quote.discount_offered_at).getTime() <= DISCOUNT_WINDOW_MS
  );

  const effectiveCents = discountActive ? quote.discounted_total_cents! : quote.quote_total_cents;
  const totalDollars = dollars(effectiveCents);

  return (
    <div className="page-top-padding">
      <div className="container mx-auto max-w-2xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl border-2 border-pink-500 bg-white p-5 text-center shadow-sm">
            <div className="inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-700">
              <CheckCircle2 className="h-5 w-5" /> Installed price, we come to you
            </div>
            {discountActive ? (
              <>
                <div className="mt-2 text-2xl font-semibold text-gray-400 line-through">
                  ${dollars(quote.quote_total_cents)}
                </div>
                <div className="text-6xl font-extrabold leading-none tracking-tight text-gray-900 sm:text-7xl">
                  ${totalDollars}
                </div>
                <div className="mt-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                  10% discount applied
                </div>
              </>
            ) : (
              <div className="mt-2 text-6xl font-extrabold leading-none tracking-tight text-gray-900 sm:text-7xl">
                ${totalDollars}
              </div>
            )}
            <p className="mt-3 text-sm text-gray-600">
              for your <span className="font-semibold text-gray-900">{vehicle || 'vehicle'}</span> plus sales tax.
            </p>
            {!discountActive && quote.discount_offered_at && (
              <p className="mt-2 text-xs text-gray-500">
                The 10% offer has expired, but this price is still good — book below.
              </p>
            )}
          </div>

          <div className="mt-5 text-center">
            <div className="text-xl font-bold text-gray-900">
              {firstName ? `${firstName}, pick` : 'Pick'} your install time
            </div>
            <div className="mt-1 text-sm text-gray-600">We come to you, no shop visit.</div>
          </div>

          <div className="mt-5">
            <QuoteBookingForm
              quoteToken={quote.quote_token}
              totalDollars={totalDollars}
              initialCustomer={{ fullName: [quote.first_name, quote.last_name].filter(Boolean).join(' ') }}
              initialZip={quote.zip || undefined}
            />
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Questions? Call us at{' '}
            <a href="tel:+17209187465" className="font-semibold text-pink-600 hover:underline">
              (720) 918-7465
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
