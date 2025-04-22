import { db } from './index';
import { videos, messages, notes, quizzes, transcriptSegments } from './schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { eq, desc } from 'drizzle-orm';

// Infer types from Drizzle schema
type Video = InferSelectModel<typeof videos>;
type NewVideo = InferInsertModel<typeof videos>;
type Message = InferSelectModel<typeof messages>;
type NewMessage = InferInsertModel<typeof messages>;
type Note = InferSelectModel<typeof notes>;
type NewNote = InferInsertModel<typeof notes>;

export const VideoRepository = {
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
  // Get all messages for a video
  async getByVideoId(videoId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.videoId, videoId))
      .orderBy(messages.timestamp);
  },

  // Create a new message
  async create(message: NewMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }
};


export const QuizRepository = {
  // Get all quizzes for a video
  async getByVideoId(videoId: string) {
    // Replace with your actual schema/table and query logic
    // Assuming 'quizzes' table exists and has a 'videoId' field
    return await db.select().from(quizzes).where(eq(quizzes.videoId, videoId));
  },

  // Create a new quiz
  async create(quiz: any) {
    // Replace with your actual schema/table and insert logic
    const result = await db.insert(quizzes).values(quiz).returning();
    return result[0];
  }
};


export const NoteRepository = {
  // Get all notes for a video
  async getByVideoId(videoId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.videoId, videoId))
      .orderBy(notes.timestamp);
  },

  // Create a new note
  async create(note: NewNote): Promise<Note> {
    const result = await db.insert(notes).values(note).returning();
    return result[0];
  }
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
