'use client';

import Sidebar from './Sidebar';
import AuthGuard from './AuthGuard';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 overflow-y-auto"
          style={{ marginLeft: 'var(--sidebar-w)' }}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
