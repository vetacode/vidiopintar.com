import { db } from './index';
import { videos, messages, notes, Video, NewVideo, Message, NewMessage, Note, NewNote } from './schema';
import { eq } from 'drizzle-orm';

// Video Repository
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
  }
};

// Message Repository
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

// Note Repository
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
