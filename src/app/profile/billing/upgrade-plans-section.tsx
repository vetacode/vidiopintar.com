'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, Calendar, ArrowUpRight, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UpgradePlansSectionProps {
  currentPlan: 'free' | 'monthly' | 'yearly';
  userId?: string;
}

interface ActiveSubscription {
  planType: string;
  expiresAt: string;
}

export function UpgradePlansSection({ currentPlan, userId }: UpgradePlansSectionProps) {
  const t = useTranslations('pricing');
  const tBilling = useTranslations('billing');
  const [activeSubscriptions, setActiveSubscriptions] = useState<Record<string, ActiveSubscription>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkActiveSubscriptions = async () => {
      try {
        const subscriptionChecks = await Promise.all([
          fetch(`/api/user/can-purchase-plan?plan=monthly`).then(res => res.json()),
          fetch(`/api/user/can-purchase-plan?plan=yearly`).then(res => res.json())
        ]);

        const subscriptions: Record<string, ActiveSubscription> = {};
        
        if (!subscriptionChecks[0]?.canPurchase && subscriptionChecks[0]?.activeSubscription) {
          subscriptions.monthly = subscriptionChecks[0].activeSubscription;
        }
        
        if (!subscriptionChecks[1]?.canPurchase && subscriptionChecks[1]?.activeSubscription) {
          subscriptions.yearly = subscriptionChecks[1].activeSubscription;
        }

        setActiveSubscriptions(subscriptions);
      } catch (error) {
        console.error('Failed to check active subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkActiveSubscriptions();
  }, [userId]);

  // Define available upgrade options based on current plan
  const getAvailableUpgrades = () => {
    if (currentPlan === 'yearly') return []; // Already on highest plan
    if (currentPlan === 'monthly') return ['yearly'];
    return ['monthly', 'yearly']; // free plan can upgrade to both
  };

  const availableUpgrades = getAvailableUpgrades();

  const planDetails = {
    monthly: {
      id: 'monthly',
      name: t('plans.monthly.name'),
      price: 'IDR 50,000',
      period: t('plans.monthly.period'),
      description: t('plans.monthly.description'),
      icon: Calendar,
      color: 'text-blue-500',
      popular: false,
      originalPrice: undefined,
      features: [
        t('plans.monthly.features.unlimited'),
        t('plans.monthly.features.ai'),
        t('plans.monthly.features.summaries'),
        t('plans.monthly.features.support')
      ]
    },
    yearly: {
      id: 'yearly',
      name: t('plans.yearly.name'),
      price: 'IDR 500,000',
      originalPrice: 'IDR 600,000',
      period: t('plans.yearly.period'),
      description: t('plans.yearly.description'),
      icon: Crown,
      color: 'text-yellow-500',
      popular: true,
      features: [
        t('plans.yearly.features.unlimited'),
        t('plans.yearly.features.ai'),
        t('plans.yearly.features.summaries'),
        t('plans.yearly.features.support'),
        t('plans.yearly.features.priority')
      ]
    }
  };

  if (availableUpgrades.length === 0) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {tBilling('currentPlan.premiumTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {tBilling('currentPlan.premiumDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          {tBilling('upgrade.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tBilling('upgrade.title')}</DialogTitle>
          <p className="text-muted-foreground">
            {tBilling('upgrade.subtitle')}
          </p>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {availableUpgrades.map((planId) => {
            const plan = planDetails[planId as keyof typeof planDetails];
            const IconComponent = plan.icon;

            return (
              <Card key={planId} className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-primary shadow-primary/10' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      ✨ {t('popular')}
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-gray-50 dark:bg-gray-800 ${plan.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {plan.price.split(' ')[1]}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        {plan.price.split(' ')[0]}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {plan.originalPrice.split(' ')[1]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {activeSubscriptions[plan.id] ? (
                    <div className="space-y-3">
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
                        <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-200">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Active Subscription</p>
                            <p className="text-xs mt-1">
                              Expires: {new Date(activeSubscriptions[plan.id].expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" size="lg" disabled variant="secondary">
                        Already Subscribed
                      </Button>
                    </div>
                  ) : (
                    <Link href={`/payment?plan=${plan.id}`} className="block">
                      <Button className="w-full" size="lg">
                        {tBilling('upgrade.upgradeTo')} {plan.name}
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}