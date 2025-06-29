import { db } from "@/lib/db";
import { user, videos, userVideos, tokenUsage } from "@/lib/db/schema";
import { messages } from "@/lib/db/schema/messages";
import { sql, gte } from "drizzle-orm";
import { TokenUsageRepository } from "@/lib/db/repository";

export type TimeRange = "7d" | "1m" | "3m";

export async function getAdminMetrics() {
  const [totalUsers, totalVideos, totalUserVideos, totalMessages, totalTokenUsage] = await Promise.all([
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(user),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(videos),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(userVideos),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages),
    db.select({ 
      totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
      totalCost: sql<string>`sum(${tokenUsage.totalCost})`,
      totalRequests: sql<number>`count(*)`
    }).from(tokenUsage),
  ]);

  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    totalVideos: totalVideos[0]?.count ?? 0,
    totalUserVideos: totalUserVideos[0]?.count ?? 0,
    totalMessages: totalMessages[0]?.count ?? 0,
    totalTokens: totalTokenUsage[0]?.totalTokens ?? 0,
    totalTokenCost: parseFloat(totalTokenUsage[0]?.totalCost ?? '0'),
    totalTokenRequests: totalTokenUsage[0]?.totalRequests ?? 0,
  };
}

export async function getTokenUsageData(timeRange: TimeRange) {
  const days = timeRange === "7d" ? 7 : timeRange === "1m" ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await TokenUsageRepository.getUsageByDateRange(startDate, new Date());
}

export async function getTokenUsageByModel() {
  return await TokenUsageRepository.getUsageByModel();
}

export async function getTokenUsageByOperation() {
  return await TokenUsageRepository.getUsageByOperation();
}

export async function getTopTokenUsers(limit = 10) {
  return await TokenUsageRepository.getTopUsers(limit);
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

export async function getLatestVideos(limit = 5) {
  const result = await db
    .select({
      id: videos.id,
      youtubeId: videos.youtubeId,
      title: videos.title,
      channelTitle: videos.channelTitle,
      thumbnailUrl: videos.thumbnailUrl,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .orderBy(sql`${videos.createdAt} DESC`)
    .limit(limit);

  return result;
}

export async function getLatestMessages(limit = 5) {
  const result = await db
    .select({
      id: messages.id,
      content: messages.content,
      role: messages.role,
      createdAt: messages.createdAt,
      userVideoId: messages.userVideoId,
      videoTitle: videos.title,
      youtubeId: videos.youtubeId,
    })
    .from(messages)
    .innerJoin(userVideos, sql`${messages.userVideoId} = ${userVideos.id}`)
    .innerJoin(videos, sql`${userVideos.youtubeId} = ${videos.youtubeId}`)
    .where(sql`${messages.role} = 'user'`)
    .orderBy(sql`${messages.createdAt} DESC`)
    .limit(limit);

  return result;
}