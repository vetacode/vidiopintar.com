import { db } from "@/lib/db";
import { userVideos, videos } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Markdown } from "@/components/ui/markdown";

interface UserChatsProps {
  userId: string;
}

export async function UserChats({ userId }: UserChatsProps) {
  // Get latest message for each user video
  const chats = await db
    .select({
      userVideoId: userVideos.id,
      youtubeId: userVideos.youtubeId,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      lastMessage: sql<string>`(
        SELECT content 
        FROM messages 
        WHERE user_video_id = ${userVideos.id} 
        ORDER BY created_at DESC 
        LIMIT 1
      )`,
      lastMessageTime: sql<Date>`(
        SELECT created_at 
        FROM messages 
        WHERE user_video_id = ${userVideos.id} 
        ORDER BY created_at DESC 
        LIMIT 1
      )`,
    })
    .from(userVideos)
    .innerJoin(videos, eq(userVideos.youtubeId, videos.youtubeId))
    .where(
      and(
        eq(userVideos.userId, userId),
        sql`EXISTS (SELECT 1 FROM messages WHERE user_video_id = ${userVideos.id})`
      )
    )
    .orderBy(sql`(
      SELECT created_at 
      FROM messages 
      WHERE user_video_id = ${userVideos.id} 
      ORDER BY created_at DESC 
      LIMIT 1
    ) DESC`)
    .limit(10);

  if (chats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>You haven't started any chats yet</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {chats.map((chat) => (
        <Link key={chat.userVideoId} href={`/video/${chat.youtubeId}`}>
          <Card className="py-4 shadow-none border-none cursor-pointer">
            <div className="flex gap-4">
              <img 
                src={chat.thumbnailUrl || ""} 
                alt={chat.title}
                className="w-32 h-20 object-cover rounded"
              />
              <div className="flex-1 group">
                <h3 className="font-semibold line-clamp-2 mb-1 group-hover:underline">{chat.title}</h3>
                <Markdown className="line-clamp-2 text-sm opacity-60">
                  {chat.lastMessage}
                </Markdown>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(chat.lastMessageTime))} ago
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}