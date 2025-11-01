'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  TrendingUp,
  MousePointerClick,
  FileText,
  Users,
  Activity,
  LogOut,
  Menu,
  X,
  Zap,
  Phone
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Call Analytics', href: '/admin/dashboard/calls', icon: Phone },
    { name: 'Traffic Sources', href: '/admin/dashboard/traffic', icon: TrendingUp },
    { name: 'Conversions', href: '/admin/dashboard/conversions', icon: MousePointerClick },
    { name: 'Page Performance', href: '/admin/dashboard/pages', icon: FileText },
    { name: 'User Sessions', href: '/admin/dashboard/sessions', icon: Users },
    { name: 'Live Activity', href: '/admin/dashboard/live', icon: Activity },
    { name: 'Google Ads', href: '/admin/dashboard/google-ads', icon: Zap },
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
