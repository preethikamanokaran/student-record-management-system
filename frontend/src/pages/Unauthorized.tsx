import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface UnauthorizedProps {
  onNavigate: (path: string) => void;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          403 - Access Forbidden
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          You do not have the required role permissions to access this page or resource. Please contact your system administrator if you believe this is an error.
        </p>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
