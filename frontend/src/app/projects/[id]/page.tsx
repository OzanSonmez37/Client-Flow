'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import ProjectFormModal from '@/components/ProjectFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types';
import { formatCurrency, formatDate, PRIORITY_CONFIG } from '@/lib/utils';
import {
  ArrowLeft, Calendar, DollarSign, Users, Building2,
  Pencil, Trash2, Clock, Flag,
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => projectsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setEditOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(id),
    onSuccess: () => router.push('/projects'),
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

  if (!project) return <AppShell><p className="text-ink-muted">Proje bulunamadı.</p></AppShell>;

  const priorityCfg = project.priority ? PRIORITY_CONFIG[project.priority] : null;

  // Duration calc
  let durationDays: number | null = null;
  if (project.startDate && project.endDate) {
    const ms = new Date(project.endDate).getTime() - new Date(project.startDate).getTime();
    durationDays = Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/projects" className="btn-ghost btn-sm inline-flex mb-4">
          <ArrowLeft size={14} /> Projelere Dön
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-ink">{project.title}</h1>
              <StatusBadge status={project.status} />
              {priorityCfg && (
                <span className={`text-xs font-medium flex items-center gap-1 ${priorityCfg.color}`}>
                  <Flag size={11} /> {priorityCfg.label}
                </span>
              )}
            </div>
            {project.client && (
              <Link href={`/clients/${project.clientId}`}
                className="text-ink-muted hover:text-brand-600 text-sm mt-1 flex items-center gap-1.5 w-fit">
                <Building2 size={13} /> {project.client.name}
              </Link>
            )}
            <p className="text-xs text-ink-subtle mt-1">Oluşturuldu: {formatDate(project.createdAt)}</p>
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
        {/* Detail info */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-ink text-sm border-b border-surface-100 pb-2">Proje Detayları</h2>

            <InfoRow icon={DollarSign} label="Bütçe" value={formatCurrency(project.budget)} />
            <InfoRow icon={Calendar} label="Başlangıç" value={formatDate(project.startDate)} />
            <InfoRow icon={Calendar} label="Bitiş" value={formatDate(project.endDate)} />
            {durationDays !== null && (
              <InfoRow icon={Clock} label="Süre" value={`${durationDays} gün`} />
            )}
          </div>

          {project.teamMembers?.length ? (
            <div className="card p-5">
              <h2 className="font-semibold text-ink text-sm border-b border-surface-100 pb-2 mb-3">
                Ekip Üyeleri
              </h2>
              <div className="space-y-2">
                {project.teamMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-700 text-xs font-bold">{member.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-ink">{member}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Description and main content */}
        <div className="lg:col-span-2 space-y-4">
          {project.description && (
            <div className="card p-5">
              <h2 className="font-semibold text-ink text-sm border-b border-surface-100 pb-2 mb-3">Açıklama</h2>
              <p className="text-ink-muted text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Status progress bar */}
          <div className="card p-5">
            <h2 className="font-semibold text-ink text-sm mb-4">İlerleme Durumu</h2>
            <div className="space-y-3">
              {(['planning', 'development', 'testing', 'completed'] as const).map((s, idx) => {
                const statusOrder = ['planning', 'development', 'testing', 'completed'];
                const currentIdx = statusOrder.indexOf(project.status);
                const stepIdx = statusOrder.indexOf(s);
                const done = currentIdx >= stepIdx;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${done ? 'bg-brand-600 text-white' : 'bg-surface-200 text-ink-subtle'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${done ? 'text-ink font-medium' : 'text-ink-subtle'}`}>
                          {['Planlama', 'Geliştirme', 'Test', 'Tamamlandı'][idx]}
                        </span>
                        {project.status === s && (
                          <span className="text-xs text-brand-600 font-medium">Mevcut aşama</span>
                        )}
                      </div>
                      {idx < 3 && (
                        <div className="mt-1.5 h-0.5 bg-surface-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${done ? 'bg-brand-500' : 'bg-transparent'}`}
                            style={{ width: done ? '100%' : '0%' }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ProjectFormModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
        loading={updateMutation.isPending}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Projeyi Sil"
        message={`"${project.title}" projesini silmek istediğinize emin misiniz?`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </AppShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-ink-subtle mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-ink-subtle">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
