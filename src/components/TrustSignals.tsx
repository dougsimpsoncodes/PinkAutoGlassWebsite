import { Shield, Clock, Award, Star } from 'lucide-react';

interface TrustSignalsProps {
  visible?: boolean;
}

const REVIEWS = [
  {
    name: 'Sarah M.',
    location: 'Denver, CO',
    text: 'They came to my office and replaced my windshield during my lunch break. Incredible service!',
    rating: 5,
  },
  {
    name: 'Mike R.',
    location: 'Aurora, CO',
    text: 'Insurance covered everything. Pink Auto Glass handled the claim for me — zero hassle.',
    rating: 5,
  },
  {
    name: 'Jennifer L.',
    location: 'Lakewood, CO',
    text: 'Same day service, lifetime warranty, and the tech was super professional. Highly recommend.',
    rating: 5,
  },
];

const INSURANCE_CARRIERS = [
  'State Farm',
  'Geico',
  'Allstate',
  'Progressive',
  'USAA',
  'Farmers',
];

export default function TrustSignals({ visible = false }: TrustSignalsProps) {
  if (!visible) return null;
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-pink-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Why Denver Trusts Pink Auto Glass
      </h3>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-7 h-7 text-pink-600" />
          </div>
          <h4 className="font-bold text-sm text-gray-900">Licensed & Insured</h4>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Clock className="w-7 h-7 text-blue-600" />
          </div>
          <h4 className="font-bold text-sm text-gray-900">Same Day</h4>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-2">
            <Award className="w-7 h-7 text-purple-600" />
          </div>
          <h4 className="font-bold text-sm text-gray-900">Lifetime Warranty</h4>
        </div>
      </div>

      {/* Google Reviews */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">4.9/5 from 200+ reviews</span>
        </div>
        <div className="space-y-3">
          {REVIEWS.map((review, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 italic">&ldquo;{review.text}&rdquo;</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{review.name} — {review.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insurance Carriers */}
      <div className="border-t-2 border-gray-100 pt-4">
        <p className="text-sm font-semibold text-gray-700 text-center mb-3">
          We Work With All Major Insurance Companies
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 items-center justify-items-center">
          {INSURANCE_CARRIERS.map((carrier) => (
            <div
              key={carrier}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 text-center w-full"
            >
              {carrier}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Most insurance covers windshield replacement with zero deductible
        </p>
      </div>
    </div>
  );
}
