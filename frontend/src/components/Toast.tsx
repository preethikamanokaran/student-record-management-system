import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900',
    error: 'border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900',
    info: 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900',
  };

  return (
    <div className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-center gap-3 transition-all transform animate-in slide-in-from-bottom-2 ${borders[toast.type]}`}>
      {icons[toast.type]}
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
