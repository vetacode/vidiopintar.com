import { db } from "@/lib/db";
import { sharedVideos, videos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SharedChatsList } from "./shared-chats-list";

interface SharedChatsProps {
  userId: string;
}

export async function SharedChats({ userId }: SharedChatsProps) {
  const shared = await db
    .select({
      slug: sharedVideos.slug,
      youtubeId: sharedVideos.youtubeId,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      createdAt: sharedVideos.createdAt,
    })
    .from(sharedVideos)
    .innerJoin(videos, eq(sharedVideos.youtubeId, videos.youtubeId))
    .where(eq(sharedVideos.ownerId, userId))
    .orderBy(desc(sharedVideos.createdAt))
    .limit(10);

  if (shared.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>You haven't shared any chats yet</p>
      </div>
    );
  }

  return <SharedChatsList items={shared} />;
}