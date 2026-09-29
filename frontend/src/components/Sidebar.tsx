import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  Building2, 
  BookOpen, 
  FileText, 
  BarChart3, 
  UserCog, 
  Settings, 
  UserCircle, 
  LogOut,
  X,
  School
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'STUDENT';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Students', path: '/students', icon: Users, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Academic Records', path: '/academic', icon: GraduationCap, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Departments', path: '/departments', icon: Building2, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Courses', path: '/courses', icon: BookOpen, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Documents', path: '/documents', icon: FileText, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'FACULTY'] },
    { label: 'Users', path: '/users', icon: UserCog, roles: ['ADMIN'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { label: 'Profile', path: '/profile', icon: UserCircle, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        {/* Header Branding */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white leading-tight tracking-wide text-sm">
                  EduRecord
                </h1>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Campus Management
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 dark:bg-blue-600 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.full_name}
              </p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                {user?.role?.toLowerCase()}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
