import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, userVideos, messages, session } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

async function getUsageStats(userId: string) {
  const now = new Date();
  const accountCreated = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, userId));

  const [
    videosProcessed,
    messagesSent,
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

  return {
    videosProcessed: videosProcessed[0]?.count || 0,
    messagesSent: messagesSent[0]?.count || 0,
    activeDays,
    accountAge,
    lastActive: lastSession[0]?.updatedAt ? new Date(lastSession[0].updatedAt).toLocaleDateString() : 'Never',
  };
}

export default async function UsagePage() {
  const user = await getCurrentUser();
  const usageStats = await getUsageStats(user.id);

  return (
    <div>
      <h1 className="font-semibold mb-8">Usage</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{usageStats.videosProcessed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Videos Engaged</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{usageStats.messagesSent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{usageStats.activeDays}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{usageStats.accountAge}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Member for (days)</div>
          </div>
        </div>
        
        <div className="border-t pt-4 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last active: {usageStats.lastActive}
          </div>
        </div>
      </div>
    </div>
  );
}