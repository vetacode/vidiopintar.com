import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, userVideos, messages, session } from "@/lib/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

async function getUsageStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const accountCreated = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, userId));

  const [
    videosProcessed,
    messagesSent,
    thisMonthVideos,
    thisMonthMessages,
    lastSession
  ] = await Promise.all([
    // Total videos processed
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(userVideos)
      .where(eq(userVideos.userId, userId)),

    // Total messages sent
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(messages)
      .innerJoin(userVideos, eq(messages.userVideoId, userVideos.id))
      .where(eq(userVideos.userId, userId)),

    // Videos this month
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(userVideos)
      .where(and(
        eq(userVideos.userId, userId),
        gte(userVideos.createdAt, startOfMonth)
      )),

    // Messages this month
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(messages)
      .innerJoin(userVideos, eq(messages.userVideoId, userVideos.id))
      .where(and(
        eq(userVideos.userId, userId),
        gte(messages.createdAt, startOfMonth)
      )),

    // Last session
    db
      .select({ updatedAt: session.updatedAt })
      .from(session)
      .where(eq(session.userId, userId))
      .orderBy(desc(session.updatedAt))
      .limit(1)
  ]);

  // Calculate account age
  const accountAge = accountCreated[0] 
    ? Math.floor((now.getTime() - new Date(accountCreated[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate active days (approximate based on distinct dates of user_videos and messages)
  const activeDaysQuery = await db
    .select({ 
      count: sql<number>`count(distinct date(${userVideos.createdAt}))`.mapWith(Number) 
    })
    .from(userVideos)
    .where(eq(userVideos.userId, userId));

  const activeDays = activeDaysQuery[0]?.count || 0;

  // Calculate weekly streak (simplified - just last 7 days activity)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentActivity = await db
    .select({ 
      count: sql<number>`count(distinct date(${userVideos.createdAt}))`.mapWith(Number) 
    })
    .from(userVideos)
    .where(and(
      eq(userVideos.userId, userId),
      gte(userVideos.createdAt, weekAgo)
    ));

  const weeklyStreak = recentActivity[0]?.count || 0;

  return {
    videosProcessed: videosProcessed[0]?.count || 0,
    messagesSent: messagesSent[0]?.count || 0,
    activeDays,
    accountAge,
    lastActive: lastSession[0]?.updatedAt ? new Date(lastSession[0].updatedAt).toLocaleDateString() : 'Never',
    thisMonthVideos: thisMonthVideos[0]?.count || 0,
    thisMonthMessages: thisMonthMessages[0]?.count || 0,
    weeklyStreak,
  };
}

export default async function UsagePage() {
  const user = await getCurrentUser();
  const usageStats = await getUsageStats(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Usage</h1>
      <div className="space-y-8">
        {/* Core Activity Metrics */}
        <div>
          <h2 className="text-lg font-medium mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{usageStats.videosProcessed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Videos Engaged</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{usageStats.messagesSent}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Conversations</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{usageStats.activeDays}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{usageStats.accountAge}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Member for</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Last Active</div>
                  <div className="font-medium">{usageStats.lastActive}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
                <div className="text-xl font-bold text-blue-600">{usageStats.thisMonthVideos}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="text-sm text-gray-600 dark:text-gray-400">Chats This Month</div>
                <div className="text-xl font-bold text-green-600">{usageStats.thisMonthMessages}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active This Week</div>
                  <div className="text-xl font-bold text-purple-600">{usageStats.weeklyStreak} days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}