'use client';

import { useTranslations } from 'next-intl';

export function BillingHeader() {
  const t = useTranslations('billing');

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('title')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        {t('subtitle')}
      </p>
    </div>
  );
}