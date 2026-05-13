'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FolderKanban, LogOut, ChevronRight,
  Zap, Settings, Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { classNames } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Müşteriler', icon: Users },
  { href: '/projects', label: 'Projeler', icon: FolderKanban },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-surface-200"
      style={{ width: 'var(--sidebar-w)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-surface-100">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-bold text-ink text-[15px] leading-none">ClientFlow</span>
          <p className="text-[10px] text-ink-subtle font-medium tracking-wide uppercase mt-0.5">
            {user?.role === 'admin' ? 'Admin Panel' : 'Manager Panel'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-ink-subtle uppercase tracking-widest">
          Menü
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-muted hover:bg-surface-50 hover:text-ink',
              )}
            >
              <Icon
                size={16}
                className={classNames(
                  'transition-colors',
                  active ? 'text-brand-600' : 'text-ink-subtle group-hover:text-ink-muted',
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 text-xs font-bold uppercase">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-xs text-ink-subtle truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-muted hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={15} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
