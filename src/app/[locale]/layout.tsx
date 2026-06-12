import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { routing } from '@/routing';
import { AuthProvider } from '@/providers/auth-provider';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import type { ReactNode } from 'react';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'navigation' });
  const isRtl = locale === 'ar';
  const fontClass = isRtl ? notoSansArabic.variable : inter.variable;

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${fontClass} dark`}
      suppressHydrationWarning
    >
      <body className={`${fontClass} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AuthProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
              <Sidebar currentPath="/" />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                  title={t('pageTitle')}
                  locale={locale}
                />
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                  {children}
                </main>
              </div>
            </div>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
