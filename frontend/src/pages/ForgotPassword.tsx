import React, { useState } from 'react';
import { api } from '../services/api';
import { School, Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (path: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message);
    } catch (err: any) {
      setMessage('Password reset request completed. Check your inbox.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400">
            Enter your college email address to receive recovery instructions
          </p>
        </div>

        {message ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
            <p>{message}</p>
            <button
              onClick={() => onNavigate('/login')}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs inline-block"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
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
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Instructions</span>}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
