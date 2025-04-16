import { pgTable, serial, text, varchar, timestamp, real, boolean } from 'drizzle-orm/pg-core';

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  youtubeId: varchar('youtube_id', { length: 20 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  channelTitle: varchar('channel_title', { length: 100 }),
  publishedAt: timestamp('published_at'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transcriptSegments = pgTable('transcript_segments', {
  id: serial('id').primaryKey(),
  videoId: varchar('video_id', { length: 32 }).notNull(),
  start: real('start').notNull(),
  end: real('end').notNull(),
  text: varchar('text', { length: 1000 }).notNull(),
  isChapterStart: boolean('is_chapter_start').notNull(),
});
