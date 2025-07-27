"use client";

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface PlanUsageNotificationProps {
  userId?: string;
}

interface UsageStats {
  currentPlan: 'free' | 'monthly' | 'yearly';
  unlimited: boolean;
  videosUsedToday: number;
  dailyLimit: number;
}

export function PlanUsageNotification({ userId }: PlanUsageNotificationProps) {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('planUsage');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUsageStats = async () => {
      try {
        const response = await fetch(`/api/user/usage-stats`);
        if (response.ok) {
          const stats = await response.json();
          setUsageStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageStats();
  }, [userId]);

  if (loading || !usageStats || !userId) {
    return null;
  }

  // Don't show notification for unlimited plans unless they want to see usage
  if (usageStats.unlimited) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <Crown className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          You have unlimited video processing with your {usageStats.currentPlan} plan!
        </AlertDescription>
      </Alert>
    );
  }

  // Show warning when approaching limit (80% or more used)
  const usagePercentage = (usageStats.videosUsedToday / usageStats.dailyLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usageStats.videosUsedToday >= usageStats.dailyLimit;

  if (isAtLimit) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="space-y-3">
          <div className="text-red-800 dark:text-red-200">
            You've reached your daily limit of {usageStats.dailyLimit} video{usageStats.dailyLimit > 1 ? 's' : ''}. 
            Upgrade for unlimited access or try again tomorrow.
          </div>
          <div className="flex gap-2">
            <Link href="/profile/billing">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                <Crown className="w-4 h-4 mr-1" />
                Upgrade Plan
              </Button>
            </Link>
            <div className="flex items-center text-sm text-red-700 dark:text-red-300">
              <Clock className="w-4 h-4 mr-1" />
              Resets tomorrow
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isNearLimit) {
    const remainingVideos = usageStats.dailyLimit - usageStats.videosUsedToday;
    
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="space-y-3">
          <div className="text-yellow-800 dark:text-yellow-200">
            You have {remainingVideos} video{remainingVideos > 1 ? 's' : ''} remaining for today. 
            Upgrade for unlimited access.
          </div>
          <div className="flex gap-2">
            <Link href="/profile/billing">
              <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                <Crown className="w-4 h-4 mr-1" />
                View Plans
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show regular usage info for free users
  const remainingVideos = usageStats.dailyLimit - usageStats.videosUsedToday;
  
  return (
    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <AlertDescription className="flex items-center justify-between">
        <div className="text-blue-800 dark:text-blue-200">
          {remainingVideos} of {usageStats.dailyLimit} daily video{usageStats.dailyLimit > 1 ? 's' : ''} remaining
        </div>
        <Link href="/profile/billing">
          <Button size="sm" variant="ghost" className="text-blue-700 hover:text-blue-800 hover:bg-blue-100">
            <Crown className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}