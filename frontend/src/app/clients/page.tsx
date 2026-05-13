'use client';

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import ClientFormModal from '@/components/ClientFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Client } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Plus, Search, Building2, Mail, Phone, Globe,
  Pencil, Trash2, FolderOpen, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients', search],
    queryFn: () => clientsApi.list(search || undefined).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => clientsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setModalOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => clientsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setModalOpen(false); setEditClient(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setDeleteClient(null); },
  });

  const handleSubmit = async (data: any) => {
    if (editClient) {
      await updateMutation.mutateAsync({ id: editClient.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const openEdit = (client: Client) => { setEditClient(client); setModalOpen(true); };
  const openNew = () => { setEditClient(null); setModalOpen(true); };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Müşteriler</h1>
          <p className="page-subtitle">{clients.length} müşteri kayıtlı</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={15} /> Yeni Müşteri
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          className="input pl-9"
          placeholder="İsim, e-posta veya sektör ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-5 w-2/3 rounded mb-3" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="card py-20 text-center">
          <Building2 size={40} className="text-ink-subtle mx-auto mb-3" />
          <p className="text-ink-muted font-medium">Müşteri bulunamadı</p>
          <p className="text-ink-subtle text-sm mt-1 mb-4">
            {search ? 'Arama kriterlerini değiştirin' : 'İlk müşteriyi ekleyin'}
          </p>
          {!search && (
            <button className="btn-primary btn-sm mx-auto" onClick={openNew}>
              <Plus size={13} /> Müşteri Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => openEdit(client)}
              onDelete={() => setDeleteClient(client)}
            />
          ))}
        </div>
      )}

      <ClientFormModal
        open={modalOpen}
        client={editClient}
        onClose={() => { setModalOpen(false); setEditClient(null); }}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteClient}
        title="Müşteriyi Sil"
        message={`"${deleteClient?.name}" müşterisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        onConfirm={() => deleteClient && deleteMutation.mutate(deleteClient.id)}
        onCancel={() => setDeleteClient(null)}
        loading={deleteMutation.isPending}
      />
    </AppShell>
  );
}

function ClientCard({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="card-hover p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 font-bold text-sm">{client.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-ink truncate">{client.name}</h3>
            {client.industry && <p className="text-xs text-ink-muted mt-0.5">{client.industry}</p>}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button className="btn-icon btn-sm" onClick={onEdit} title="Düzenle"><Pencil size={13} /></button>
          <button className="btn-icon btn-sm hover:!text-red-500 hover:!bg-red-50" onClick={onDelete} title="Sil"><Trash2 size={13} /></button>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-ink-muted">
        {client.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail size={11} className="text-ink-subtle flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-1.5">
            <Phone size={11} className="text-ink-subtle flex-shrink-0" />
            {client.phone}
          </div>
        )}
        {client.website && (
          <div className="flex items-center gap-1.5 truncate">
            <Globe size={11} className="text-ink-subtle flex-shrink-0" />
            <a href={client.website} target="_blank" rel="noreferrer"
              className="text-brand-600 hover:underline truncate" onClick={(e) => e.stopPropagation()}>
              {client.website.replace(/https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-surface-100">
        <div className="flex items-center gap-1 text-xs text-ink-subtle">
          <FolderOpen size={11} />
          <span>{(client as any).projectCount ?? 0} proje</span>
        </div>
        <Link href={`/clients/${client.id}`}
          className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
          Detay <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}
