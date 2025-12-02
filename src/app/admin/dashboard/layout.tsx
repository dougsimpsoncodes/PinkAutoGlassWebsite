'use client';

import { SyncProvider } from '@/contexts/SyncContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SyncProvider>{children}</SyncProvider>;
}
