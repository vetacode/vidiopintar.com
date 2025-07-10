export interface RetentionMetrics {
  mau: number;
  wau: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  newUsersToday: number;
  totalUsers: number;
  stickinessRatio: number;
}

export interface UserActivityData {
  activityDate: string;
  activeUsers: number;
  videosProcessed: number;
}

export interface UserSegmentData {
  activeUsers: number;
  inactiveUsers: number;
}

export interface RetentionDashboardData {
  metrics: RetentionMetrics;
  activityData: UserActivityData[];
  segments: UserSegmentData;
}