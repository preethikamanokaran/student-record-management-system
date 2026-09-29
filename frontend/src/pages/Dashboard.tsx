import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Building2, 
  Award, 
  ClipboardCheck, 
  AlertTriangle, 
  ShieldAlert,
  Loader2,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-semibold text-slate-500">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-center font-semibold">
        {error || 'Unable to load dashboard metrics'}
      </div>
    );
  }

  const GENDER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];
  const DEPT_COLORS = ['#0975f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 lg:p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Campus Overview 2023-2024</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Academic Analytics & Student Metrics
          </h1>
          <p className="text-xs lg:text-sm text-blue-100 leading-relaxed font-medium">
            Real-time tracking of student enrollments, academic performance, department benchmarks, and attendance compliance across campus.
          </p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled"
          value={stats.total_students}
          subtitle={`${stats.active_students} Active | ${stats.graduated_students} Graduated`}
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Average CGPA"
          value={stats.avg_cgpa}
          subtitle="Out of 10.0 scale"
          icon={Award}
          color="emerald"
        />

        <StatCard
          title="Avg Attendance"
          value={`${stats.avg_attendance}%`}
          subtitle="Campus-wide compliance"
          icon={ClipboardCheck}
          color="indigo"
        />

        <StatCard
          title="Departments"
          value={stats.total_departments}
          subtitle={`${stats.total_courses} Specialized Courses`}
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Secondary Warning Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigate('/reports')}
          className="cursor-pointer bg-amber-500/10 border border-amber-500/20 dark:bg-amber-950/30 rounded-2xl p-5 flex items-center justify-between hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Low Attendance Warning (&lt;75%)
              </p>
              <h4 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {stats.low_attendance_count} Students
              </h4>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            View Report &rarr;
          </span>
        </div>

        <div 
          onClick={() => onNavigate('/reports')}
          className="cursor-pointer bg-rose-500/10 border border-rose-500/20 dark:bg-rose-950/30 rounded-2xl p-5 flex items-center justify-between hover:border-rose-500/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Academic Risk Alert (&lt;6.0 CGPA)
              </p>
              <h4 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {stats.academic_risk_count} Students
              </h4>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">
            View Report &rarr;
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Students by Department
              </h3>
              <p className="text-xs text-slate-500">Distribution across major engineering disciplines</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.students_by_department}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#0975f6" radius={[8, 8, 0, 0]}>
                  {stats.students_by_department.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CGPA Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                CGPA Performance Distribution
              </h3>
              <p className="text-xs text-slate-500">Grade point average breakdown</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.cgpa_distribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Students by Academic Year
              </h3>
              <p className="text-xs text-slate-500">Year 1 to Year 4 cohort strength</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.students_by_year}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gender Demographics
              </h3>
              <p className="text-xs text-slate-500">Campus gender diversity ratio</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.gender_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="gender"
                  label={((entry: any) => `${entry.gender}: ${entry.count}`) as any}
                >
                  {stats.gender_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
