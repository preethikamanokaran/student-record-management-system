import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { School, Lock, Mail, ArrowRight, Shield, UserCheck, GraduationCap, Loader2 } from 'lucide-react';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      login(res.access_token, res.user);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPwd: string) => {
    setEmail(demoEmail);
    setPassword(demoPwd);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Student Record Management System
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Authorized Portal Sign In
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase text-center tracking-wider">
            Quick Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@college.edu', 'admin123')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            >
              <Shield className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('faculty@college.edu', 'faculty123')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            >
              <UserCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold">Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student@college.edu', 'student123')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all group"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold">Student</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
