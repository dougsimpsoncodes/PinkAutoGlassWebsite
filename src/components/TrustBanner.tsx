import { Shield, Award, Clock, ThumbsUp } from 'lucide-react';

export default function TrustBanner() {
  return (
    <section className="bg-gradient-to-r from-pink-600 to-purple-600 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
          {/* Lifetime Warranty */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3">
              <Shield className="w-8 h-8" />
            </div>
            <div className="font-bold text-lg mb-1">Lifetime Warranty</div>
            <div className="text-sm text-pink-100">On all workmanship</div>
          </div>

          {/* 4.9 Stars */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3">
              <Award className="w-8 h-8" />
            </div>
            <div className="font-bold text-lg mb-1">4.9 Star Rating</div>
            <div className="text-sm text-pink-100">200+ reviews</div>
          </div>

          {/* Same-Day Service */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3">
              <Clock className="w-8 h-8" />
            </div>
            <div className="font-bold text-lg mb-1">Same-Day Service</div>
            <div className="text-sm text-pink-100">Usually within 2 hours</div>
          </div>

          {/* Insurance Accepted */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3">
              <ThumbsUp className="w-8 h-8" />
            </div>
            <div className="font-bold text-lg mb-1">Often No Cost</div>
            <div className="text-sm text-pink-100">Most insurance claims</div>
          </div>
        </div>
      </div>
    </section>
  );
}
