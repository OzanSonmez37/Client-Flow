'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import ProjectFormModal from '@/components/ProjectFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { Project, ProjectStatus } from '@/types';
import { formatCurrency, formatDate, STATUS_CONFIG } from '@/lib/utils';
import {
  Plus, Search, FolderKanban, Pencil, Trash2, ChevronRight,
  Calendar, DollarSign, Users,
} from 'lucide-react';
import Link from 'next/link';

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ProjectStatus[];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const defaultClientId = searchParams.get('clientId') || undefined;
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects', statusFilter, defaultClientId, search],
    queryFn: () =>
      projectsApi.list({
        status: statusFilter || undefined,
        clientId: defaultClientId,
        search: search || undefined,
      }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setModalOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => projectsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setModalOpen(false); setEditProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setDeleteProject(null); },
  });

  const handleSubmit = async (data: any) => {
    if (editProject) await updateMutation.mutateAsync({ id: editProject.id, data });
    else await createMutation.mutateAsync(data);
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projeler</h1>
          <p className="page-subtitle">{projects.length} proje listeleniyor</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditProject(null); setModalOpen(true); }}>
          <Plus size={15} /> Yeni Proje
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            className="input pl-9"
            placeholder="Proje ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('')}
          >
            Tümü
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects table/list */}
      {isLoading ? (
        <div className="card divide-y divide-surface-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-4 items-center">
              <div className="skeleton h-4 flex-1 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card py-20 text-center">
          <FolderKanban size={40} className="text-ink-subtle mx-auto mb-3" />
          <p className="text-ink-muted font-medium">Proje bulunamadı</p>
          <p className="text-ink-subtle text-sm mt-1 mb-4">İlk projenizi ekleyin</p>
          <button className="btn-primary btn-sm mx-auto"
            onClick={() => { setEditProject(null); setModalOpen(true); }}>
            <Plus size={13} /> Proje Ekle
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="text-left px-5 py-3 font-medium text-ink-muted text-xs uppercase tracking-wide">Proje</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wide">Müşteri</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wide">Durum</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wide hidden md:table-cell">Bütçe</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wide hidden lg:table-cell">Tarih</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-surface-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <Link href={`/projects/${project.id}`} className="font-medium text-ink hover:text-brand-700 block truncate max-w-[200px]">
                        {project.title}
                      </Link>
                      {project.teamMembers?.length ? (
                        <div className="flex items-center gap-1 text-xs text-ink-subtle mt-0.5">
                          <Users size={10} />
                          {project.teamMembers.slice(0, 2).join(', ')}
                          {project.teamMembers.length > 2 && ` +${project.teamMembers.length - 2}`}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5">
                      {project.client ? (
                        <Link href={`/clients/${project.clientId}`}
                          className="text-ink-muted hover:text-brand-600 truncate block max-w-[140px]">
                          {project.client.name}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-ink-muted">
                      {formatCurrency(project.budget)}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-ink-subtle text-xs">
                      {project.endDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(project.endDate)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn-icon btn-sm"
                          onClick={() => { setEditProject(project); setModalOpen(true); }}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn-icon btn-sm hover:!text-red-500 hover:!bg-red-50"
                          onClick={() => setDeleteProject(project)}>
                          <Trash2 size={13} />
                        </button>
                        <Link href={`/projects/${project.id}`} className="btn-icon btn-sm">
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProjectFormModal
        open={modalOpen}
        project={editProject}
        defaultClientId={defaultClientId}
        onClose={() => { setModalOpen(false); setEditProject(null); }}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteProject}
        title="Projeyi Sil"
        message={`"${deleteProject?.title}" projesini silmek istediğinize emin misiniz?`}
        onConfirm={() => deleteProject && deleteMutation.mutate(deleteProject.id)}
        onCancel={() => setDeleteProject(null)}
        loading={deleteMutation.isPending}
      />
    </AppShell>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div />}>
      <ProjectsContent />
    </Suspense>
  );
}
