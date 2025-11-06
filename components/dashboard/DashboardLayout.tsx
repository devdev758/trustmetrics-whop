/**
 * Dashboard Layout Component
 *
 * Provides consistent layout with header, navigation, and content area
 */

'use client';

import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

export function DashboardLayout({
  children,
  userName,
  userEmail,
}: DashboardLayoutProps) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl font-bold text-white">TM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  TrustMetrics
                </h1>
                <p className="text-sm text-gray-500">Creator Dashboard</p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center gap-2 rounded-lg border border-gray-300',
                  'bg-white px-4 py-2 text-sm font-medium text-gray-700',
                  'hover:bg-gray-50 focus:outline-none focus:ring-2',
                  'focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            © 2024 TrustMetrics. Building trust in creator communities.
          </p>
        </div>
      </footer>
    </div>
  );
}
