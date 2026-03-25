'use client';

import { SyncProvider } from '@/contexts/SyncContext';
import { DashboardCacheProvider } from '@/contexts/DashboardCacheContext';
import { MarketProvider } from '@/contexts/MarketContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SyncProvider>
      <DashboardCacheProvider>
        <MarketProvider>
          {children}
        </MarketProvider>
      </DashboardCacheProvider>
    </SyncProvider>
  );
}
