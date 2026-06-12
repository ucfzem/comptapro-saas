import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'ar'],
  defaultLocale: 'fr',
  localeDetection: true,
  localePrefix: 'always',
});
