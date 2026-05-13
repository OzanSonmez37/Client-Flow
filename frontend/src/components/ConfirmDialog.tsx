'use client';

import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }: Props) {
  if (!open) return null;
  return (
    <div className="dialog-overlay animate-in" onClick={onCancel}>
      <div className="dialog max-w-sm slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="text-sm text-ink-muted mt-1">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button className="btn-secondary" onClick={onCancel} disabled={loading}>
              Vazgeç
            </button>
            <button className="btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sil'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
