import { Check, X } from 'lucide-react';

export default function WhyChooseUs() {
  const comparisonData = [
    {
      feature: 'Mobile Service',
      pinkAutoGlass: 'Available',
      competitors: 'Extra charge or not available',
      highlight: true
    },
    {
      feature: 'ADAS Calibration',
      pinkAutoGlass: 'Included when required',
      competitors: '$150-$300 extra charge',
      highlight: true
    },
    {
      feature: 'Same-Day Service',
      pinkAutoGlass: 'Available 7 days/week',
      competitors: 'Limited availability',
      highlight: false
    },
    {
      feature: 'Insurance Billing',
      pinkAutoGlass: 'We handle everything',
      competitors: 'You may need to file',
      highlight: false
    },
    {
      feature: 'Warranty',
      pinkAutoGlass: 'Lifetime on all work',
      competitors: 'Limited or 1-year',
      highlight: true
    },
    {
      feature: 'OEM Quality Glass',
      pinkAutoGlass: 'Standard (no upcharge)',
      competitors: 'Extra cost option',
      highlight: true
    },
    {
      feature: 'Price Match',
      pinkAutoGlass: 'Guaranteed',
      competitors: 'Usually not offered',
      highlight: false
    },
    {
      feature: 'Licensed & Insured',
      pinkAutoGlass: 'Fully certified',
      competitors: 'Varies',
      highlight: false
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Why Choose Pink Auto Glass?</h2>
        <p className="text-xl text-gray-600">See how we compare to other shops</p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-4 px-2 md:px-4 text-sm md:text-base font-semibold">Feature</th>
              <th className="text-center py-4 px-2 md:px-4 bg-pink-50 rounded-t-lg">
                <div className="text-sm md:text-base font-bold text-pink-600">Pink Auto Glass</div>
              </th>
              <th className="text-center py-4 px-2 md:px-4 text-sm md:text-base font-semibold text-gray-600">
                Typical Competitors
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 ${
                  item.highlight ? 'bg-pink-50/30' : ''
                }`}
              >
                <td className="py-4 px-2 md:px-4 font-medium text-sm md:text-base">
                  {item.feature}
                  {item.highlight && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold hidden md:inline">
                      Key Difference
                    </span>
                  )}
                </td>
                <td className="py-4 px-2 md:px-4 text-center bg-pink-50">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm md:text-base font-semibold text-green-700">
                      {item.pinkAutoGlass}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-2 md:px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-600">
                      {item.competitors}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-pink-600 mb-2">$0</div>
          <div className="text-sm font-semibold">Extra Mobile Service Fee</div>
          <div className="text-xs text-gray-600 mt-1">We come to you at no charge</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">Lifetime</div>
          <div className="text-sm font-semibold">Warranty Included</div>
          <div className="text-xs text-gray-600 mt-1">On all installations</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
          <div className="text-sm font-semibold">Price Match Guarantee</div>
          <div className="text-xs text-gray-600 mt-1">We beat competitor quotes</div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p className="font-semibold mb-2">The Pink Auto Glass Difference</p>
        <p>
          We believe in transparent pricing with no hidden fees. What you see is what you pay -
          mobile service, ADAS calibration, and lifetime warranty all included.
        </p>
      </div>
    </div>
  );
}
