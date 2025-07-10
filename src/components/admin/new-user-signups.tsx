"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { RetentionMetrics } from "@/types/admin";

interface NewUserSignupsProps {
  metrics: RetentionMetrics;
}

export function NewUserSignups({ metrics }: NewUserSignupsProps) {
  const signupData = [
    {
      period: "Today",
      count: metrics.newUsersToday,
      isHighlight: true,
    },
    {
      period: "This Week", 
      count: metrics.newUsersThisWeek,
      isHighlight: false,
    },
    {
      period: "This Month",
      count: metrics.newUsersThisMonth,
      isHighlight: false,
    },
  ];

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
        <CardTitle className="text-base font-semibold">New User Signups</CardTitle>
        <UserPlus className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signupData.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent/75 transition-colors">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${item.isHighlight ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {item.period}
                    </p>
                    <p className={`text-lg font-bold ${item.isHighlight ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                      {item.count}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Total Users Footer */}
          <div className="pt-2 mt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Users</span>
              <span className="font-medium text-foreground">{metrics.totalUsers}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}