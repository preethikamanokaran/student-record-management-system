import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Shield, Mail, Calendar, Key } from 'lucide-react';

interface ProfileProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfilePage: React.FC<ProfileProps> = ({ showToast }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          My User Profile & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, role permissions, and active session details
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-extrabold text-2xl flex items-center justify-center">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.full_name}</h3>
            <p className="text-slate-500">{user?.email}</p>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 inline-block">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div>
            <span className="text-slate-400 font-semibold uppercase">Account ID</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">#{user?.id}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase">Account Created</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(user?.created_at || '').toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
