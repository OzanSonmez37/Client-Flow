'use client';

import Sidebar from './Sidebar';
import AuthGuard from './AuthGuard';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 overflow-y-auto pt-14 lg:pt-0"
          style={{ marginLeft: '0' }}
        >
          <div className="lg:ml-[260px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}