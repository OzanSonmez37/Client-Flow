'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import ClientFormModal from '@/components/ClientFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Client } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft, Mail, Phone, Globe, Building2, Pencil, Trash2,
  FolderKanban, Calendar, DollarSign, Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['client', id],
    queryFn: () => clientsApi.get(id).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => clientsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['client', id] }); setEditOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientsApi.delete(id),
    onSuccess: () => router.push('/clients'),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-48 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!client) return <AppShell><p className="text-ink-muted">Müşteri bulunamadı.</p></AppShell>;

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/clients" className="btn-ghost btn-sm inline-flex mb-4">
          <ArrowLeft size={14} /> Müşterilere Dön
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
              <span className="text-brand-700 font-bold text-xl">{client.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">{client.name}</h1>
              {client.industry && <p className="text-ink-muted mt-0.5">{client.industry}</p>}
              <p className="text-xs text-ink-subtle mt-1">Kayıt: {formatDate(client.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => setEditOpen(true)}>
              <Pencil size={13} /> Düzenle
            </button>
            <button className="btn-danger btn-sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={13} /> Sil
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-ink text-sm border-b border-surface-100 pb-2">İletişim Bilgileri</h2>
          {[
            { icon: Mail, label: 'E-posta', value: client.email },
            { icon: Phone, label: 'Telefon', value: client.phone },
            { icon: Globe, label: 'Web', value: client.website },
            { icon: Building2, label: 'Sektör', value: client.industry },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon size={14} className="text-ink-subtle mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-ink-subtle">{label}</p>
                <p className="text-sm text-ink truncate">{value || '—'}</p>
              </div>
            </div>
          ))}
          {client.notes && (
            <div className="pt-2 border-t border-surface-100">
              <p className="text-xs text-ink-subtle mb-1">Notlar</p>
              <p className="text-sm text-ink-muted">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink">
              Projeler <span className="text-ink-subtle font-normal text-sm">({client.projects?.length ?? 0})</span>
            </h2>
            <Link href={`/projects?clientId=${id}`} className="btn-secondary btn-sm">
              <Plus size={13} /> Proje Ekle
            </Link>
          </div>

          {!client.projects?.length ? (
            <div className="card py-12 text-center">
              <FolderKanban size={32} className="text-ink-subtle mx-auto mb-2" />
              <p className="text-sm text-ink-muted">Bu müşteriye ait proje yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {client.projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className="card-hover p-4 flex items-center gap-4 group block">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink group-hover:text-brand-700 truncate">{project.title}</p>
                    {project.description && (
                      <p className="text-xs text-ink-muted mt-0.5 truncate">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-subtle">
                      {project.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(project.startDate)}
                        </span>
                      )}
                      {project.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} /> {formatCurrency(project.budget)}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <ClientFormModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
        loading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Müşteriyi Sil"
        message={`"${client.name}" müşterisini silmek istediğinize emin misiniz?`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
