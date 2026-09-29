import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Sun, Moon, Shield, Bell, Save } from 'lucide-react';

interface SettingsProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ showToast }) => {
  const { theme, toggleTheme } = useTheme();

  const [minAttendance, setMinAttendance] = useState(75);
  const [minCgpa, setMinCgpa] = useState(6.0);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System configuration saved successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          System Preferences & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure campus thresholds, dark mode theme preferences, and automated alert parameters
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Interface Mode</p>
              <p className="text-slate-500">Toggle between Light and Dark mode UI</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold flex items-center gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Dark Mode Enabled</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span>Light Mode Enabled</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Academic Threshold Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic & Attendance Risk Thresholds</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Minimum Mandatory Attendance (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={minAttendance}
                onChange={e => setMinAttendance(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
              <p className="text-[10px] text-slate-400 mt-1">Students below this threshold trigger low attendance warnings.</p>
            </div>

            <div>
              <label className="block font-semibold mb-1">Academic Risk CGPA Threshold</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCgpa}
                onChange={e => setMinCgpa(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
              <p className="text-[10px] text-slate-400 mt-1">Students with CGPA below this trigger academic risk warnings.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
