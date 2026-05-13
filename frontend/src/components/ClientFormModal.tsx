'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Client } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'İsim zorunlu'),
  email: z.string().email('Geçerli e-posta').optional().or(z.literal('')),
  phone: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  client?: Client | null;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

const INDUSTRIES = [
  'Teknoloji', 'Finans', 'Sağlık', 'Eğitim', 'E-ticaret',
  'Üretim', 'Medya', 'Hukuk', 'Gayrimenkul', 'Diğer',
];

export default function ClientFormModal({ open, client, onClose, onSubmit, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(client ? {
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        industry: client.industry || '',
        website: client.website || '',
        notes: client.notes || '',
      } : {});
    }
  }, [open, client, reset]);

  if (!open) return null;

  return (
    <div className="dialog-overlay animate-in" onClick={onClose}>
      <div className="dialog slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="font-semibold text-ink">
            {client ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="dialog-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Şirket Adı *</label>
                <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Acme Corp" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">E-posta</label>
                <input {...register('email')} type="email" className="input" placeholder="ornek@sirket.com" />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input {...register('phone')} className="input" placeholder="+90 555 000 0000" />
              </div>
              <div>
                <label className="label">Sektör</label>
                <select {...register('industry')} className="input">
                  <option value="">Seçin...</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Web Sitesi</label>
                <input {...register('website')} className="input" placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <label className="label">Notlar</label>
                <textarea {...register('notes')} className="input resize-none" rows={3} placeholder="Müşteri hakkında notlar..." />
              </div>
            </div>
          </div>

          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              İptal
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : client ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
