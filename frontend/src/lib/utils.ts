import { ProjectStatus } from '@/types';

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  planning: { label: 'Planlama', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
  development: { label: 'Geliştirme', color: 'text-brand-700', bg: 'bg-brand-50', dot: 'bg-brand-500' },
  testing: { label: 'Test', color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  completed: { label: 'Tamamlandı', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  on_hold: { label: 'Beklemede', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'text-gray-500' },
  medium: { label: 'Orta', color: 'text-amber-600' },
  high: { label: 'Yüksek', color: 'text-red-600' },
};

export function formatCurrency(amount?: number | null): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date?: string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
