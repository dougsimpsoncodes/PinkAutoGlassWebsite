'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { isMarketFilter } from '@/lib/market';

export type MarketFilter = 'all' | 'colorado' | 'arizona';

interface MarketContextValue {
  market: MarketFilter;
  isHydrated: boolean;
  setMarket: Dispatch<SetStateAction<MarketFilter>>;
}

const STORAGE_KEY = 'pag-market-filter';

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarket] = useState<MarketFilter>('all');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (isMarketFilter(storedValue)) {
      setMarket(storedValue);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, market);
  }, [isHydrated, market]);

  const value = useMemo(
    () => ({
      market,
      isHydrated,
      setMarket,
    }),
    [isHydrated, market]
  );

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);

  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }

  return context;
}
