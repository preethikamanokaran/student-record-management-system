import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, Search, ShieldAlert, CheckCircle2, User } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'FACULTY':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Role Badge */}
        <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${getRoleBadge(user?.role)}`}>
          {user?.role}
        </div>
      </div>
    </header>
  );
};
