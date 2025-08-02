"use client";

import { Trophy, Medal, Award } from "lucide-react";
import { UserAchievement, getAchievementStats } from "@/lib/achievements";

interface AchievementOverviewProps {
  userAchievements: UserAchievement[];
}

export function AchievementOverview({ userAchievements }: AchievementOverviewProps) {
  const stats = getAchievementStats(userAchievements);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
        </div>
        <div className="text-2xl font-bold">{stats.completed}/{stats.total}</div>
        <div className="text-xs text-gray-500">{stats.completionRate}% complete</div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gold</span>
        </div>
        <div className="text-2xl font-bold text-yellow-600">{stats.gold}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Medal className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Silver</span>
        </div>
        <div className="text-2xl font-bold text-gray-600">{stats.silver}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Medal className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bronze</span>
        </div>
        <div className="text-2xl font-bold text-amber-600">{stats.bronze}</div>
      </div>
    </div>
  );
}