import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StudentDetail } from './pages/StudentDetail';
import { AcademicRecords } from './pages/AcademicRecords';
import { AttendancePage } from './pages/Attendance';
import { Departments } from './pages/Departments';
import { Courses } from './pages/Courses';
import { DocumentsPage } from './pages/Documents';
import { Reports } from './pages/Reports';
import { UsersPage } from './pages/Users';
import { SettingsPage } from './pages/Settings';
import { ProfilePage } from './pages/Profile';
import { Unauthorized } from './pages/Unauthorized';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = { id: Math.random().toString(36).substring(2, 9), message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // If not authenticated and not on login or forgot password, default to login
  if (!isAuthenticated && currentPath !== '/forgot-password') {
    return (
      <>
        <Login onNavigate={handleNavigate} />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  if (currentPath === '/forgot-password') {
    return (
      <>
        <ForgotPassword onNavigate={handleNavigate} />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  // Parse Student Detail path e.g. /students/123
  const studentDetailMatch = currentPath.match(/^\/students\/(\d+)$/);

  const getPageTitle = (path: string) => {
    if (path.startsWith('/students/')) return 'Student Profile';
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/students': return 'Students Directory';
      case '/academic': return 'Academic Records';
      case '/attendance': return 'Attendance Records';
      case '/departments': return 'Departments';
      case '/courses': return 'Courses & Subjects';
      case '/documents': return 'Student Documents';
      case '/reports': return 'Reports & Analytics';
      case '/users': return 'User Access Management';
      case '/settings': return 'System Settings';
      case '/profile': return 'My Profile';
      case '/unauthorized': return 'Access Denied';
      default: return 'Student Record System';
    }
  };

  return (
    <Layout currentPath={currentPath} onNavigate={handleNavigate} title={getPageTitle(currentPath)}>
      {currentPath === '/dashboard' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Dashboard onNavigate={handleNavigate} />
        </ProtectedRoute>
      )}

      {currentPath === '/students' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Students onNavigate={handleNavigate} showToast={showToast} />
        </ProtectedRoute>
      )}

      {studentDetailMatch && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <StudentDetail
            studentId={Number(studentDetailMatch[1])}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        </ProtectedRoute>
      )}

      {currentPath === '/academic' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <AcademicRecords showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/attendance' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <AttendancePage showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/departments' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Departments showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/courses' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Courses showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/documents' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <DocumentsPage showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/reports' && (
        <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']} onNavigate={handleNavigate}>
          <Reports showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/users' && (
        <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={handleNavigate}>
          <UsersPage showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/settings' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <SettingsPage showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/profile' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <ProfilePage showToast={showToast} />
        </ProtectedRoute>
      )}

      {currentPath === '/unauthorized' && (
        <Unauthorized onNavigate={handleNavigate} />
      )}

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </Layout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
