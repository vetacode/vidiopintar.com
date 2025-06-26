import { db } from "@/lib/db";
import { user, videos, userVideos } from "@/lib/db/schema";
import { messages } from "@/lib/db/schema/messages";
import { sql } from "drizzle-orm";

export type TimeRange = "7d" | "1m" | "3m";

export async function getAdminMetrics() {
  const [totalUsers, totalVideos, totalUserVideos, totalMessages] = await Promise.all([
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(user),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(videos),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(userVideos),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages),
  ]);

  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    totalVideos: totalVideos[0]?.count ?? 0,
    totalUserVideos: totalUserVideos[0]?.count ?? 0,
    totalMessages: totalMessages[0]?.count ?? 0,
  };
}

export async function getUserGrowthData(timeRange: TimeRange) {
  const daysBack = timeRange === "7d" ? 7 : timeRange === "1m" ? 30 : 90;
  
  const result = await db
    .select({
      date: sql<string>`DATE("created_at")`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(user)
    .where(sql`"created_at" >= NOW() - INTERVAL '${sql.raw(daysBack.toString())} days'`)
    .groupBy(sql`DATE("created_at")`)
    .orderBy(sql`DATE("created_at")`);

  return result.map(row => ({
    date: row.date,
    users: row.count,
  }));
}

export async function getVideoAdditionsData(timeRange: TimeRange) {
  const daysBack = timeRange === "7d" ? 7 : timeRange === "1m" ? 30 : 90;
  
  const result = await db
    .select({
      date: sql<string>`DATE("created_at")`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(videos)
    .where(sql`"created_at" >= NOW() - INTERVAL '${sql.raw(daysBack.toString())} days'`)
    .groupBy(sql`DATE("created_at")`)
    .orderBy(sql`DATE("created_at")`);

  return result.map(row => ({
    date: row.date,
    videos: row.count,
  }));
}