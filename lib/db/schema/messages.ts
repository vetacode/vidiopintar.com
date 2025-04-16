import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { videos } from './videos';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: varchar('video_id', { length: 20 }).notNull().references(() => videos.youtubeId),
  content: text('content').notNull(),
  sender: varchar('sender', { length: 10 }).notNull(), // 'user' or 'system'
  timestamp: integer('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
