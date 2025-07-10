import { db } from "@/lib/db";
import { user, userVideos } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

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

export async function getRetentionMetrics(): Promise<RetentionMetrics> {
  // Get MAU, WAU, and stickiness in a single query
  const activeUsersResult = await db.execute(sql`
    WITH active_users AS (
      SELECT 
        COUNT(DISTINCT CASE WHEN uv.created_at >= NOW() - INTERVAL '7 days' THEN uv.user_id END) as wau,
        COUNT(DISTINCT CASE WHEN uv.created_at >= NOW() - INTERVAL '30 days' THEN uv.user_id END) as mau
      FROM user_videos uv
    )
    SELECT 
      wau,
      mau,
      ROUND(100.0 * wau / NULLIF(mau, 0), 1) as stickiness_ratio
    FROM active_users
  `);

  // Get user signup statistics
  const signupStatsResult = await db.execute(sql`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN 1 END) as new_users_this_month,
      COUNT(CASE WHEN created_at >= DATE_TRUNC('week', NOW()) THEN 1 END) as new_users_this_week,
      COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_users_today
    FROM "user"
  `);

  const activeUsers = activeUsersResult.rows[0] as any;
  const signupStats = signupStatsResult.rows[0] as any;

  return {
    mau: parseInt(activeUsers?.mau || '0'),
    wau: parseInt(activeUsers?.wau || '0'),
    newUsersThisMonth: parseInt(signupStats?.new_users_this_month || '0'),
    newUsersThisWeek: parseInt(signupStats?.new_users_this_week || '0'),
    newUsersToday: parseInt(signupStats?.new_users_today || '0'),
    totalUsers: parseInt(signupStats?.total_users || '0'),
    stickinessRatio: parseFloat(activeUsers?.stickiness_ratio || '0'),
  };
}

export async function getUserActivityData(): Promise<UserActivityData[]> {
  const result = await db.execute(sql`
    SELECT 
      DATE(uv.created_at) as activity_date,
      COUNT(DISTINCT uv.user_id) as active_users,
      COUNT(*) as videos_processed
    FROM user_videos uv
    WHERE uv.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY activity_date
    ORDER BY activity_date
  `);

  return result.rows.map((row: any) => ({
    activityDate: row.activity_date,
    activeUsers: parseInt(row.active_users),
    videosProcessed: parseInt(row.videos_processed),
  }));
}

export async function getUserSegmentData(): Promise<UserSegmentData> {
  // Get active users (last 30 days)
  const activeUsersResult = await db.execute(sql`
    SELECT COUNT(DISTINCT user_id) as active_users
    FROM user_videos 
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  // Get inactive users (30+ days ago)
  const inactiveUsersResult = await db.execute(sql`
    SELECT COUNT(*) as inactive_users
    FROM "user" u
    LEFT JOIN user_videos uv ON u.id = uv.user_id 
      AND uv.created_at >= NOW() - INTERVAL '30 days'
    WHERE uv.user_id IS NULL
  `);

  const activeUsers = activeUsersResult.rows[0] as any;
  const inactiveUsers = inactiveUsersResult.rows[0] as any;

  return {
    activeUsers: parseInt(activeUsers?.active_users || '0'),
    inactiveUsers: parseInt(inactiveUsers?.inactive_users || '0'),
  };
}

export async function getMonthlyActiveUsers(): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(DISTINCT user_id) as mau
    FROM user_videos 
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  return parseInt((result.rows[0] as any)?.mau || '0');
}

export async function getWeeklyActiveUsers(): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(DISTINCT user_id) as wau
    FROM user_videos 
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `);

  return parseInt((result.rows[0] as any)?.wau || '0');
}

export async function getNewUsersThisMonth(): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*) as new_users
    FROM "user" 
    WHERE created_at >= DATE_TRUNC('month', NOW())
  `);

  return parseInt((result.rows[0] as any)?.new_users || '0');
}

export interface RecentActiveUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  lastActivity: Date;
  videoCount: number;
  recentVideoCount: number;
}

export async function getRecentActiveUsers(limit: number = 10): Promise<RecentActiveUser[]> {
  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.image,
      MAX(uv.created_at) as last_activity,
      COUNT(uv.id) as video_count,
      COUNT(CASE WHEN uv.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_video_count
    FROM "user" u
    INNER JOIN user_videos uv ON u.id = uv.user_id
    WHERE uv.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY u.id, u.name, u.email, u.image
    ORDER BY last_activity DESC
    LIMIT ${limit}
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name || 'Unknown User',
    email: row.email || '',
    image: row.image,
    lastActivity: new Date(row.last_activity),
    videoCount: parseInt(row.video_count),
    recentVideoCount: parseInt(row.recent_video_count),
  }));
}