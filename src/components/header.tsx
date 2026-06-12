'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

type HeaderProps = {
  title: string;
  locale: string;
  onMenuToggle?: () => void;
};

const locales = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
];

export function Header({ title, locale, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    startTransition(() => {
      router.replace(newPath);
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={locale}
          onChange={handleLocaleChange}
          disabled={isPending}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {locales.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {mounted && (
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
