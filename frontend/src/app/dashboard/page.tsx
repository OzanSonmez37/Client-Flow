'use client';

import AppShell from '@/components/AppShell';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { DashboardStats, TimelineData } from '@/types';
import { formatCurrency, formatDate, STATUS_CONFIG } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, FolderKanban, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  planning: '#f59e0b',
  development: '#6172f3',
  testing: '#a855f7',
  completed: '#10b981',
  on_hold: '#9ca3af',
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery<TimelineData[]>({
    queryKey: ['dashboard-timeline'],
    queryFn: () => dashboardApi.timeline().then((r) => r.data),
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Genel bakış ve özet istatistikler</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={18} className="text-brand-600" />}
          iconBg="bg-brand-50"
          label="Toplam Müşteri"
          value={statsLoading ? '—' : String(stats?.totalClients ?? 0)}
          sub="Kayıtlı müşteri"
        />
        <StatCard
          icon={<FolderKanban size={18} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Toplam Proje"
          value={statsLoading ? '—' : String(stats?.totalProjects ?? 0)}
          sub="Tüm projeler"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-purple-600" />}
          iconBg="bg-purple-50"
          label="Aktif Proje"
          value={statsLoading ? '—' : String(stats?.activeProjects ?? 0)}
          sub="Geliştirme aşamasında"
        />
        <StatCard
          icon={<Wallet size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
          label="Toplam Bütçe"
          value={statsLoading ? '—' : formatCurrency(stats?.totalBudget)}
          sub="Tüm projeler toplamı"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Area chart */}
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-ink">Aylık Bütçe Trendi</h2>
              <p className="text-xs text-ink-muted mt-0.5">Son 12 ay</p>
            </div>
          </div>
          {timelineLoading ? (
            <div className="h-52 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={timeline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6172f3" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6172f3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e8f2', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(v: any) => [formatCurrency(v), 'Bütçe']}
                />
                <Area type="monotone" dataKey="budget" stroke="#6172f3" strokeWidth={2} fill="url(#budgetGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink mb-1">Durum Dağılımı</h2>
          <p className="text-xs text-ink-muted mb-4">Projelerin mevcut durumu</p>
          {statsLoading ? (
            <div className="h-52 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={stats?.statusDistribution?.map((s) => ({
                    name: STATUS_CONFIG[s.status]?.label ?? s.status,
                    value: s.count,
                    status: s.status,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats?.statusDistribution?.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLORS[s.status] || '#e4e8f2'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e8f2' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-semibold text-ink">Son Projeler</h2>
          <Link href="/projects" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium">
            Tümünü gör <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-surface-100">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
            ))
          ) : stats?.recentProjects?.length ? (
            stats.recentProjects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink group-hover:text-brand-700 truncate">{p.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5 truncate">{p.client?.name ?? '—'}</p>
                </div>
                <StatusBadge status={p.status} />
                <span className="text-xs text-ink-subtle hidden sm:block">{formatDate(p.createdAt)}</span>
              </Link>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-ink-muted text-sm">Henüz proje yok</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon, iconBg, label, value, sub }: any) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs text-ink-muted font-medium">{label}</p>
        <p className="text-2xl font-bold text-ink mt-0.5 leading-none">{value}</p>
        <p className="text-xs text-ink-subtle mt-1">{sub}</p>
      </div>
    </div>
  );
}
