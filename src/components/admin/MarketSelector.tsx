'use client';

import { MapPin } from 'lucide-react';
import { useMarket, type MarketFilter } from '@/contexts/MarketContext';
import { cn } from '@/lib/utils';

const MARKET_OPTIONS: Array<{ value: MarketFilter; label: string }> = [
  { value: 'all', label: 'All Markets' },
  { value: 'colorado', label: 'Denver / CO' },
  { value: 'arizona', label: 'Phoenix / AZ' },
];

interface MarketSelectorProps {
  className?: string;
}

export default function MarketSelector({ className }: MarketSelectorProps) {
  const { market, setMarket, isHydrated } = useMarket();

  return (
    <div
      className={cn(
        'inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm',
        !isHydrated && 'opacity-50 pointer-events-none',
        className
      )}
      aria-label="Market filter"
      role="radiogroup"
    >
      <span className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <MapPin className="h-3.5 w-3.5" />
        Market
      </span>

      {MARKET_OPTIONS.map((option) => {
        const isActive = option.value === market;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={!isHydrated}
            onClick={() => setMarket(option.value)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap',
              isActive
                ? 'bg-gradient-to-r from-pink-600 to-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100',
              !isHydrated && 'cursor-not-allowed'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
