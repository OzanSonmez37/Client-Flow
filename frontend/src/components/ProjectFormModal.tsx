'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Project, Client } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Başlık zorunlu'),
  description: z.string().optional(),
  status: z.enum(['planning', 'development', 'testing', 'completed', 'on_hold']),
  budget: z.coerce.number().min(0).optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.string().optional(),
  clientId: z.string().uuid('Müşteri seçin'),
  teamMembers: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  project?: Project | null;
  defaultClientId?: string;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planlama' },
  { value: 'development', label: 'Geliştirme' },
  { value: 'testing', label: 'Test' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'on_hold', label: 'Beklemede' },
];

export default function ProjectFormModal({ open, project, defaultClientId, onClose, onSubmit, loading }: Props) {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
    enabled: open,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'planning' },
  });

  useEffect(() => {
    if (open) {
      if (project) {
        reset({
          title: project.title,
          description: project.description || '',
          status: project.status,
          budget: project.budget ?? '',
          startDate: project.startDate?.slice(0, 10) || '',
          endDate: project.endDate?.slice(0, 10) || '',
          priority: project.priority || '',
          clientId: project.clientId,
          teamMembers: project.teamMembers?.join(', ') || '',
        });
      } else {
        reset({ status: 'planning', clientId: defaultClientId || '' });
      }
    }
  }, [open, project, defaultClientId, reset]);

  const handleFormSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      budget: data.budget !== '' && data.budget != null ? Number(data.budget) : undefined,
      teamMembers: data.teamMembers
        ? data.teamMembers.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    await onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay animate-in" onClick={onClose}>
      <div className="dialog max-w-xl slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="font-semibold text-ink">{project ? 'Projeyi Düzenle' : 'Yeni Proje'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="dialog-body">
            <div>
              <label className="label">Proje Başlığı *</label>
              <input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="Proje adı" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="label">Açıklama</label>
              <textarea {...register('description')} className="input resize-none" rows={2} placeholder="Proje açıklaması..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Müşteri *</label>
                <select {...register('clientId')} className={`input ${errors.clientId ? 'input-error' : ''}`}>
                  <option value="">Müşteri seçin...</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>}
              </div>
              <div>
                <label className="label">Durum *</label>
                <select {...register('status')} className="input">
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Bütçe (₺)</label>
                <input {...register('budget')} type="number" min="0" step="1000" className="input" placeholder="0" />
              </div>
              <div>
                <label className="label">Öncelik</label>
                <select {...register('priority')} className="input">
                  <option value="">Seçin...</option>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Başlangıç Tarihi</label>
                <input {...register('startDate')} type="date" className="input" />
              </div>
              <div>
                <label className="label">Bitiş Tarihi</label>
                <input {...register('endDate')} type="date" className="input" />
              </div>
            </div>

            <div>
              <label className="label">Ekip Üyeleri</label>
              <input {...register('teamMembers')} className="input" placeholder="Ali Veli, Ayşe Kaya (virgülle ayırın)" />
              <p className="text-xs text-ink-subtle mt-1">İsimleri virgülle ayırarak girin</p>
            </div>
          </div>

          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>İptal</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : project ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
