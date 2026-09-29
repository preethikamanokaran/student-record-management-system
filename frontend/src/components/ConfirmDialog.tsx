import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50">
          <AlertTriangle className="w-8 h-8 flex-shrink-0" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
