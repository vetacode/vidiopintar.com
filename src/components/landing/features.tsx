'use client';

import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Features() {
    const t = useTranslations('features');
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">{t('title')}</h2>
                    <p>{t('subtitle')}</p>
                </div>

                <div className="relative mx-auto grid max-w-5xl px-6 divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">{t('items.fast.title')}</h3>
                        </div>
                        <p className="text-sm">{t('items.fast.description')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-medium">{t('items.smart.title')}</h3>
                        </div>
                        <p className="text-sm">{t('items.smart.description')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />

                            <h3 className="text-sm font-medium">{t('items.personal.title')}</h3>
                        </div>
                        <p className="text-sm">{t('items.personal.description')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4" />

                            <h3 className="text-sm font-medium">{t('items.interactive.title')}</h3>
                        </div>
                        <p className="text-sm">{t('items.interactive.description')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4" />

                            <h3 className="text-sm font-medium">{t('items.progress.title')}</h3>
                        </div>
                        <p className="text-sm">{t('items.progress.description')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />

                            <h3 className="text-sm font-medium">{t('items.effortless.title')}</h3>
                        </div>
                        <p className="text-sm">{t('items.effortless.description')}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
