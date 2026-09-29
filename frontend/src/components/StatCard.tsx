import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend
}) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3.5 rounded-2xl border ${colorMap[color]} shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
          {trend}
        </div>
      )}
    </div>
  );
};
