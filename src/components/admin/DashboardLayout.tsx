'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Users,
  Phone,
  BarChart3,
  Star,
  Upload,
  Target,
  Globe,
  MapPinOff,
  Grid2x2,
  FileText,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Search Ads Control', href: '/admin/dashboard/search-ads-control', icon: Target },
    { name: 'Leads', href: '/admin/dashboard/leads', icon: Users },
    { name: 'Call Analytics', href: '/admin/dashboard/calls', icon: Phone },
    { name: 'Website & Traffic', href: '/admin/dashboard/website-analytics', icon: BarChart3 },
    { name: 'Satellite Sites', href: '/admin/dashboard/satellite-domains', icon: Globe },
    { name: 'External Leads', href: '/admin/dashboard/external-leads', icon: MapPinOff },
    { name: 'GridScope', href: '/admin/dashboard/gridscope', icon: Grid2x2 },
    { name: 'Google Reviews', href: '/admin/dashboard/google-reviews', icon: Star },
    { name: 'Invoice Upload', href: '/admin/dashboard/uploads', icon: Upload },
    { name: 'Invoices', href: '/admin/dashboard/invoices', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-28 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-24 h-[calc(100vh-6rem)] w-64 bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="h-full flex flex-col p-4">
          <div className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
