'use client';

import { SyncProvider } from '@/contexts/SyncContext';
import { DashboardCacheProvider } from '@/contexts/DashboardCacheContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SyncProvider>
      <DashboardCacheProvider>
        {children}
      </DashboardCacheProvider>
    </SyncProvider>
  );
}
