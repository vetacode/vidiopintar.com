import { db } from "@/lib/db";
import { userVideos, videos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface UserVideosProps {
  userId: string;
}

export async function UserVideos({ userId }: UserVideosProps) {
  const userVideosList = await db
    .select({
      userVideoId: userVideos.id,
      youtubeId: userVideos.youtubeId,
      title: videos.title,
      channelTitle: videos.channelTitle,
      thumbnailUrl: videos.thumbnailUrl,
      createdAt: userVideos.createdAt,
    })
    .from(userVideos)
    .innerJoin(videos, eq(userVideos.youtubeId, videos.youtubeId))
    .where(eq(userVideos.userId, userId))
    .orderBy(desc(userVideos.createdAt))
    .limit(20);
  
  if (userVideosList.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>You haven't watched any videos yet</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {userVideosList.map((video) => (
        <Link key={video.userVideoId} href={`/video/${video.youtubeId}`}>
          <Card className="py-4 cursor-pointer shadow-none border-none">
            <div className="flex gap-4 group">
              <img 
                src={video.thumbnailUrl || ""} 
                alt={video.title}
                className="w-32 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-2 mb-1 group-hover:underline">{video.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {video.channelTitle}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Watched {formatDistanceToNow(new Date(video.createdAt))} ago
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}