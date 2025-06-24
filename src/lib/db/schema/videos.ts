import { integer, pgTable, serial, text, varchar, timestamp, real, boolean, json } from 'drizzle-orm/pg-core';
import { user } from './auth';

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

export const userVideos = pgTable('user_videos', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  youtubeId: varchar('youtube_id', { length: 20 }).notNull().references(() => videos.youtubeId, { onDelete: 'cascade' }),
  summary: text('summary'),
  quickStartQuestions: json('quick_start_questions').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sharedVideos = pgTable('shared_videos', {
  id: serial('id').primaryKey(),
  youtubeId: varchar('youtube_id', { length: 20 }).notNull().references(() => videos.youtubeId, { onDelete: 'cascade' }),
  userVideoId: integer('user_video_id').notNull().references(() => userVideos.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
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
