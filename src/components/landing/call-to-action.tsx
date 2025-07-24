'use client';

import { FormStartLearning } from './hero-form'
import { useTranslations } from 'next-intl'

export function CallToAction() {
    const t = useTranslations('callToAction');
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">{t('title')}</h2>
                    <p className="mt-4 mb-10">{t('subtitle')}</p>
                    <FormStartLearning />
                </div>
            </div>
        </section>
    )
}
