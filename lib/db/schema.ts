import { pgTable, serial, text, varchar, timestamp, integer, uuid } from 'drizzle-orm/pg-core';

// Videos table
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

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: varchar('video_id', { length: 20 }).notNull().references(() => videos.youtubeId),
  content: text('content').notNull(),
  sender: varchar('sender', { length: 10 }).notNull(), // 'user' or 'system'
  timestamp: integer('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notes table
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: varchar('video_id', { length: 20 }).notNull().references(() => videos.youtubeId),
  content: text('content').notNull(),
  timestamp: integer('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types for TypeScript
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
