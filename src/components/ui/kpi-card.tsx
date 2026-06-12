import type { ReactNode } from 'react';

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo';
};

const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    icon: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-500/20',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/20',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/20',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/20',
  },
};

const trendIcons: Record<string, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

const trendColors: Record<string, string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-slate-500 dark:text-slate-400',
};

export function KpiCard({ title, value, icon, trend, color }: KpiCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:shadow-md ${colors.ring} ring-1`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colors.bg} ${colors.icon}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <span className={`text-sm font-medium ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </span>
      </div>
    </div>
  );
}
