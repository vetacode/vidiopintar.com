'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Gift, Calendar, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CurrentPlanCardProps {
  currentPlan: 'free' | 'monthly' | 'yearly';
}

export function CurrentPlanCard({ currentPlan }: CurrentPlanCardProps) {
  const t = useTranslations('pricing');
  const tBilling = useTranslations('billing');

  const planDetails = {
    free: {
      name: t('plans.free.name'),
      price: 'Free',
      period: t('plans.free.period'),
      icon: Gift,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      features: [
        t('plans.free.features.limited'),
        t('plans.free.features.basic'),
        t('plans.free.features.summaries'),
        t('plans.free.features.community')
      ]
    },
    monthly: {
      name: t('plans.monthly.name'),
      price: 'IDR 50,000',
      period: t('plans.monthly.period'),
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      features: [
        t('plans.monthly.features.unlimited'),
        t('plans.monthly.features.ai'),
        t('plans.monthly.features.summaries'),
        t('plans.monthly.features.support')
      ]
    },
    yearly: {
      name: t('plans.yearly.name'),
      price: 'IDR 500,000',
      period: t('plans.yearly.period'),
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      features: [
        t('plans.yearly.features.unlimited'),
        t('plans.yearly.features.ai'),
        t('plans.yearly.features.summaries'),
        t('plans.yearly.features.support'),
        t('plans.yearly.features.priority')
      ]
    }
  };

  const plan = planDetails[currentPlan];
  const IconComponent = plan.icon;

  return (
    <Card className={`${plan.bgColor} border-2 shadow-none`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white dark:bg-gray-800 ${plan.color}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{tBilling('currentPlan.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{tBilling('currentPlan.description')}</p>
            </div>
          </div>
          <Badge variant={currentPlan === 'yearly' ? 'default' : currentPlan === 'monthly' ? 'secondary' : 'outline'}>
            {plan.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{plan.price}</span>
            {plan.period && <span className="text-sm text-muted-foreground">/ {plan.period}</span>}
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{tBilling('currentPlan.features')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}