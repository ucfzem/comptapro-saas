'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  GitCompareArrows,
  BrainCircuit,
  ShieldCheck,
  User,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/saisie', label: 'Saisie & OCR', icon: FileText },
  { href: '/cloture', label: 'Clôture', icon: GitCompareArrows },
  { href: '/ia', label: 'Assistant IA', icon: BrainCircuit },
  { href: '/security', label: 'Sécurité', icon: ShieldCheck },
];

type SidebarProps = {
  currentPath?: string;
};

export function Sidebar({ currentPath }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'fr';
  const activePath = currentPath ?? pathname;

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    return activePath.startsWith(full);
  };

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          CP
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          ComptaPro
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
            <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              Admin ComptaPro
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              admin@comptapro.fr
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
