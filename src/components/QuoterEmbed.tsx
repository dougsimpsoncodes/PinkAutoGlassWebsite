import { Star } from 'lucide-react';
import AutomatedQuoteForm from './AutomatedQuoteForm';

export default function QuoterEmbed() {
  return (
    <section className="bg-white py-10 border-b">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-bold leading-tight mb-5 text-slate-900 text-2xl md:text-4xl">
          <span className="block whitespace-nowrap">
            Get an <span className="text-pink-600">INSTANT QUOTE</span>
          </span>
          <span className="block">and book your install</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-7 text-sm md:text-base text-slate-600">
          <span>Lifetime warranty</span>
          <span className="inline-flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <strong className="text-slate-900">4.9 on Google</strong>
          </span>
        </div>

        <div className="text-left">
          <AutomatedQuoteForm showIntro={false} />
        </div>
      </div>
    </section>
  );
}
