import { Shield, Clock, Award } from 'lucide-react';

export default function TrustSignals() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-pink-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Why Denver Trusts Pink Auto Glass
      </h3>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-pink-600" />
          </div>
          <h4 className="font-bold text-sm text-gray-900">Licensed & Insured</h4>
          <p className="text-xs text-gray-600 mt-1">Fully certified</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="font-bold text-sm text-gray-900">Same Day</h4>
          <p className="text-xs text-gray-600 mt-1">Service available</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Award className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="font-bold text-sm text-gray-900">Lifetime</h4>
          <p className="text-xs text-gray-600 mt-1">Warranty</p>
        </div>
      </div>

      {/* Insurance Logos Placeholder */}
      <div className="border-t-2 border-gray-100 pt-6">
        <p className="text-sm font-semibold text-gray-700 text-center mb-4">
          We Work With All Major Insurance Companies
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 items-center justify-items-center opacity-60">
          {/* Placeholder for insurance logos - you'll replace these with actual logo images */}
          <div className="text-xs text-gray-500 font-medium text-center">State Farm</div>
          <div className="text-xs text-gray-500 font-medium text-center">Geico</div>
          <div className="text-xs text-gray-500 font-medium text-center">Allstate</div>
          <div className="text-xs text-gray-500 font-medium text-center">Progressive</div>
          <div className="text-xs text-gray-500 font-medium text-center">USAA</div>
          <div className="text-xs text-gray-500 font-medium text-center">Farmers</div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          Most insurance covers windshield replacement with zero deductible
        </p>
      </div>
    </div>
  );
}
