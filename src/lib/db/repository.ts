import { db } from '@/lib/db/index';
import { videos, messages, transcriptSegments, userVideos } from './schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, desc, and } from 'drizzle-orm';

// Types for user_videos
export type UserVideo = InferSelectModel<typeof userVideos>;
export type NewUserVideo = InferInsertModel<typeof userVideos>;

// Infer types from Drizzle schema
export type Video = InferSelectModel<typeof videos>;
export type NewVideo = InferInsertModel<typeof videos>;
export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export const VideoRepository = {
  // Get all user_videos for a user, joined with video details
  async getAllForUserWithDetails(userId: string) {
    return await db
      .select({
        userVideoId: userVideos.id,
        youtubeId: userVideos.youtubeId,
        title: videos.title,
        channelTitle: videos.channelTitle,
        publishedAt: videos.publishedAt,
        thumbnailUrl: videos.thumbnailUrl,
      })
      .from(userVideos)
      .innerJoin(videos, eq(userVideos.youtubeId, videos.youtubeId))
      .where(eq(userVideos.userId, userId));
  },
  // Get a video by YouTube ID
  async getByYoutubeId(youtubeId: string): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.youtubeId, youtubeId));
    return result[0];
  },

  // Create a new video
  async create(video: NewVideo): Promise<Video> {
    const result = await db.insert(videos).values(video).returning();
    return result[0];
  },

  // Upsert a video (create if not exists, update if exists)
  async upsert(video: NewVideo): Promise<Video> {
    // Check if video exists
    const existingVideo = await this.getByYoutubeId(video.youtubeId);
    
    if (existingVideo) {
      // Update existing video
      const result = await db
        .update(videos)
        .set({ ...video, updatedAt: new Date() })
        .where(eq(videos.youtubeId, video.youtubeId))
        .returning();
      return result[0];
    } else {
      // Create new video
      return await this.create(video);
    }
  },

  // Fetch all videos
  async getAll(): Promise<Video[]> {
    // Order by creation timestamp descending
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  },

  async delete(id: number): Promise<void> {
    // check if video is exists if not throw error
    const video = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id))
      .limit(1);
    if (video.length === 0) {
      throw new Error("Video not found");
    }
    await db.delete(videos).where(eq(videos.id, id));
  }
};

export const MessageRepository = {
  // Get all messages for a user_video (user-video relationship)
  async getByUserVideoId(userVideoId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userVideoId, userVideoId))
      .orderBy(messages.timestamp);
  },

  async create(message: NewMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }
};

export const UserVideoRepository = {
  // Delete a user_video by id
  async delete(id: number): Promise<void> {
    await db.delete(userVideos).where(eq(userVideos.id, id));
  },
  // Get a user_video by userId and youtubeId
  async getByUserAndYoutubeId(userId: string, youtubeId: string): Promise<UserVideo | undefined> {
    const result = await db.select().from(userVideos)
      .where(and(
        eq(userVideos.userId, userId),
        eq(userVideos.youtubeId, youtubeId)
      ));
    return result[0];
  },

  // Create a new user_video
  async create(userVideo: NewUserVideo): Promise<UserVideo> {
    const result = await db.insert(userVideos).values(userVideo).returning();
    return result[0];
  },

  // Update summary for a user_video
  async updateSummary(id: number, summary: string): Promise<UserVideo | undefined> {
    const result = await db.update(userVideos)
      .set({ summary, updatedAt: new Date() })
      .where(eq(userVideos.id, id))
      .returning();
    return result[0];
  },

  // Get all user_videos for a user
  async getAllByUser(userId: string): Promise<UserVideo[]> {
    return await db.select().from(userVideos).where(eq(userVideos.userId, userId)).orderBy(desc(userVideos.createdAt));
  },
};

export const TranscriptRepository = {
  // Get all transcript segments for a video
  async getByVideoId(videoId: string) {
    return await db
      .select()
      .from(transcriptSegments)
      .where(eq(transcriptSegments.videoId, videoId))
      .orderBy(transcriptSegments.start);
  },

  // Insert multiple segments (after deleting existing ones)
  async upsertSegments(
    videoId: string,
    segments: Array<{ start: number; end: number; text: string; isChapterStart: boolean }>
  ) {
    await db.delete(transcriptSegments).where(eq(transcriptSegments.videoId, videoId));
    if (segments.length > 0) {
      await db.insert(transcriptSegments).values(
        segments.map(segment => ({
          videoId,
          start: segment.start,
          end: segment.end,
          text: segment.text,
          isChapterStart: segment.isChapterStart,
        }))
      );
    }
  }
};
